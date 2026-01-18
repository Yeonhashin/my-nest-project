import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createTestApp } from '../common/setup';
import { registerAndLogin } from '../common/fixtures';

describe('Follow E2E', () => {
  let app: INestApplication;

  let userAToken: string;
  let userAId: number;

  let userBToken: string;
  let userBId: number;

  beforeAll(async () => {
    app = await createTestApp();

    const userA = await registerAndLogin(app, 'userA@test.com');
    const userB = await registerAndLogin(app, 'userB@test.com');

    userAToken = userA.token;
    userAId = userA.userId;

    userBToken = userB.token;
    userBId = userB.userId;
  });

  afterAll(async () => {
    await app.close();
  });

  it('유저 팔로우', async () => {
    await request(app.getHttpServer())
      .post(`/follow/${userBId}`)
      .set('Authorization', `Bearer ${userAToken}`)
      .expect(201);
  });

  it('팔로우 중복 방지', async () => {
    await request(app.getHttpServer())
      .post(`/follow/${userBId}`)
      .set('Authorization', `Bearer ${userAToken}`)
      .expect(409);
  });

  it('언팔로우', async () => {
    await request(app.getHttpServer())
      .delete(`/follow/${userBId}`)
      .set('Authorization', `Bearer ${userAToken}`)
      .expect(200);
  });
});
