import { describe, test, expect } from 'vitest';
import request from 'supertest';
import { app } from '../src/app';

describe('Dashboard Trend Endpoint', () => {
  test('GET /reports/dashboard/trend requires authentication (401)', async () => {
    const res = await request(app).get('/reports/dashboard/trend');
    expect(res.status).toBe(401);
  });
});
