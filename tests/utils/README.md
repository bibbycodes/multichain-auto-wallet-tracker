# Test Database Utilities

Utilities for managing test database state and seeding test data.

## Overview

This package provides two main utilities:

1. **TestDbHelper** - Manages database state (cleanup, initialization, reset)
2. **TestSeed** - Seeds the database with test data using fixtures and mappers

## Setup

### Environment Variables

Ensure you have a test database configured:

```bash
DATABASE_URL="postgresql://user:password@localhost:5432/auto_tracker_test"
```

### Global Setup (Optional)

You can set up global test hooks in your Jest configuration:

```javascript
// jest.config.js
module.exports = {
  globalSetup: './tests/utils/global-setup.ts',
  globalTeardown: './tests/utils/global-teardown.ts',
};
```

## Usage

### Basic Test Setup

```typescript
import { TestDbHelper, TestSeed } from '../../tests/utils';

describe('MyService', () => {
    let dbHelper: TestDbHelper;
    let testSeed: TestSeed;

    beforeAll(async () => {
        dbHelper = TestDbHelper.getInstance();
        await dbHelper.initialize();
    });

    beforeEach(async () => {
        await dbHelper.reset(); // Clean database before each test
        testSeed = new TestSeed();
    });

    afterAll(async () => {
        await dbHelper.disconnect();
    });

    it('should work with seeded data', async () => {
        // Seed a token
        const token = await testSeed.createBirdeyeToken();

        // Your test logic here
        expect(token).toBeDefined();
    });
});
```

### TestSeed API

#### Create Tokens from Fixtures

```typescript
// Create a Birdeye token with default fixture data
const token = await testSeed.createBirdeyeToken();

// Create a Birdeye token with custom address
const token = await testSeed.createBirdeyeToken({
    address: '0xcustom...',
    chainId: '1',
});

// Create a Birdeye token with overridden fields
const token = await testSeed.createBirdeyeToken({
    tokenOverview: {
        name: 'Custom Name',
        symbol: 'CUST',
    },
});

// Create a GMGN token
const token = await testSeed.createGmgnToken({
    address: '0xgmgn...',
    chainId: '56',
});
```

#### Create Minimal Tokens

```typescript
// Create a token with only required fields
const token = await testSeed.createMinimalToken({
    address: '0xminimal...',
    chainId: '1',
    name: 'Test Token',
    symbol: 'TEST',
});
```

#### Create Incomplete Tokens

```typescript
// Create a token missing some fields (for testing incomplete data scenarios)
const token = await testSeed.createIncompleteToken({
    address: '0xincomplete...',
    chainId: '1',
    missingFields: ['pair_address'],
});
```

#### Seed Multiple Tokens

```typescript
// Seed 5 Birdeye tokens with sequential addresses
const tokens = await testSeed.seedMultipleTokens(5, 'birdeye');

// Seed 3 GMGN tokens
const tokens = await testSeed.seedMultipleTokens(3, 'gmgn');
```

#### Retrieve and Delete Tokens

```typescript
// Get a token
const token = await testSeed.getToken('0xaddress...', '1');

// Delete a token
await testSeed.deleteToken('0xaddress...', '1');
```

#### Access Fixtures Directly

```typescript
const fixtures = TestSeed.getFixtures();

// Use Birdeye fixtures
const tokenOverview = fixtures.birdeye.tokenOverview;
const tokenSecurity = fixtures.birdeye.tokenSecurity;
const markets = fixtures.birdeye.markets;

// Use GMGN fixtures
const tokenInfo = fixtures.gmgn.tokenInfo;
const socials = fixtures.gmgn.socials;
```

### TestDbHelper API

#### Initialize Database

```typescript
const dbHelper = TestDbHelper.getInstance();
await dbHelper.initialize(); // Ensures chains exist
```

#### Reset Database

```typescript
await dbHelper.reset(); // Clean all data and re-ensure chains
```

#### Clean Database

```typescript
await dbHelper.cleanDatabase(); // Remove all test data
```

#### Get Prisma Client

```typescript
const prisma = dbHelper.getPrisma();
```

#### Disconnect

```typescript
await dbHelper.disconnect();
```

## Example: Testing Token Builder

```typescript
import { TestDbHelper, TestSeed } from '../../../tests/utils';
import { AutoTrackerTokenBuilder } from '../token-builder';

describe('AutoTrackerTokenBuilder', () => {
    let dbHelper: TestDbHelper;
    let testSeed: TestSeed;

    beforeAll(async () => {
        dbHelper = TestDbHelper.getInstance();
        await dbHelper.initialize();
    });

    beforeEach(async () => {
        await dbHelper.reset();
        testSeed = new TestSeed();
    });

    afterAll(async () => {
        await dbHelper.disconnect();
    });

    describe('getOrCreate', () => {
        it('should return existing complete token', async () => {
            // Seed a complete token
            const existingToken = await testSeed.createBirdeyeToken({
                address: '0xtest...',
                chainId: '1',
            });

            // Try to get or create - should return existing
            const builder = new AutoTrackerTokenBuilder('0xtest...', '1');
            const result = await builder.getOrCreate();

            expect(result.address).toBe(existingToken.address);
        });

        it('should fetch and create when token does not exist', async () => {
            const builder = new AutoTrackerTokenBuilder('0xnew...', '1');
            const result = await builder.getOrCreate();

            // Verify token was created
            const dbToken = await testSeed.getToken('0xnew...', '1');
            expect(dbToken).toBeDefined();
        });
    });
});
```

## Best Practices

1. **Always reset between tests** - Use `beforeEach(async () => await dbHelper.reset())`
2. **Clean up after test suite** - Use `afterAll(async () => await dbHelper.disconnect())`
3. **Use fixtures for consistency** - Leverage `TestSeed` methods that use fixtures
4. **Customize when needed** - Override specific fields while keeping fixture defaults
5. **Test with realistic data** - Fixtures are based on real API responses

## Troubleshooting

### Database Connection Issues

Ensure your `DATABASE_URL` points to a test database, not production:

```bash
DATABASE_URL="postgresql://localhost:5432/auto_tracker_test"
```

### Foreign Key Constraint Errors

The `cleanDatabase()` method deletes tables in dependency order. If you add new tables, update the deletion order in `TestDbHelper`.

### Chain Not Found Errors

If you get chain-related errors, ensure chains are initialized:

```typescript
await dbHelper.ensureChainsExist();
```

## Adding New Fixtures

To add new fixture-based seed methods:

1. Add fixtures to `tests/fixtures/[source]/`
2. Import fixtures in `test-seed.ts`
3. Create a new `create[Source]Token()` method
4. Use the appropriate mapper to convert fixture to `AutoTrackerToken`

Example:

```typescript
async createNewSourceToken(options?: { address?: string }): Promise<Token> {
    const tokenData = newSourceFixture as NewSourceTokenData;
    const autoTrackerToken = NewSourceMapper.mapToAutoTrackerToken(tokenData);
    return await this.prisma.token.create({ data: autoTrackerToken.toDb() });
}
```
