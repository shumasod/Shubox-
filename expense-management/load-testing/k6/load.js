/**
 * Load test — expected production load.
 * Ramps up to 50 VUs over 5 min, holds for 10 min, ramps down.
 */
import http from 'k6/http';
import { check, sleep } from 'k6';
import { Trend, Rate, Counter } from 'k6/metrics';
import { login, authHeaders } from './auth.js';

const BASE_URL = __ENV.BASE_URL || 'http://localhost:8080';

const expenseCreateDuration = new Trend('expense_create_duration');
const expenseListDuration   = new Trend('expense_list_duration');
const errorRate             = new Rate('errors');
const expensesCreated       = new Counter('expenses_created');

export const options = {
  stages: [
    { duration: '5m',  target: 50 },
    { duration: '10m', target: 50 },
    { duration: '2m',  target: 0  },
  ],
  thresholds: {
    http_req_failed:        ['rate<0.001'],
    http_req_duration:      ['p(95)<500', 'p(99)<1000'],
    expense_create_duration: ['p(95)<800'],
    expense_list_duration:   ['p(95)<300'],
    errors:                  ['rate<0.01'],
  },
};

export function setup() {
  return { token: login() };
}

export default function ({ token }) {
  const headers = authHeaders(token);

  // 60% list, 20% detail, 20% create
  const rand = Math.random();

  if (rand < 0.6) {
    const start = Date.now();
    const res = http.get(`${BASE_URL}/api/v1/expenses?per_page=20`, { headers });
    expenseListDuration.add(Date.now() - start);
    const ok = check(res, { 'list 200': (r) => r.status === 200 });
    if (!ok) errorRate.add(1);
  } else if (rand < 0.8) {
    const listRes = http.get(`${BASE_URL}/api/v1/expenses?per_page=5`, { headers });
    const id = listRes.json('data.0.id');
    if (id) {
      const res = http.get(`${BASE_URL}/api/v1/expenses/${id}`, { headers });
      const ok = check(res, { 'detail 200': (r) => r.status === 200 });
      if (!ok) errorRate.add(1);
    }
  } else {
    const catRes = http.get(`${BASE_URL}/api/v1/categories`, { headers });
    const categoryId = catRes.json('data.0.id');
    const start = Date.now();
    const res = http.post(
      `${BASE_URL}/api/v1/expenses`,
      JSON.stringify({
        title: `Load Test ${Date.now()}`,
        currency: 'JPY',
        items: [{ category_id: categoryId, description: '負荷テスト', amount: 5000, quantity: 1, expense_date: new Date().toISOString().split('T')[0] }],
      }),
      { headers },
    );
    expenseCreateDuration.add(Date.now() - start);
    const ok = check(res, { 'create 201': (r) => r.status === 201 });
    if (ok) expensesCreated.add(1);
    else errorRate.add(1);
  }

  sleep(1 + Math.random() * 2);
}
