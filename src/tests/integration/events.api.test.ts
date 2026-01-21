import jwt from 'jsonwebtoken';
import request from 'supertest';
import { beforeAll, describe, expect, it } from 'vitest';

import { createMockApp } from '../mocks.js';

describe('POST /api/v1/events (integration)', () => {
  const JWT_SECRET = 'test-jwt-secret';
  const userPayload = {
    email: 'user@example.com',
    id: 1,
    name: 'Test User',
    role: 'user',
  };
  const token = jwt.sign(userPayload, JWT_SECRET);
  const app = createMockApp();

  beforeAll(() => {
    process.env.JWT_SECRET = JWT_SECRET;
  });

  it('accepts a valid event and returns 202 with correlationId', async () => {
    const response = await request(app)
      .post('/api/v1/events')
      .set('authorization', `Bearer ${token}`)
      .send({
        context: {
          campaign: 'winter-sale',
          url: '/products',
        },
        eventType: 'page_view',
        timestamp: new Date().toISOString(),
        userId: 'user-123',
      });

    expect(response.status).toBe(202);
    expect(response.body).toEqual({ status: 'accepted' });

    expect(response.headers['x-correlation-id']).toBeDefined();
    expect(typeof response.headers['x-correlation-id']).toBe('string');
  });

  it('returns 400 for invalid payload', async () => {
    const response = await request(app)
      .post('/api/v1/events')
      .set('authorization', `Bearer ${token}`)
      .send({
        eventType: 'unknown_event',
      });

    expect(response.status).toBe(400);
    expect(response.body.errors).toBeDefined();
    expect(response.body.items).toBeDefined();
  });

  it('returns 401 when API key is missing', async () => {
    const response = await request(app).post('/api/v1/events').send({
      eventType: 'page_view',
      timestamp: new Date().toISOString(),
      userId: 'user-123',
    });

    expect(response.status).toBe(401);
  });
});
