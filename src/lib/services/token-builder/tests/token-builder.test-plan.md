# TokenBuilder Test Plan

## Overview
The `AutoTrackerTokenBuilder` class is responsible for building token data by:
- Fetching data from multiple sources (Birdeye, GMGN)
- Resolving chain ID automatically when not provided
- Merging data from different sources
- Handling database caching
- Validating complete token data

## Test Structure

### Class: `AutoTrackerTokenBuilder`

---

## 1. Constructor Tests

### 1.1 Constructor - basic initialization without chain ID
**Description**: Should initialize with token address only, chain ID optional
**Setup**: Create builder with token address only
**Expected**: Builder is created with address, chainId is undefined

### 1.2 Constructor - with chain ID
**Description**: Should initialize with token address and chain ID
**Setup**: Create builder with token address and chain ID
**Expected**: Builder is created with both address and chainId set

### 1.3 Constructor - with custom services
**Description**: Should accept custom service instances
**Setup**: Create builder with mocked services
**Expected**: Builder uses provided service instances

---

## 2. setChainId() Tests

### 2.1 setChainId - sets chain ID successfully
**Description**: Should set the chain ID on the builder
**Setup**: Create builder without chain ID
**Action**: Call setChainId with valid chain ID
**Expected**: Chain ID is set on the builder instance

### 2.2 setChainId - can update existing chain ID
**Description**: Should allow updating the chain ID
**Setup**: Create builder with chain ID
**Action**: Call setChainId with different chain ID
**Expected**: Chain ID is updated to new value

---

## 3. initialiseRawData() Tests

### 3.1 initialiseRawData - throws when chain ID not set
**Description**: Should throw error when chain ID is not set (guards against incorrect usage)
**Setup**: Create builder without chain ID, don't call setChainId
**Action**: Call initialiseRawData() directly
**Expected**: Throws error "Chain id is not set"

### 3.2 initialiseRawData - creates new RawTokenDataCache with chain ID
**Description**: Should create and return new RawTokenDataCache instance when chain ID is set
**Setup**: Create builder with chain ID
**Action**: Call initialiseRawData()
**Expected**: Returns RawTokenDataCache instance, rawData property is set

### 3.3 initialiseRawData - with rawDataInput
**Description**: Should create RawTokenDataCache with provided input data
**Setup**: Create builder with chain ID and mock raw data input
**Action**: Call initialiseRawData(rawDataInput)
**Expected**: RawTokenDataCache is created with provided data

### 3.4 initialiseRawData - does not reinitialize if already set
**Description**: Should return existing rawData if already initialized
**Setup**: Create builder, call initialiseRawData() twice
**Expected**: Second call returns same instance without recreating

---

## 4. getRawData() Tests

### 4.1 getRawData - throws when chain ID not set
**Description**: Should throw error when chain ID is not set
**Setup**: Create builder without chain ID
**Action**: Call getRawData()
**Expected**: Throws error "Chain id is not set"

### 4.2 getRawData - creates new instance if rawData is null
**Description**: Should create new RawTokenDataCache if not initialized
**Setup**: Create builder with chain ID, rawData is null
**Action**: Call getRawData()
**Expected**: Returns new RawTokenDataCache instance

### 4.3 getRawData - returns existing rawData
**Description**: Should return existing rawData if already initialized
**Setup**: Create builder, initialize rawData
**Action**: Call getRawData()
**Expected**: Returns existing RawTokenDataCache instance

---

## 5. getInitialData() Tests - Chain ID Resolution

### 5.1 getInitialData - without chain ID resolves it automatically
**Description**: Should fetch token data without chain ID and set it from response
**Setup**: Create builder without chain ID, mock birdeyeService.fetchTokenDataWithMarketCapFromAddress to return data with chain ID
**Action**: Call getInitialData()
**Expected**:
- Calls fetchTokenDataWithMarketCapFromAddress with token address
- Sets chain ID from response
- Initializes rawData with response data
- Returns token data with market cap

