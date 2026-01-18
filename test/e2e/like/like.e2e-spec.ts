import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createTestApp } from '../common/setup';
import { registerAndLogin, createPost } from '../common/fixtures';
import { AppModule } from 'src/app.module';
import { Test } from '@nestjs/testing';

describe('Like E2E', () => {
  let app: INestApplication;
  let tokenA: string;
  let tokenB: string;
  let postId: number;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();

    // 게시글 작성자
    const userA = await registerAndLogin(app, 'userA@test.com');
    tokenA = userA.token;

    // 좋아요 누르는 유저
    const userB = await registerAndLogin(app, 'userB@test.com');
    tokenB = userB.token;

    // 게시글 생성 (userA)
    // postId = await createPost(app, tokenA);

    const post = await createPost(app, tokenA, {
      content: 'NestJS 테스트',
    });

    postId = post.id;

  });

  afterAll(async () => {
    await app.close();
  });

  it('게시글 좋아요', async () => {
    await request(app.getHttpServer())
      .post(`/post/${postId}/like`)
      .set('Authorization', `Bearer ${tokenB}`)
      .expect(201);
  });

  it('좋아요 중복 방지', async () => {
    await request(app.getHttpServer())
      .post(`/post/${postId}/like`)
      .set('Authorization', `Bearer ${tokenB}`)
      .expect(409);
  });

  it('좋아요 취소', async () => {
    await request(app.getHttpServer())
      .delete(`/post/${postId}/like`)
      .set('Authorization', `Bearer ${tokenB}`)
      .expect(200);
  });

  it('자기 게시글에는 좋아요 불가', async () => {
    await request(app.getHttpServer())
      .post(`/post/${postId}/like`)
      .set('Authorization', `Bearer ${tokenA}`)
      .expect(403);
  });
});
