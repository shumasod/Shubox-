/**
 * Stress test — push beyond expected capacity to find the breaking point.
 * Ramps aggressively to 200 VUs.
 */
import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';
import { login, authHeaders } from './auth.js';

const BASE_URL = __ENV.BASE_URL || 'http://localhost:8080';
const errorRate = new Rate('errors');

export const options = {
  stages: [
    { duration: '2m',  target: 50  },
    { duration: '3m',  target: 100 },
    { duration: '3m',  target: 150 },
    { duration: '2m',  target: 200 },
    { duration: '3m',  target: 200 },
    { duration: '2m',  target: 0   },
  ],
  thresholds: {
    http_req_failed:   ['rate<0.05'],
    http_req_duration: ['p(95)<2000'],
    errors:            ['rate<0.1'],
  },
};

export function setup() {
  return { token: login() };
}

export default function ({ token }) {
  const headers = authHeaders(token);
  const res = http.get(`${BASE_URL}/api/v1/expenses?per_page=20`, { headers });
  const ok = check(res, { '200 or 429': (r) => r.status === 200 || r.status === 429 });
  if (!ok) errorRate.add(1);
  sleep(0.5);
}
