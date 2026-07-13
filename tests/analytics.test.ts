import { describe, test, expect } from 'vitest';
import request from 'supertest';
import { app } from '../src/app';

describe('Analytics Reports Endpoints', () => {
  test('GET /reports/cash-flow-statement requires authentication (401)', async () => {
    const res = await request(app).get('/reports/cash-flow-statement');
    expect(res.status).toBe(401);
  });

  test('GET /reports/budget-variance requires authentication (401)', async () => {
    const res = await request(app).get('/reports/budget-variance');
    expect(res.status).toBe(401);
  });

  test('GET /reports/sales-margin requires authentication (401)', async () => {
    const res = await request(app).get('/reports/sales-margin');
    expect(res.status).toBe(401);
  });

  test('GET /reports/stock-movement requires authentication (401)', async () => {
    const res = await request(app).get('/reports/stock-movement');
    expect(res.status).toBe(401);
  });
});
