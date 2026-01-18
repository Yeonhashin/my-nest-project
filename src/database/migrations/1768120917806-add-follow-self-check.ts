import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddFollowSelfCheck1690000000000 implements MigrationInterface {
  name = 'AddFollowSelfCheck1690000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "follows"
      ADD CONSTRAINT "chk_no_self_follow"
      CHECK ("followerId" <> "followingId")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "follows"
      DROP CONSTRAINT "chk_no_self_follow"
    `);
  }
}
