export class CreateResultsTable17100000000000 {
  async up(queryRunner) {
    await queryRunner.query(`CREATE TABLE "results" (
      "id" SERIAL NOT NULL,
      "student_name" character varying NOT NULL,
      "subject" character varying NOT NULL,
      "marks" integer NOT NULL,
      "grade" character varying,
      CONSTRAINT "PK_results_id" PRIMARY KEY ("id")
    )`);
  }

  async down(queryRunner) {
    await queryRunner.query(`DROP TABLE "results"`);
  }
}