### 5.2 getInitialData - throws if no chain ID returned from API
**Description**: Should throw error if API doesn't return chain ID when needed for resolution
**Setup**: Create builder without chain ID, mock API to return data without chain ID
**Action**: Call getInitialData()
**Expected**: Throws error "Chain id not returned"

### 5.3 getInitialData - with chain ID uses specific endpoint
**Description**: Should fetch token data with known chain ID using chain-specific endpoint
**Setup**: Create builder with chain ID, mock birdeyeService.fetchTokenWithMarketCap
**Action**: Call getInitialData()
**Expected**:
- Calls fetchTokenWithMarketCap with token address and chain ID
- Sets chain ID (confirms existing value)
- Initializes rawData with response data
- Returns token data

### 5.4 getInitialData - initializes rawData with response
**Description**: Should initialize rawData with API response data
**Setup**: Mock API response with rawData field
**Action**: Call getInitialData()
**Expected**: rawData is initialized with data from API response

---

## 6. collect() Tests

### 6.1 collect - throws when rawData not initialized
**Description**: Should throw error if rawData is null
**Setup**: Create builder without initializing rawData
**Action**: Call collect()
**Expected**: Throws error "Raw data is not set"

### 6.2 collect - fetches all data sources in parallel
**Description**: Should fetch from all data sources concurrently
**Setup**: Initialize builder with rawData, mock all rawData methods
**Action**: Call collect()
**Expected**: Calls all 5 methods (birdeye tokenOverview, security, markets, gmgn info, socials) in parallel using Promise.all

### 6.3 collect - returns collected data structure
**Description**: Should return object with all collected data
**Setup**: Mock all rawData methods to return data
**Action**: Call collect()
**Expected**: Returns object with birdeyeTokenOverview, birdeyeTokenSecurity, birdeyeMarkets, gmgnTokenInfo, gmgnTokenSocials

