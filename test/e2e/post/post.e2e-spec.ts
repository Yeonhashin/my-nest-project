import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createTestApp } from '../common/setup';
import { registerAndLogin } from '../common/fixtures';

describe('Post E2E', () => {
  let app: INestApplication;
  let token: string;
  let postId: number;

  beforeAll(async () => {
    app = await createTestApp();

    const user = await registerAndLogin(app, 'post@test.com');
    token = user.token;
  });

  afterAll(async () => {
    await app.close();
  });

  it('게시글 작성', async () => {
    const res = await request(app.getHttpServer())
      .post('/post')
      .set('Authorization', `Bearer ${token}`)
      .send({ content: '첫 번째 게시글' })
      .expect(201);

    expect(res.body.id).toBeDefined();
    expect(res.body.content).toBe('첫 번째 게시글');

    postId = res.body.id;
  });

  it('게시글 수정', async () => {
    const res = await request(app.getHttpServer())
      .patch(`/post/${postId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ content: '수정된 게시글' })
      .expect(200);

    expect(res.body.content).toBe('수정된 게시글');
  });

  it('게시글 삭제', async () => {
    await request(app.getHttpServer())
      .delete(`/post/${postId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
  });

  it('삭제된 게시글 조회 불가', async () => {
    await request(app.getHttpServer())
      .get(`/post/${postId}`)
      .expect(404);
  });
});
