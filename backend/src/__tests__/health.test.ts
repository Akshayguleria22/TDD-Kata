import request from 'supertest';
import app from '../app';

describe('GET /api/ping', () => {
  it('should return 200 OK with success message', async () => {
    const response = await request(app).get('/api/ping');
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: 'ok', message: 'Server is running' });
  });
});