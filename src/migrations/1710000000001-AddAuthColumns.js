export class AddAuthColumns1710000000001 {
  async up(queryRunner) {
    await queryRunner.query(`
      ALTER TABLE users
      ADD COLUMN IF NOT EXISTS role varchar DEFAULT 'user'
    `);

    await queryRunner.query(`
      ALTER TABLE users
      ADD COLUMN IF NOT EXISTS "refreshToken" varchar
    `);
  }

  async down(queryRunner) {
    await queryRunner.query(`
      ALTER TABLE users
      DROP COLUMN IF EXISTS "refreshToken"
    `);

    await queryRunner.query(`
      ALTER TABLE users
      DROP COLUMN IF EXISTS role
    `);
  }
}