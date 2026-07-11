# Prisma Schema and DB Rules

## ⚠️ CRITICAL: NO MIGRATIONS RULE

This TypeScript/Node backend operates alongside the existing Django/parent ERP application. The MySQL/MariaDB database schema is owned by the shared/Django parent application.

**Do NOT run any Prisma migrations (`prisma migrate dev`, `prisma migrate deploy`, etc.) against the database.**

To add new fields or tables:
1. They must be defined in the Django ORM models first.
2. Apply the schema change using Django migrations or raw DDL matching the Django ORM definitions exactly.
3. Pull the updated schema into this project using:
   ```bash
   npx prisma db pull
   ```
4. Regenerate the Prisma Client:
   ```bash
   npx prisma generate
   ```

## Schema Conventions
- All models use `@@map("db_table")` to map to snake_case database tables.
- All properties use `@map("column_name")` to match database columns.
- Decimals are defined with precise precision mapping (e.g. `@db.Decimal(18, 2)`).
- Relationships use Prisma soft relations with `relationMode = "prisma"` in the datasource configuration.
