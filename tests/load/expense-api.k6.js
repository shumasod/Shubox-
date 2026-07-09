import http from 'k6/http';
import { check, group, sleep } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';

// Custom metrics
const errorRate    = new Rate('error_rate');
const expenseCreateDuration = new Trend('expense_create_duration', true);
const listDuration = new Trend('expense_list_duration', true);
const authFailures = new Counter('auth_failures');

export const options = {
  scenarios: {
    // Smoke test: 1 user, 1 minute
    smoke: {
      executor: 'constant-vus',
      vus: 1,
      duration: '1m',
      tags: { scenario: 'smoke' },
    },
    // Load test: ramp up to 50 users over 5 min, hold 10 min, ramp down
    load: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '5m', target: 50 },
        { duration: '10m', target: 50 },
        { duration: '5m', target: 0 },
      ],
      tags: { scenario: 'load' },
    },
    // Stress test: push to 200 users
    stress: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '2m', target: 100 },
        { duration: '5m', target: 200 },
        { duration: '2m', target: 0 },
      ],
      tags: { scenario: 'stress' },
    },
  },
  thresholds: {
    http_req_duration:         ['p(95)<500', 'p(99)<1000'],
    http_req_failed:           ['rate<0.01'],
    error_rate:                ['rate<0.05'],
    expense_create_duration:   ['p(95)<600'],
    expense_list_duration:     ['p(95)<300'],
  },
};

const BASE_URL  = __ENV.BASE_URL  || 'http://localhost:8000/api/v1';
const API_TOKEN = __ENV.API_TOKEN || '';

const headers = {
  'Content-Type': 'application/json',
  Accept: 'application/json',
  Authorization: `Bearer ${API_TOKEN}`,
};

export function setup() {
  // Authenticate and return token for use in default function
  const loginRes = http.post(
    `${BASE_URL}/auth/login`,
    JSON.stringify({ email: __ENV.TEST_EMAIL, password: __ENV.TEST_PASSWORD }),
    { headers: { 'Content-Type': 'application/json', Accept: 'application/json' } }
  );

  check(loginRes, { 'login succeeded': r => r.status === 200 }) ||
    authFailures.add(1);

  const token = loginRes.json('token');
  return { token };
}

export default function (data) {
  const authHeaders = {
    ...headers,
    Authorization: `Bearer ${data.token}`,
  };

  group('List expenses', () => {
    const start = Date.now();
    const res = http.get(`${BASE_URL}/expenses?per_page=20`, { headers: authHeaders });
    listDuration.add(Date.now() - start);

    const ok = check(res, {
      'list status 200':       r => r.status === 200,
      'list has data array':   r => Array.isArray(r.json('data')),
    });
    errorRate.add(!ok);
  });

  sleep(0.5);

  group('Create expense', () => {
    const payload = JSON.stringify({
      title:        `Load test expense ${Date.now()}`,
      amount:       Math.floor(Math.random() * 50000) + 1000,
      currency:     'JPY',
      category_id:  1,
      expense_date: '2024-06-15',
    });

    const start = Date.now();
    const res = http.post(`${BASE_URL}/expenses`, payload, { headers: authHeaders });
    expenseCreateDuration.add(Date.now() - start);

    const ok = check(res, {
      'create status 201': r => r.status === 201,
      'has id':            r => r.json('id') > 0,
      'status is draft':   r => r.json('status') === 'draft',
    });
    errorRate.add(!ok);

    if (ok) {
      const expenseId = res.json('id');
      sleep(0.3);

      group('Get expense detail', () => {
        const detailRes = http.get(`${BASE_URL}/expenses/${expenseId}`, { headers: authHeaders });
        check(detailRes, { 'detail status 200': r => r.status === 200 });
      });
    }
  });

  sleep(1);

  group('Report monthly', () => {
    const res = http.get(`${BASE_URL}/reports/monthly?year=2024`, { headers: authHeaders });
    check(res, {
      'report status 200':    r => r.status === 200,
      'has 12 months':        r => r.json('months') && r.json('months').length === 12,
    });
  });

  sleep(1);
}
