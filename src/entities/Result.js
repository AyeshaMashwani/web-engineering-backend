import { EntitySchema } from "typeorm";

const Result = new EntitySchema({
  name: "Result",
  tableName: "results",
  columns: {
    id: {
      primary: true,
      type: "int",
      generated: true
    },
    student_name: {
      type: "varchar"
    },
    subject: {
      type: "varchar"
    },
    marks: {
      type: "int"
    },
    grade: {
      type: "varchar",
      nullable: true
    }
  }
});

export default Result;