import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createTestApp } from '../common/setup';
import { registerAndLogin, createPost } from '../common/fixtures';

describe('Search E2E', () => {
  let app: INestApplication;
  let token: string;

  beforeAll(async () => {
    app = await createTestApp();

    const user = await registerAndLogin(app, 'userA@test.com');

    token = user.token;

    await createPost(app, token, 'NestJS 테스트');
    await createPost(app, token, 'Spring 테스트');
  });

  afterAll(async () => {
    await app.close();
  });

    it('게시글 검색', async () => {
    const res = await request(app.getHttpServer())
        .get('/search')
        .query({
        keyword: 'NestJS',
        target: 'post',
        page: 1,
        limit: 10,
        })
        .expect(200);
    
    expect(res.body.posts.data.length).toBeGreaterThan(0);
    expect(res.body.posts.data[0].content).toContain('NestJS');

  });
});
