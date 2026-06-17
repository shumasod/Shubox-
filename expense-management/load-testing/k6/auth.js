import http from 'k6/http';
import { check } from 'k6';

const BASE_URL = __ENV.BASE_URL || 'http://localhost:8080';

export function login(tenantSlug = 'demo', email = 'employee@demo.example.com', password = 'password') {
  const res = http.post(
    `${BASE_URL}/api/v1/auth/login`,
    JSON.stringify({ tenant_slug: tenantSlug, email, password }),
    { headers: { 'Content-Type': 'application/json' } },
  );

  check(res, { 'login 200': (r) => r.status === 200 });

  return res.json('data.token');
}

export function authHeaders(token) {
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };
}