### 6.4 collect - handles partial data from sources
**Description**: Should return data even if some sources return null
**Setup**: Mock some methods to return null, others to return data
**Action**: Call collect()
**Expected**: Returns object with mix of data and null values (doesn't fail)

### 6.5 collect - handles source failures gracefully
**Description**: Should not fail entire collection if one source fails
**Setup**: Mock one rawData method to throw error
**Action**: Call collect()
**Expected**: Error propagates (Promise.all behavior), but this is expected - need error handling at caller level

---

## 7. getGmgnAutoTrackerToken() Tests

### 7.1 getGmgnAutoTrackerToken - throws when chain ID not set
**Description**: Should throw error when chain ID is not set (guards against incorrect flow)
**Setup**: Create builder without chain ID, don't set it
**Action**: Call getGmgnAutoTrackerToken()
**Expected**: Throws error "Chain id is not set"

### 7.2 getGmgnAutoTrackerToken - returns null when gmgn data missing
**Description**: Should return null if GMGN token info is missing
**Setup**: Set chain ID, mock collect() to return null for gmgnTokenInfo
**Action**: Call getGmgnAutoTrackerToken()
**Expected**: Returns null (graceful degradation)

### 7.3 getGmgnAutoTrackerToken - returns null when gmgn socials missing
**Description**: Should return null if GMGN socials are missing
**Setup**: Set chain ID, mock collect() to return null for gmgnTokenSocials
**Action**: Call getGmgnAutoTrackerToken()
**Expected**: Returns null (graceful degradation)

### 7.4 getGmgnAutoTrackerToken - returns null when both gmgn sources missing
**Description**: Should return null if both GMGN data sources are missing
**Setup**: Set chain ID, mock collect() to return null for both gmgn fields
**Action**: Call getGmgnAutoTrackerToken()
**Expected**: Returns null

### 7.5 getGmgnAutoTrackerToken - returns mapped token when data available
**Description**: Should return AutoTrackerToken when all GMGN data available
**Setup**: Set chain ID, mock collect() to return valid gmgn data
**Action**: Call getGmgnAutoTrackerToken()
**Expected**: Returns AutoTrackerToken mapped from GMGN data via GmGnMapper

---

## 8. getBirdeyeAutoTrackerToken() Tests

### 8.1 getBirdeyeAutoTrackerToken - throws when chain ID not set
**Description**: Should throw error when chain ID is not set (guards against incorrect flow)
**Setup**: Create builder without chain ID, don't set it
**Action**: Call getBirdeyeAutoTrackerToken()
**Expected**: Throws error "Chain id is not set"

### 8.2 getBirdeyeAutoTrackerToken - returns null when token overview missing
**Description**: Should return null if Birdeye token overview is missing
**Setup**: Set chain ID, mock collect() to return null for birdeyeTokenOverview
**Action**: Call getBirdeyeAutoTrackerToken()
**Expected**: Returns null (graceful degradation)

### 8.3 getBirdeyeAutoTrackerToken - returns null when security data missing
**Description**: Should return null if Birdeye security data is missing
**Setup**: Set chain ID, mock collect() to return null for birdeyeTokenSecurity
**Action**: Call getBirdeyeAutoTrackerToken()
**Expected**: Returns null (graceful degradation)

### 8.4 getBirdeyeAutoTrackerToken - returns null when markets missing
**Description**: Should return null if Birdeye markets data is missing
**Setup**: Set chain ID, mock collect() to return null for birdeyeMarkets
**Action**: Call getBirdeyeAutoTrackerToken()
**Expected**: Returns null (graceful degradation)

### 8.5 getBirdeyeAutoTrackerToken - returns null when markets array empty
**Description**: Should return null if markets array has no items
**Setup**: Set chain ID, mock collect() to return birdeyeMarkets with empty items array
**Action**: Call getBirdeyeAutoTrackerToken()
**Expected**: Returns null (no pair address available)

### 8.6 getBirdeyeAutoTrackerToken - returns mapped token when data available
**Description**: Should return AutoTrackerToken when all Birdeye data available
**Setup**: Set chain ID, mock collect() to return valid birdeye data with markets
**Action**: Call getBirdeyeAutoTrackerToken()
**Expected**: Returns AutoTrackerToken mapped from Birdeye data via BirdeyeMapper, uses first market's pair address

### 8.7 getBirdeyeAutoTrackerToken - uses first market for pair address
**Description**: Should extract pair address from first market in array
**Setup**: Mock markets with multiple items
**Action**: Call getBirdeyeAutoTrackerToken()
**Expected**: Uses markets.items[0].address as pairAddress

---

## 9. getToken() Tests

### 9.1 getToken - resolves chain ID before fetching
**Description**: Should call getInitialData to resolve chain ID if not set
**Setup**: Create builder without chain ID, mock getInitialData
**Action**: Call getToken()
**Expected**: getInitialData is called first to resolve chain ID

### 9.2 getToken - throws when both sources fail to return data
**Description**: Should throw error when both GMGN and Birdeye return null
**Setup**: Mock both getGmgnAutoTrackerToken and getBirdeyeAutoTrackerToken to return null
**Action**: Call getToken()
**Expected**: Throws error "Could not fetch tokens"

### 9.3 getToken - returns merged token when both sources succeed
**Description**: Should merge tokens from both sources using AutoTrackerToken.mergeMany
**Setup**: Mock both sources to return valid but different tokens
**Action**: Call getToken()
**Expected**: Returns merged AutoTrackerToken from both sources

### 9.4 getToken - returns token when only GMGN succeeds
**Description**: Should return token when only GMGN has data
**Setup**: Mock GMGN to return token, Birdeye to return null
**Action**: Call getToken()
**Expected**: Returns token from GMGN source only (filtered null from merge)

### 9.5 getToken - returns token when only Birdeye succeeds
**Description**: Should return token when only Birdeye has data
**Setup**: Mock Birdeye to return token, GMGN to return null
**Action**: Call getToken()
**Expected**: Returns token from Birdeye source only (filtered null from merge)

### 9.6 getToken - filters null tokens before merging
**Description**: Should filter out null tokens before passing to mergeMany
**Setup**: Mock one source to return null, other to return token
**Action**: Call getToken()
**Expected**: mergeMany receives array with only non-null tokens

---

## 10. getDbToken() Tests

### 10.1 getDbToken - returns null when token not in database
**Description**: Should return null if token not found in DB
**Setup**: Mock db.tokens.findOneByTokenAddress to return null
**Action**: Call getDbToken()
**Expected**: Returns null (token doesn't exist)

### 10.2 getDbToken - returns AutoTrackerToken when found in database
**Description**: Should return mapped AutoTrackerToken from database
**Setup**: Mock db.tokens.findOneByTokenAddress to return DB token record
**Action**: Call getDbToken()
**Expected**: Returns AutoTrackerToken instance via db.tokens.toModel

### 10.3 getDbToken - calls toModel to convert DB token
**Description**: Should use db.tokens.toModel to convert database record
**Setup**: Mock database methods
**Action**: Call getDbToken()
**Expected**: db.tokens.toModel is called with DB token record

### 10.4 getDbToken - queries by token address
**Description**: Should query database using the token address
**Setup**: Create builder with token address, mock db
**Action**: Call getDbToken()
**Expected**: db.tokens.findOneByTokenAddress called with correct token address

---

## 11. getOrCreate() Tests - Database Scenarios

### 11.1 getOrCreate - returns existing token with complete data
**Description**: Should return DB token immediately if it exists and has all required fields
**Setup**: Mock getDbToken to return complete token, mock hasMissingRequiredFields to return false
**Action**: Call getOrCreate()
**Expected**: Returns existing token without making any API calls

### 11.2 getOrCreate - does not fetch from APIs when token complete
**Description**: Should short-circuit and skip API calls when DB token is complete
**Setup**: Mock complete DB token
**Action**: Call getOrCreate()
**Expected**: Does not call getInitialData, collect, or API-specific methods

### 11.3 getOrCreate - fetches when token not in database
**Description**: Should fetch and create token when not in database
**Setup**: Mock getDbToken to return null
**Action**: Call getOrCreate()
**Expected**: Calls getInitialData (for chain ID if needed), collect, fetches from both sources, merges, validates, and upserts

### 11.4 getOrCreate - fetches when token missing required fields
**Description**: Should fetch additional data when DB token is incomplete
**Setup**: Mock getDbToken to return token with hasMissingRequiredFields returning true
**Action**: Call getOrCreate()
**Expected**: Fetches from APIs, merges with DB token, validates, and upserts

### 11.5 getOrCreate - checks required fields correctly
**Description**: Should use hasMissingRequiredFields to determine if token is complete
**Setup**: Mock DB token with some required fields missing
**Action**: Call getOrCreate()
**Expected**: Identifies missing fields and proceeds to fetch

---

## 12. getOrCreate() Tests - Chain ID Resolution Flow

### 12.1 getOrCreate - DB token without chain ID triggers resolution
**Description**: Should fetch initial data to resolve chain ID when DB token lacks it
**Setup**: Mock DB token with incomplete data and no chainId, mock getInitialData
**Action**: Call getOrCreate()
**Expected**:
- Calls getInitialData because token.chainId is falsy
- Sets chain ID from getInitialData response
- Initializes rawData with data from getInitialData

### 12.2 getOrCreate - builder chain ID takes precedence
**Description**: Should use chain ID from builder constructor even if DB token lacks it
**Setup**: Create builder with chain ID, mock DB token without chain ID but missing other fields
**Action**: Call getOrCreate()
**Expected**: Uses builder's chain ID, skips getInitialData call for chain resolution

### 12.3 getOrCreate - DB token with chain ID skips resolution
**Description**: Should not resolve chain ID if DB token already has it
**Setup**: Mock DB token with chainId but missing other required fields
**Action**: Call getOrCreate()
**Expected**: Does not call getInitialData, uses DB token's chain ID

### 12.4 getOrCreate - no chain ID anywhere triggers resolution
**Description**: Should resolve chain ID when builder and DB token both lack it
**Setup**: Builder without chain ID, DB token without chain ID
**Action**: Call getOrCreate()
**Expected**: Calls getInitialData to fetch and resolve chain ID

### 12.5 getOrCreate - initializes rawData with getInitialData response
**Description**: Should pass rawData from getInitialData to initialiseRawData
**Setup**: Mock getInitialData to return data with rawData field
**Action**: Call getOrCreate()
**Expected**: initialiseRawData is called with rawData from getInitialData response

---

## 13. getOrCreate() Tests - Data Merging Scenarios

### 13.1 getOrCreate - merges DB token with API data
**Description**: Should merge existing DB token with fresh API data from both sources
**Setup**: Mock DB token with name/symbol, GMGN with socials, Birdeye with security data
**Action**: Call getOrCreate()
**Expected**: Returns merged token with data from all three sources (DB, GMGN, Birdeye)

### 13.2 getOrCreate - merges three sources in correct order
**Description**: Should pass tokens in correct order to mergeMany
**Setup**: Mock all three sources with different fields
**Action**: Call getOrCreate()
**Expected**: AutoTrackerToken.mergeMany called with array [gmgnToken, birdeyeToken, dbToken] after filtering nulls

### 13.3 getOrCreate - handles only GMGN returning data
**Description**: Should create token when only GMGN source succeeds, Birdeye fails
**Setup**: Mock GMGN to return valid data, Birdeye to return null, no DB token
**Action**: Call getOrCreate()
**Expected**: Creates token from GMGN data only, validates successfully

### 13.4 getOrCreate - handles only Birdeye returning data
**Description**: Should create token when only Birdeye source succeeds, GMGN fails
**Setup**: Mock Birdeye to return valid complete data, GMGN to return null, no DB token
**Action**: Call getOrCreate()
**Expected**: Creates token from Birdeye data only, validates successfully

### 13.5 getOrCreate - merges partial data from multiple sources
**Description**: Should combine partial data from each source to meet requirements
**Setup**: GMGN returns name/symbol, Birdeye returns decimals/supply/pair, DB has socials
**Action**: Call getOrCreate()
**Expected**: Merged token has all required fields from different sources

### 13.6 getOrCreate - handles all sources returning null except DB
**Description**: Should try to work with just DB token if APIs fail
**Setup**: Both API sources return null, DB token exists but incomplete
**Action**: Call getOrCreate()
**Expected**: Attempts validation, likely fails due to missing required fields

---

## 14. getOrCreate() Tests - Validation and Persistence

### 14.1 getOrCreate - validates merged token before saving
**Description**: Should call AutoTrackerToken.validate on merged token
**Setup**: Mock all sources to return valid data
**Action**: Call getOrCreate()
**Expected**: AutoTrackerToken.validate is called with merged token before upsert

### 14.2 getOrCreate - throws validation error for incomplete token
**Description**: Should throw validation error if merged token still missing required fields
**Setup**: Mock sources to return incomplete data (missing address or required field)
**Action**: Call getOrCreate()
**Expected**: Throws validation error with message about missing fields

### 14.3 getOrCreate - validation checks required fields list
**Description**: Should validate against AutoTrackerToken.requiredFields
**Setup**: Mock token missing one required field (e.g., 'pairAddress')
**Action**: Call getOrCreate()
**Expected**: Validation fails with error listing 'pairAddress' as missing

### 14.4 getOrCreate - upserts token to database after validation
**Description**: Should save merged token to database after successful validation
**Setup**: Mock all sources to return valid complete data
**Action**: Call getOrCreate()
**Expected**: db.tokens.upsertTokenFromTokenData is called with merged token after validation

### 14.5 getOrCreate - returns merged and validated token
**Description**: Should return the final merged token after validation and save
**Setup**: Mock all sources to return valid data
**Action**: Call getOrCreate()
**Expected**: Returns merged AutoTrackerToken instance

### 14.6 getOrCreate - upsert happens after validation passes
**Description**: Should ensure validation precedes database upsert
**Setup**: Mock validation to throw error
**Action**: Call getOrCreate()
**Expected**: Upsert is never called, validation error is thrown

---

## 15. getOrCreate() Tests - Parallel Fetching

### 15.1 getOrCreate - fetches from both sources in parallel
**Description**: Should fetch GMGN and Birdeye tokens concurrently after collect
**Setup**: Mock both token fetching methods
**Action**: Call getOrCreate()
**Expected**: Uses Promise.all to fetch both getGmgnAutoTrackerToken and getBirdeyeAutoTrackerToken in parallel

### 15.2 getOrCreate - collect is called before individual fetches
**Description**: Should call collect() to populate rawData before getting tokens
**Setup**: Mock collect and individual fetch methods
**Action**: Call getOrCreate()
**Expected**: collect() is called once, then both token methods use collected data

---

## 16. Integration Tests - Complete Flows

### 16.1 Integration - complete flow from scratch without chain ID
**Description**: Should handle complete flow: no chain ID, no DB, both APIs succeed
**Setup**: Builder without chain ID, no DB token, mock both APIs with complete data
**Action**: Call getOrCreate()
**Expected**:
1. Resolves chain ID via getInitialData
2. Collects data from sources
3. Fetches from both APIs
4. Merges tokens
5. Validates
6. Saves to DB
7. Returns complete token

### 16.2 Integration - complete flow with chain ID provided
**Description**: Should handle complete flow when chain ID is known
**Setup**: Builder with chain ID, no DB token, mock both APIs
**Action**: Call getOrCreate()
**Expected**: Skips chain ID resolution, proceeds directly to data collection and merge

### 16.3 Integration - partial DB data enriched by APIs
**Description**: Should enrich partial DB data with API data
**Setup**: DB token with name/symbol but missing pair/decimals, APIs return full data
**Action**: Call getOrCreate()
**Expected**: Returns token with all data merged from DB and APIs, saves enriched version

### 16.4 Integration - API failure scenarios
**Description**: Should handle various API failure patterns
**Setup**: Different combinations of API successes/failures
**Test cases**:
- Birdeye fails (error thrown), GMGN succeeds
- GMGN fails (returns null), Birdeye succeeds
- Both return partial data that together is sufficient
**Expected**: Successfully creates token when at least one source provides sufficient data

### 16.5 Integration - insufficient data from all sources
**Description**: Should fail validation when combined data is still incomplete
**Setup**: DB has name only, GMGN returns null, Birdeye returns symbol only
**Action**: Call getOrCreate()
**Expected**: Merges what's available but validation fails, throws error listing missing fields

### 16.6 Integration - sufficient data from single source
**Description**: Should succeed with complete data from one source only
**Setup**: No DB token, GMGN returns null, Birdeye returns complete valid token
**Action**: Call getOrCreate()
**Expected**: Returns validated token from Birdeye only, saves to DB

### 16.7 Integration - chain ID resolution with DB token
**Description**: Should resolve chain ID when DB token exists but lacks it
**Setup**: DB token without chainId but with some data, builder without chain ID
**Action**: Call getOrCreate()
**Expected**: Calls getInitialData to resolve chain ID, then enriches DB token with API data

### 16.8 Integration - complete DB token short-circuit
**Description**: Should return immediately when DB token is complete
**Setup**: DB token with all required fields filled
**Action**: Call getOrCreate()
**Expected**: Returns DB token without any API calls or data collection

---

## 17. Error Handling Tests

### 17.1 Error - database query failure
**Description**: Should propagate database query errors
**Setup**: Mock db.tokens.findOneByTokenAddress to throw error
**Action**: Call getOrCreate()
**Expected**: Error is thrown and can be caught by caller

### 17.2 Error - getInitialData API failure
**Description**: Should handle getInitialData API failures
**Setup**: Mock birdeyeService.fetchTokenDataWithMarketCapFromAddress to throw error
**Action**: Call getOrCreate() without chain ID
**Expected**: Error is propagated (no chain ID can be resolved)

### 17.3 Error - collect failure
**Description**: Should handle errors during data collection
**Setup**: Mock rawData.birdeye.getTokenOverview to throw error during collect
**Action**: Call getOrCreate()
**Expected**: Error propagates from Promise.all in collect

### 17.4 Error - mapper failure
**Description**: Should handle errors in mapper functions
**Setup**: Mock GmGnMapper.mapGmGnTokenToAutoTrackerToken to throw error
**Action**: Call getGmgnAutoTrackerToken()
**Expected**: Error is propagated from mapper

### 17.5 Error - database save failure
**Description**: Should handle database upsert failures
**Setup**: Mock db.tokens.upsertTokenFromTokenData to throw error
**Action**: Call getOrCreate()
**Expected**: Error is thrown after validation but before return, token is not saved

### 17.6 Error - validation failure with detailed message
**Description**: Should throw validation error with details about missing fields
**Setup**: Mock token missing ['pairAddress', 'decimals']
**Action**: Call getOrCreate()
**Expected**: Error message includes list of missing fields

---

## 18. Edge Cases

### 18.1 Edge case - empty markets array from Birdeye
**Description**: Should handle when Birdeye returns markets but items array is empty
**Setup**: Mock birdeyeMarkets with {items: []}
**Action**: Call getBirdeyeAutoTrackerToken()
**Expected**: Returns null (cannot extract pair address)

### 18.2 Edge case - markets without items property
**Description**: Should handle malformed markets response
**Setup**: Mock birdeyeMarkets to be {} or without items property
**Action**: Call getBirdeyeAutoTrackerToken()
**Expected**: Returns null or handles gracefully

### 18.3 Edge case - zero values in token data
**Description**: Should handle tokens with zero decimals or supply
**Setup**: Mock API responses with decimals: 0, totalSupply: 0
**Action**: Call getToken()
**Expected**: Includes zero values correctly (they're not treated as missing/null)

### 18.4 Edge case - same data from multiple sources
**Description**: Should handle when both sources return identical data
**Setup**: Mock both GMGN and Birdeye to return same token data
**Action**: Call getToken()
**Expected**: Merges without duplication, idempotent merge

### 18.5 Edge case - collect called multiple times
**Description**: Should handle multiple calls to collect() without caching issues
**Setup**: Initialize builder and call collect() twice
**Action**: Call collect() multiple times
**Expected**: Each call attempts to fetch fresh data (rawData cache may prevent actual API calls)

### 18.6 Edge case - empty string vs null in required fields
**Description**: Should distinguish between empty strings and null for validation
**Setup**: Mock token with required field as empty string ''
**Action**: Validate token
**Expected**: Validation should handle empty strings appropriately (may need to check actual implementation)

### 18.7 Edge case - DB token with all nulls
**Description**: Should handle DB token where all optional fields are explicitly null
**Setup**: Mock DB token with null for all optional fields
**Action**: Call getOrCreate()
**Expected**: Correctly identifies missing required fields, fetches from APIs

### 18.8 Edge case - very large token supply values
**Description**: Should handle tokens with extremely large supply numbers
**Setup**: Mock token with totalSupply: 1e18 (or larger)
**Action**: Call getToken()
**Expected**: Handles large numbers correctly without precision loss

---

## 19. Chain ID Behavior Tests

### 19.1 Chain ID - correct chain used throughout flow
**Description**: Should maintain consistent chain ID across all API calls
**Setup**: Create builder with specific chain ID, mock all services
**Action**: Call getOrCreate()
**Expected**: All API calls use the same chain ID that was set/resolved

### 19.2 Chain ID - resolution updates builder state
**Description**: Should update builder's chain ID after resolution
**Setup**: Builder without chain ID, mock getInitialData
**Action**: Call getInitialData()
**Expected**: Builder's chainId property is updated with resolved value

### 19.3 Chain ID - used in RawTokenDataCache initialization
**Description**: Should pass correct chain ID when creating RawTokenDataCache
**Setup**: Builder with chain ID, call initialiseRawData
**Action**: Call initialiseRawData()
**Expected**: RawTokenDataCache is created with builder's chain ID

---

## Mock Requirements

### Services to Mock:
- `BirdEyeFetcherService`
  - `getInstance()`
  - `fetchTokenDataWithMarketCapFromAddress(address: string)`
  - `fetchTokenWithMarketCap(address: string, chainId: ChainId)`
- `Database`
  - `getInstance()`
  - `tokens.findOneByTokenAddress(address: string)`
  - `tokens.toModel(dbToken: Token)`
  - `tokens.upsertTokenFromTokenData(token: AutoTrackerToken)`
- `RawTokenDataCache`
  - `birdeye.getTokenOverview()`
  - `birdeye.getTokenSecurity()`
  - `birdeye.getMarkets()`
  - `gmgn.getTokenInfo()`
  - `gmgn.getGmgnSocials()`
- `AutoTrackerToken`
  - Static: `mergeMany(tokens: AutoTrackerToken[])`
  - Static: `validate(token: AutoTrackerToken)`
  - Instance: `hasMissingRequiredFields()`
- `GmGnMapper`
  - `mapGmGnTokenToAutoTrackerToken(tokenInfo, socials, chainId)`
- `BirdeyeMapper`
  - `mapBirdeyeTokenToAutoTrackerToken(overview, security, pairAddress, chainId)`

### Test Data Fixtures Needed:
- **Token addresses**: Valid Solana and EVM addresses
- **Chain IDs**: ChainId enum values (Solana, Ethereum, BSC, etc.)
- **Complete Birdeye responses**:
  - Token overview with all fields
  - Token security data (both EVM and Solana types)
  - Markets response with items array
- **Complete GMGN responses**:
  - Token info (GmGnMultiWindowTokenInfo)
  - Token socials (GmGnTokenSocials)
- **Partial token data**: Objects missing specific required fields
- **Database token records**: Prisma Token type with various field combinations
- **Raw data input structures**: RawDataInput with birdeye, gmgn, chainBase data
- **Market cap data**: TokenDataWithMarketCapAndRawData structure
- **AutoTrackerToken instances**: With various completeness levels

### Testing Utilities:
- **Mock factory functions**:
  - `createMockBirdeyeOverview(overrides?)`
  - `createMockBirdeyeSecurity(overrides?)`
  - `createMockBirdeyeMarkets(overrides?)`
  - `createMockGmgnTokenInfo(overrides?)`
  - `createMockGmgnSocials(overrides?)`
  - `createMockDbToken(overrides?)`
  - `createMockAutoTrackerToken(overrides?)`
  - `createMockRawDataInput(overrides?)`
- **Builder helpers**:
  - `createBuilderWithChainId(address, chainId, mocks?)`
  - `createBuilderWithoutChainId(address, mocks?)`
  - `setupMockServices()` - returns all mocked service instances
- **Assertion helpers**:
  - `expectTokenToBeComplete(token)` - checks all required fields present
  - `expectTokensToBeEqual(token1, token2, fields?)` - deep comparison
  - `expectValidationToFail(fn, missingFields)` - checks validation error

---

## Test File Structure

```
src/lib/services/token-builder/
├── token-builder.ts
├── token-builder.test.ts                    # Main test suite
├── __tests__/
│   ├── fixtures/
│   │   ├── birdeye-responses.ts             # Mock Birdeye API responses
│   │   ├── gmgn-responses.ts                # Mock GMGN API responses
│   │   ├── db-tokens.ts                     # Mock DB token records
│   │   ├── auto-tracker-tokens.ts           # Mock AutoTrackerToken instances
│   │   └── raw-data.ts                      # Mock raw data inputs
│   ├── helpers/
│   │   ├── mock-factories.ts                # Factory functions for creating test data
│   │   ├── mock-services.ts                 # Service mock setup utilities
│   │   └── assertions.ts                    # Custom assertion helpers
│   └── integration/
│       └── token-builder.integration.test.ts # Complex integration scenarios
```

---

## Test Execution Strategy

### Unit Tests (Fast, Isolated)
- Test individual methods with mocked dependencies
- Focus on logic and edge cases
- Run in parallel, no database needed

### Integration Tests (Slower, More Coverage)
- Test complete flows through multiple methods
- Use more realistic mock data
- Verify interactions between components

### Test Organization
- Group by method name using `describe()` blocks
- Use descriptive test names that explain the scenario
- Include setup, action, and expected outcome in each test
