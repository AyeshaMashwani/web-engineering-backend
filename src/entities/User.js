import { EntitySchema } from "typeorm";

const User = new EntitySchema({
  name: "User",
  tableName: "users",
  columns: {
    id: {
      primary: true,
      type: "int",
      generated: true,
    },
    name: {
      type: "varchar",
    },
    email: {
      type: "varchar",
      unique: true,
    },
    password: {
      type: "varchar",
      nullable: true,
    },
    age: {
      type: "int",
      nullable: true,
    },
    role: {
      type: "varchar",
      default: "user",
    },
    refreshToken: {
      type: "varchar",
      nullable: true,
    }
  },
});

export default User;