import { defineConfig } from "drizzle-kit";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be defined to connect to MySQL");
}

export default defineConfig({
  out: "./migrations",               // Carpeta donde se guardan las migraciones
  schema: "./shared/schema.ts",     // Ruta a tu archivo de tablas Drizzle
  dialect: "mysql",                 // ✅ Cambiado de 'postgresql' a 'mysql'
  dbCredentials: {
    url: process.env.DATABASE_URL, // Ejemplo: mysql://user:pass@localhost:3306/db
  },
});
