import { app } from '../server';
import request from 'supertest';
import { createConnection } from 'typeorm';

describe("Signup api endpoint", () => {
  it("Signup", async () => {
    const connection = await createConnection();

    const result = await request(app)
    .post('/api/v1/auth/signup')
    .send({
      email: 'test_user_' + Date.now() + '@cherrypiestudio.com',
      password: '12345678',
      role: 'user',
      name: 'Test User'
    })
    .set('Content-Type', 'application/json')
    .set('Accept', 'application/json');

    expect(result.status).toEqual(201);
  });
});

describe("Signin api endpoint", () => {
  it("Signin", async () => {
    const result = await request(app)
    .post('/api/v1/auth/signin')
    .send({
      email: 'mike@cherrypiestudio.com',
      password: '12345678'
    })
    .set('Content-Type', 'application/json')
    .set('Accept', 'application/json');

    expect(result.status).toEqual(200);
  });
});