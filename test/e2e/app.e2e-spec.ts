import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../../src/app.module';

describe('E2E Test', () => {
  let app: INestApplication;

  let accessTokenUser1: string;
  let accessTokenUser2: string;
  let postId: number;
  let commentId: number;

  beforeAll(async () => {
    const moduleFixture: TestingModule =
      await Test.createTestingModule({
        imports: [AppModule],
      }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    await request(app.getHttpServer())
      .post('/user/register')
      .send({
        email: 'user1@test.com',
        password: 'test1234',
        nickname: 'user1',
      });

    await request(app.getHttpServer())
      .post('/user/register')
      .send({
        email: 'user2@test.com',
        password: 'test1234',
        nickname: 'user2',
      });

    const login1 = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'user1@test.com', password: 'test1234' });

    accessTokenUser1 = login1.body.access_token;

    const login2 = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'user2@test.com', password: 'test1234' });

    accessTokenUser2 = login2.body.access_token;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Auth E2E', () => {
    it('로그인 성공', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'user1@test.com',
          password: 'test1234',
        })
        .expect(200)
        .expect(res => {
          expect(res.body.access_token).toBeDefined();
        });
    });

    it('로그인 실패', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'wrong@test.com',
          password: 'wrong',
        })
        .expect(401);
    });

    it('보호 API 무토큰 접근', async () => {
      await request(app.getHttpServer())
        .get('/user/me')
        .expect(401);
    });
  });

  describe('User E2E', () => {
    it('회원가입', async () => {
      await request(app.getHttpServer())
      .post('/user/register')
      .send({
        email: 'new@test.com',
        password: 'test1234',
        nickname: 'newbie',
      })
      .expect(201);
    });

    it('유저 정보 수정', async () => {
      const login = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'user1@test.com',
        password: 'test1234'
      })

      const token = login.body.access_token;

      await request(app.getHttpServer())
        .patch('/user/me')
        .set('Authorization', `Bearer ${accessTokenUser1}`)
        .send({ nickname: 'updated' })
        .expect(200);
      });
  });

  describe('Post E2E', () => {
    it('생성', async () => {
      const res = await request(app.getHttpServer())
        .post('/post')
        .set('Authorization', `Bearer ${accessTokenUser1}`)
        .send({ title: 'test', content: 'content' })
        .expect(201);

      postId = res.body.id;
    });

    it('조회', async () => {
      await request(app.getHttpServer())
        .get(`/post/${postId}`)
        .expect(200);
    });

    it('수정', async () => {
      await request(app.getHttpServer())
        .patch(`/post/${postId}`)
        .set('Authorization', `Bearer ${accessTokenUser1}`)
        .send({ title: 'updated' })
        .expect(200);
    });

    it('타인 수정 → 403', async () => {
      await request(app.getHttpServer())
        .patch(`/post/${postId}`)
        .set('Authorization', `Bearer ${accessTokenUser2}`)
        .send({ title: 'hack' })
        .expect(403);
    });
  });

  describe('Search E2E', () => {
    const keyword = '없는키워드';

    it('게시글 검색 - 결과 없음', async () => {
      const res = await request(app.getHttpServer())
        .get(`/search?target=post&keyword=${keyword}&page=1&limit=10`)
        .set('Authorization', `Bearer ${accessTokenUser1}`)
        .expect(200);

      expect(res.body.posts.data.length).toBe(0);
    });

    it('사용자 검색 - 결과 없음', async () => {
      const res = await request(app.getHttpServer())
        .get(`/search?target=user&keyword=${keyword}&page=1&limit=10`)
        .set('Authorization', `Bearer ${accessTokenUser1}`)
        .expect(200);

      expect(res.body.users.data.length).toBe(0);
    });

    it('전체 검색 - 결과 없음', async () => {
      const res = await request(app.getHttpServer())
        .get(`/search?target=all&keyword=${keyword}&page=1&limit=10`)
        .set('Authorization', `Bearer ${accessTokenUser1}`)
        .expect(200);

      expect(res.body.posts.data.length).toBe(0);
      expect(res.body.users.data.length).toBe(0);
    });

    it('게시글 검색 - 결과 있음', async () => {
      const res = await request(app.getHttpServer())
        .get(`/search?target=post&keyword=content`)
        .set('Authorization', `Bearer ${accessTokenUser1}`)
        .expect(200);

      expect(res.body.posts.data.length).toBeGreaterThan(0);
      expect(res.body.posts.data[0].content).toContain('content');
    });
  });


  describe('Like E2E', () => {
    it('좋아요', async () => {
        await request(app.getHttpServer())
          .post(`/post/${postId}/like`)
          .set('Authorization', `Bearer ${accessTokenUser2}`)
          .expect(201);
    });

    it('좋아요 취소', async () => {
      await request(app.getHttpServer())
        .delete(`/post/${postId}/like`)
        .set('Authorization', `Bearer ${accessTokenUser2}`)
        .expect(200);
    });
  });

  describe('Comment E2E', () => {
    it('댓글 생성', async () => {
      const res = await request(app.getHttpServer())
        .post(`/comment/post/${postId}/comment`)
        .set('Authorization', `Bearer ${accessTokenUser1}`)
        .send({ content: 'comment' })
        .expect(201);

      commentId = res.body.id;
    });

    it('댓글 수정', async () => {
      await request(app.getHttpServer())
        .patch(`/comment/${commentId}`)
        .set('Authorization', `Bearer ${accessTokenUser1}`)
        .send({ content: 'updated' })
        .expect(200);
    });

    it('댓글 삭제', async () => {
      await request(app.getHttpServer())
        .delete(`/comment/${commentId}`)
        .set('Authorization', `Bearer ${accessTokenUser1}`)
        .expect(200);
    });

    it('삭제된 댓글 수정 시도 → 404', async () => {
      await request(app.getHttpServer())
        .patch(`/comment/${commentId}`)
        .set('Authorization', `Bearer ${accessTokenUser1}`)
        .send({ content: 'fail' })
        .expect(404);
    });
  });

  describe('Post E2E for delete', () => {
    it('삭제', async () => {
      await request(app.getHttpServer())
        .delete(`/post/${postId}`)
        .set('Authorization', `Bearer ${accessTokenUser1}`)
        .expect(200);
    });

    it('삭제 후 조회 → 404', async () => {
      await request(app.getHttpServer())
        .get(`/post/${postId}`)
        .expect(404);
    });
  });

  describe('Follow E2E', () => {
    it('팔로우', async () => {
      await request(app.getHttpServer())
        .post(`/follow/${2}`)   // user2를 user1이 팔로우
        .set('Authorization', `Bearer ${accessTokenUser1}`)
        .expect(201);
    });

    it('팔로우 목록 조회', async () => {
      const res = await request(app.getHttpServer())
        .get('/follow/followings')
        .set('Authorization', `Bearer ${accessTokenUser1}`)
        .expect(200);

      expect(res.body.some(f => f.id === 2)).toBe(true);
    });

    it('언팔로우', async () => {
      await request(app.getHttpServer())
        .delete(`/follow/${2}`)   // user2를 user1이 언팔로우
        .set('Authorization', `Bearer ${accessTokenUser1}`)
        .expect(200);
    });

    it('언팔 후 팔로우 목록 조회', async () => {
      const res = await request(app.getHttpServer())
        .get('/follow/followings')
        .set('Authorization', `Bearer ${accessTokenUser1}`)
        .expect(200);

      expect(res.body.some(f => f.id === 2)).toBe(false);
    });
  });
});
