# Load Testing with k6

## Prerequisites

```bash
brew install k6   # macOS
# or
winget install k6  # Windows
```

## Running tests

```bash
# Smoke test (1 VU, 1 min)
BASE_URL=https://staging.example.com/api/v1 \
TEST_EMAIL=loadtest@example.com \
TEST_PASSWORD=secret \
k6 run --env BASE_URL=$BASE_URL tests/load/expense-api.k6.js \
  --scenario smoke

# Load test with HTML report
k6 run tests/load/expense-api.k6.js \
  --scenario load \
  --out json=results/load-$(date +%Y%m%d).json

# Stress test
k6 run tests/load/expense-api.k6.js --scenario stress
```

## Thresholds

| Metric | Threshold |
|--------|----------|
| p(95) response time | < 500ms |
| p(99) response time | < 1000ms |
| Error rate | < 1% |
| Expense create p(95) | < 600ms |
| List p(95) | < 300ms |
