/**
 * Smoke test — minimal load to verify the system is functional.
 * 1 VU, 1 minute. All checks must pass.
 */
import http from 'k6/http';
import { check, sleep } from 'k6';
import { login, authHeaders } from './auth.js';

const BASE_URL = __ENV.BASE_URL || 'http://localhost:8080';

export const options = {
  vus: 1,
  duration: '1m',
  thresholds: {
    http_req_failed:   ['rate<0.01'],
    http_req_duration: ['p(95)<500'],
  },
};

export default function () {
  const token = login();
  const headers = authHeaders(token);

  // List expenses
  const listRes = http.get(`${BASE_URL}/api/v1/expenses`, { headers });
  check(listRes, { 'list 200': (r) => r.status === 200 });

  // Get categories
  const catRes = http.get(`${BASE_URL}/api/v1/categories`, { headers });
  check(catRes, { 'categories 200': (r) => r.status === 200 });

  // Create expense
  const categoryId = catRes.json('data.0.id');
  const createRes = http.post(
    `${BASE_URL}/api/v1/expenses`,
    JSON.stringify({
      title: `Smoke Test Expense ${Date.now()}`,
      currency: 'JPY',
      items: [{
        category_id:  categoryId,
        description:  'スモークテスト明細',
        amount:       1000,
        quantity:     1,
        expense_date: new Date().toISOString().split('T')[0],
      }],
    }),
    { headers },
  );
  check(createRes, { 'create 201': (r) => r.status === 201 });

  sleep(1);
}
