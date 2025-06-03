import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2"; // 👈 CAMBIO IMPORTANTE
import * as schema from "../shared/schema";

const pool = mysql.createPool({
  uri: process.env.DATABASE_URL,
  waitForConnections: true,
});

export const db = drizzle(pool, {
  schema,
  mode: "default",
});
