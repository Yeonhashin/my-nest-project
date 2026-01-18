import request from 'supertest';
import { INestApplication } from '@nestjs/common';

export async function registerAndLogin(
  app: INestApplication,
  email: string,
  password = '1234',
  nickname = 'tester',
) {
  await request(app.getHttpServer())
    .post('/user/register')
    .send({ email, password, nickname })
    .expect(201);

  const loginRes = await request(app.getHttpServer())
    .post('/auth/login')
    .send({ email, password })
    .expect(201);

  const token = loginRes.body.access_token;

  const meRes = await request(app.getHttpServer())
    .get('/user/me')
    .set('Authorization', `Bearer ${token}`)
    .expect(200);

  return {
    token,
    userId: meRes.body.id,
    email: meRes.body.email,
  };
}

export async function createPost(
  app: INestApplication,
  token: string,
  content: string,
) {
  const res = await request(app.getHttpServer())
    .post('/post')
    .set('Authorization', `Bearer ${token}`)
    .send({ content })
    .expect(201);

    return {
      id: res.body.id,
      content: res.body.content
  };
}
