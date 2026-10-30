/**
 * Soak test — steady load over a long duration to detect memory leaks / degradation.
 * 30 VUs for 4 hours.
 */
import http from 'k6/http';
import { check, sleep } from 'k6';
import { Trend } from 'k6/metrics';
import { login, authHeaders } from './auth.js';

const BASE_URL = __ENV.BASE_URL || 'http://localhost:8080';
const listDuration = new Trend('list_duration');

export const options = {
  stages: [
    { duration: '5m',   target: 30  },
    { duration: '230m', target: 30  },
    { duration: '5m',   target: 0   },
  ],
  thresholds: {
    http_req_failed:   ['rate<0.001'],
    http_req_duration: ['p(95)<600'],
    list_duration:     ['p(95)<400'],
  },
};

export function setup() {
  return { token: login() };
}

export default function ({ token }) {
  const headers = authHeaders(token);

  const start = Date.now();
  const res = http.get(`${BASE_URL}/api/v1/expenses?per_page=20`, { headers });
  listDuration.add(Date.now() - start);
  check(res, { 'list 200': (r) => r.status === 200 });

  sleep(2 + Math.random());
}
