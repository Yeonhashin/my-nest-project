import { INestApplication } from "@nestjs/common";
import request from 'supertest';
import { createTestApp } from '../common/setup';

let app: INestApplication;

beforeAll(async () => {
    app = await createTestApp();
});

describe('Auth E2E', () => {
  it('dummy test', () => {
    expect(true).toBe(true);
  });
});

afterAll(async () => {
    await app.close();
});