import request from 'supertest';
import app from '../server.js';

describe('POST /api/save', () => {
  it('should save code and return id', async () => {
    const res = await request(app)
      .post('/api/save')
      .send({
        content: 'console.log("Hello, World!");',
        language: 'javascript'
      });
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('id');
  });
});

