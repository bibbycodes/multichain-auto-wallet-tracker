# Test Database Setup Guide

This guide explains how to set up and manage the test database for running integration tests.

## Quick Start

### 1. Create Test Database

```bash
# Connect to PostgreSQL
psql -U postgres

# Create test database
CREATE DATABASE auto_tracker_test;

# Grant privileges (if needed)
GRANT ALL PRIVILEGES ON DATABASE auto_tracker_test TO your_user;

# Exit psql
\q
```

### 2. Configure Environment

The `.env.test` file is already configured with:

```bash
DATABASE_URL="postgresql://localhost:5432/auto_tracker_test?schema=public"
```

**Update this URL** to match your PostgreSQL configuration:

```bash
# Format
DATABASE_URL="postgresql://[user]:[password]@[host]:[port]/[database]?schema=public"

# Example with authentication
DATABASE_URL="postgresql://myuser:mypassword@localhost:5432/auto_tracker_test?schema=public"
```

### 3. Run Migrations

Apply the Prisma schema to your test database:

```bash
# Run migrations on test database
npm run test:db:migrate

# Or manually
DATABASE_URL="postgresql://localhost:5432/auto_tracker_test?schema=public" npx prisma migrate dev
```

### 4. Run Tests

```bash
npm test
```

## NPM Scripts

Add these to your `package.json`:

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:db:migrate": "dotenv -e .env.test -- npx prisma migrate dev",
    "test:db:reset": "dotenv -e .env.test -- npx prisma migrate reset --force",
    "test:db:studio": "dotenv -e .env.test -- npx prisma studio"
  }
}
```

Install `dotenv-cli` for the scripts:

```bash
npm install --save-dev dotenv-cli
```

## How It Works

### Environment Loading

1. **Jest Global Setup** (`tests/global-setup.ts`)
   - Runs once before all tests
   - Loads `.env.test` file
   - Validates DATABASE_URL is set
   - Warns if database name doesn't contain "test"

2. **Test Setup** (`tests/setup.ts`)
   - Runs for each test file
   - Sets test timeouts
   - Can suppress console logs (optional)

3. **TestDbHelper** (`tests/utils/db-helper.ts`)
   - Manages database state
   - Cleans data between tests
   - Ensures required chains exist

### Database Isolation

Tests use a separate database to ensure:
- ✅ No interference with development data
- ✅ Clean state for each test run
- ✅ Safe to reset/clean without data loss
- ✅ Parallel test execution (with different schemas)

## Best Practices

### 1. Always Use Test Database

**NEVER** point tests to development or production databases!

```bash
# ❌ BAD - uses development database
DATABASE_URL="postgresql://localhost:5432/auto_tracker"

# ✅ GOOD - uses dedicated test database
DATABASE_URL="postgresql://localhost:5432/auto_tracker_test"
```

### 2. Clean Between Tests

Always reset database state in `beforeEach`:

```typescript
beforeEach(async () => {
    await dbHelper.reset();
});
```

### 3. Disconnect After Tests

Clean up connections in `afterAll`:

```typescript
afterAll(async () => {
    await dbHelper.disconnect();
});
```

### 4. Use Transactions (Advanced)

For faster tests, wrap each test in a transaction and rollback:

```typescript
beforeEach(async () => {
    await prisma.$executeRaw`BEGIN`;
});

afterEach(async () => {
    await prisma.$executeRaw`ROLLBACK`;
});
```

## Troubleshooting

### Error: "Cannot connect to database"

Check your DATABASE_URL in `.env.test`:

```bash
# Verify database exists
psql -U postgres -l | grep auto_tracker_test

# Test connection
psql "postgresql://localhost:5432/auto_tracker_test"
```

### Error: "relation does not exist"

Run migrations on test database:

```bash
npm run test:db:migrate
```

### Error: "database already exists"

Reset the test database:

```bash
npm run test:db:reset
```

### Tests are slow

Consider:
1. Use transaction rollback instead of full cleanup
2. Seed data once in `beforeAll` instead of `beforeEach`
3. Use SQLite for unit tests (faster, in-memory)
4. Run tests in parallel: `jest --maxWorkers=4`

### Foreign key constraint errors

Ensure `TestDbHelper.cleanDatabase()` deletes tables in dependency order:

```typescript
await this.prisma.alert.deleteMany({});          // Delete children first
await this.prisma.token.deleteMany({});          // Delete parents last
```

## Alternative: Using Docker

For consistent test environments, use Docker:

```bash
# docker-compose.test.yml
version: '3.8'
services:
  test-db:
    image: postgres:15
    environment:
      POSTGRES_DB: auto_tracker_test
      POSTGRES_USER: test
      POSTGRES_PASSWORD: test
    ports:
      - "5433:5432"
```

Update `.env.test`:

```bash
DATABASE_URL="postgresql://test:test@localhost:5433/auto_tracker_test?schema=public"
```

Start test database:

```bash
docker-compose -f docker-compose.test.yml up -d
```

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_DB: auto_tracker_test
          POSTGRES_USER: test
          POSTGRES_PASSWORD: test
        ports:
          - 5432:5432
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci

      - name: Run migrations
        run: npm run test:db:migrate
        env:
          DATABASE_URL: postgresql://test:test@localhost:5432/auto_tracker_test

      - name: Run tests
        run: npm test
        env:
          DATABASE_URL: postgresql://test:test@localhost:5432/auto_tracker_test
```

## Multiple Test Databases (Advanced)

For parallel test execution, use different databases or schemas:

```typescript
// tests/utils/db-helper.ts
const workerId = process.env.JEST_WORKER_ID || '1';
const testSchema = `test_${workerId}`;

// Use different schema per worker
const prisma = new PrismaClient({
    datasources: {
        db: {
            url: `${process.env.DATABASE_URL}?schema=${testSchema}`,
        },
    },
});
```

## Summary

- ✅ Use `.env.test` for test database configuration
- ✅ Test database is separate from development
- ✅ Automatic environment loading via Jest global setup
- ✅ Clean state between tests via TestDbHelper
- ✅ Proper connection cleanup via global teardown
- ✅ Safety warnings for non-test databases
