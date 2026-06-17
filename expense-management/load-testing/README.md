# Load Testing with k6

Scenarios:

| File | VUs | Duration | Purpose |
|------|-----|----------|---------|
| `smoke.js`  | 1   | 1m   | Baseline sanity check |
| `load.js`   | 50  | 17m  | Expected production load |
| `stress.js` | 200 | 15m  | Find breaking point |
| `soak.js`   | 30  | 4h   | Detect degradation over time |

## Running

```bash
# Smoke
BASE_URL=https://api.example.com k6 run load-testing/k6/smoke.js

# Load
BASE_URL=https://api.example.com k6 run load-testing/k6/load.js

# Stress
BASE_URL=https://api.example.com k6 run load-testing/k6/stress.js

# Soak (long-running)
BASE_URL=https://api.example.com k6 run load-testing/k6/soak.js
```

## SLO Targets

- Error rate < 0.1%
- p95 response time < 500ms
- p99 response time < 1000ms
- Availability > 99.9%
