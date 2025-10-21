# Refactoring Plan for getOrCreate() Tests

## Current Issues:
1. Many describe blocks contain only one test (unnecessary nesting)
2. Database setup is duplicated and inconsistent
3. Manual cleanup calls in each test are error-prone

## Changes to Make:

### Structure Changes:
- Remove single-test describe blocks:
  - "returns existing token with complete data" -> direct it()
  - "does not fetch from APIs when token complete" -> direct it()
  - "fetches when token not in database" -> direct it()
  - "fetches when token missing required fields" -> direct it()

- Keep describe blocks that group multiple related tests:
  - "checks required fields correctly" (has 2 tests)
  - "Chain ID Resolution Flow" (has multiple tests)
  - "Data Merging Scenarios" (has multiple tests)
  - etc.

### Database Setup Consolidation:
- Move all database setup to a single `beforeEach` in "Database Scenarios"
- Remove redundant `beforeEach` in nested describe blocks
- Remove manual cleanup calls - let beforeEach reset handle it

### Final Structure:
```
describe('getOrCreate()')
  describe('Database Scenarios')
    beforeEach() // Consolidated db setup
    it('should return DB token immediately...')
    it('should short-circuit and skip API calls...')
    it('should fetch and create token when not in database')
    it('should fetch additional data when DB token is incomplete')
    it('should use hasMissingRequiredFields...')
    it('should merge tokens with available data when some sources fail')

  describe('Chain ID Resolution Flow')
    it(...)
    it(...)

  describe('Data Merging Scenarios')
    it(...)
    it(...)
```
