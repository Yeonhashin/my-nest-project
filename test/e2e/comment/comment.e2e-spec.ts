import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createTestApp } from '../common/setup';
import { registerAndLogin, createPost } from '../common/fixtures';

describe('Comment E2E', () => {
    let app: INestApplication;

    let userAToken: string;
    let userBToken: string;

    let postId: number;
    let commentId: number;

  beforeAll(async () => {
    app = await createTestApp();

    const userA = await registerAndLogin(app, 'userA@test.com');
    const userB = await registerAndLogin(app, 'userB@test.com');

    userAToken = userA.token;
    userBToken = userB.token;

    const post = await createPost(app, userAToken, 'NestJS 테스트');
    postId = post.id
  });

    afterAll(async () => {
        await app.close();
    });

    it('댓글 작성', async () => {
    const res = await request(app.getHttpServer())
    .post(`/comment/post/${postId}/comment`)
    .set('Authorization', `Bearer ${userBToken}`)
    .send({ content: '댓글입니다' })
    .expect(201);

    commentId = res.body.id;

     });
    it('댓글 수정', async () => {
    await request(app.getHttpServer())
      .patch(`/comment/${commentId}`)
      .set('Authorization', `Bearer ${userBToken}`)
      .send({ content: '수정된 댓글' })
      .expect(200);
     });

    it('작성자가 아닌 유저가 댓글 수정 시도', async () => {
    await request(app.getHttpServer())
      .patch(`/comment/${commentId}`)
      .set('Authorization', `Bearer ${userAToken}`)
      .send({ content: '수정된 댓글' })
      .expect(403);
     });

    it('작성자가 아닌 유저가 댓글 삭제 시도', async () => {
    await request(app.getHttpServer())
      .patch(`/comment/${commentId}`)
      .set('Authorization', `Bearer ${userAToken}`)
      .expect(403);
     });

    it('댓글 삭제', async () => {
    await request(app.getHttpServer())
      .delete(`/comment/${commentId}`)
      .set('Authorization', `Bearer ${userBToken}`)
      .expect(200);
    });

    it('삭제된 댓글에 대해서 수정 시도', async () => {
    await request(app.getHttpServer())
      .patch(`/comment/${commentId}`)
      .set('Authorization', `Bearer ${userBToken}`)
      .expect(404);
  });
});
