# Alert Rule Engine

The Alert Rule Engine provides a flexible, configurable system for evaluating tokens and determining if they meet your criteria for alerts. It supports multiple rule types, weighted scoring, and sophisticated decision-making logic.

## Overview

The engine supports five types of rules, evaluated in this order:

1. **Blocker Rules** - Any failure = immediate rejection (no further evaluation)
2. **Blacklist Rules** - All must pass (any failure = rejection)
3. **Whitelist Rules** - At least one must pass (all failures = rejection)
4. **Required Rules** - All must pass
5. **Optional Rules** - Scored with configurable threshold

## Rule Types Explained

### Blocker Rules

**Use case**: Critical security checks that should immediately reject tokens.

```typescript
const config = {
    blockerRules: ['no_honeypot', 'no_mintable'],
    evaluateAllRules: false  // Stop immediately on blocker failure
};
```

**Behavior**:
- If ANY blocker rule fails, immediately reject without checking other rules
- Fast-fail for obvious scams
- Most efficient for high-volume filtering

**Example**: If `no_honeypot` fails, don't bother checking anything else.

### Blacklist Rules

**Use case**: Rules where ALL must pass, but you want to see all failures for debugging.

```typescript
const config = {
    blacklistRules: ['no_pausable', 'no_freezable', 'no_proxy_contract']
};
```

**Behavior**:
- ALL blacklist rules must pass
- If any fail, alert is rejected
- Evaluated after blockers
- Similar to required rules, but semantically different (things to avoid vs. things needed)

**Example**: Token must not have pausable, freezable, or proxy functionality.

### Whitelist Rules

**Use case**: At least ONE good thing must be true (OR logic).

```typescript
const config = {
    whitelistRules: ['is_renounced', 'lp_locked', 'verified_contract']
};
```

**Behavior**:
- At least ONE whitelist rule must pass
- If ALL fail, alert is rejected
- Useful for "must have at least one of these protections"

**Example**: Token must have at least one of: renounced ownership, locked LP, or verified contract.

### Required Rules

**Use case**: Rules that ALL must pass (AND logic).

```typescript
const config = {
    requiredRules: ['is_renounced', 'lp_burned']
};
```

**Behavior**:
- ALL required rules must pass
- If any fail, alert is rejected
- Evaluated after blacklist/whitelist

**Example**: Token must have renounced ownership AND burned LP.

### Optional Rules

**Use case**: Nice-to-have checks with scoring/weighting.

```typescript
const config = {
    optionalRules: ['no_blacklist', 'low_tax', 'good_distribution'],
    minOptionalScore: 0.7  // 70% required
};
```

**Behavior**:
- Scored based on how many pass
- Supports weighted scoring (see below)
- Must meet minimum threshold

**Example**: Token should pass 70% of optional checks.

## Weighted Scoring System

Instead of treating all rules equally (1 rule = 1 point), weighted scoring lets you say:
- "Honeypot detection is 3x more important than blacklist checks"
- "LP burned + Renounced together are as important as no honeypot"

## How It Works

### Score Calculation

```
Actual Score = Sum of (weight × passed) for each rule
Max Possible Score = Sum of all weights
Normalized Score = Actual Score / Max Possible Score (0-1)
```

### Example

With rules:
- `no_honeypot` (weight: 3.0) ✅ Pass
- `is_renounced` (weight: 2.0) ✅ Pass
- `lp_burned` (weight: 2.0) ❌ Fail
- `no_blacklist` (weight: 1.0) ✅ Pass

Calculation:
```
Actual Score = 3.0 + 2.0 + 0 + 1.0 = 6.0
Max Possible = 3.0 + 2.0 + 2.0 + 1.0 = 8.0
Normalized = 6.0 / 8.0 = 0.75 (75%)
```

## Usage

### Method 1: Configuration Weights

Define weights in your configuration:

```typescript
import { AlertRuleEngine } from './alert-rule-engine';

const config = {
    optionalRules: [
        'no_honeypot',
        'no_mintable',
        'is_renounced',
        'lp_burned'
    ],
    ruleWeights: {
        'no_honeypot': 3.0,   // Critical
        'no_mintable': 3.0,   // Critical
        'is_renounced': 2.0,  // High
        'lp_burned': 2.0,     // High
        // Other rules default to 1.0
    },
    minOptionalScore: 0.75 // 75% required
};

const engine = new AlertRuleEngine(baseContext, config);
const decision = await engine.evaluate();

console.log(`Score: ${decision.scoreDetails.actualScore}/${decision.scoreDetails.maxPossibleScore}`);
console.log(`Normalized: ${(decision.scoreDetails.normalizedScore * 100).toFixed(0)}%`);
```

### Method 2: Rule Default Weights

Define weights in the rule itself:

```typescript
import { AlertRule, RuleGroup, RuleResult } from './types';

class CriticalSecurityRule implements AlertRule {
    name = 'critical_check';
    group = RuleGroup.SECURITY;
    weight = 5.0; // Very important rule

    async evaluate(context: BaseContextData): Promise<RuleResult> {
        // ... evaluation logic
    }
}

// Config can still override if needed
const config = {
    optionalRules: ['critical_check', 'other_rule'],
    ruleWeights: {
        'critical_check': 3.0  // Override to 3.0 instead of 5.0
    }
};
```

### Method 3: Use Predefined Weighted Config

```typescript
import { weightedConfig } from './configs';

const engine = new AlertRuleEngine(baseContext, weightedConfig);
```

## Predefined Weighted Configuration

The `weightedConfig` uses this priority structure:

| Priority | Weight | Rules |
|----------|--------|-------|
| **Critical** | 3.0 | no_honeypot, no_mintable, no_pausable |
| **High** | 2.0 | is_renounced, lp_burned |
| **Medium** | 1.0 | no_freezable, no_blacklist |

**Total Max Score:** 15.0 (3+3+3+2+2+1+1)
**Required Score:** 75% (11.25/15.0)

### Score Scenarios

**Scenario 1: Perfect Token**
```
All rules pass
Score: 15.0/15.0 = 100% ✅ ALERT
```

**Scenario 2: Minor Issue (Blacklist)**
```
Only blacklist fails (-1.0)
Score: 14.0/15.0 = 93% ✅ ALERT
```

**Scenario 3: Critical Issue (Honeypot)**
```
Honeypot fails (-3.0)
Score: 12.0/15.0 = 80% ✅ ALERT (still passes!)
```

**Scenario 4: Multiple High Issues**
```
Renounced + LP burned fail (-4.0)
Score: 11.0/15.0 = 73% ❌ BLOCKED
```

**Scenario 5: Multiple Medium + High**
```
Renounced + Freezable + Blacklist fail (-4.0)
Score: 11.0/15.0 = 73% ❌ BLOCKED
```

## Detailed Score Information

The decision includes detailed scoring information:

```typescript
const decision = await engine.evaluate();

if (decision.scoreDetails) {
    console.log('Score Breakdown:');
    console.log(`  Actual: ${decision.scoreDetails.actualScore}`);
    console.log(`  Maximum: ${decision.scoreDetails.maxPossibleScore}`);
    console.log(`  Normalized: ${(decision.scoreDetails.normalizedScore * 100).toFixed(1)}%`);
    console.log('\nPer-Rule Breakdown:');
    
    for (const [ruleName, score] of decision.scoreDetails.ruleScores) {
        const status = score.passed ? '✅' : '❌';
        console.log(`  ${status} ${ruleName}: ${score.contribution}/${score.weight}`);
    }
}
```

Example output:
```
Score Breakdown:
  Actual: 12.0
  Maximum: 15.0
  Normalized: 80.0%

Per-Rule Breakdown:
  ❌ no_honeypot: 0/3.0
  ✅ no_mintable: 3.0/3.0
  ✅ no_pausable: 3.0/3.0
  ✅ is_renounced: 2.0/2.0
  ✅ lp_burned: 2.0/2.0
  ✅ no_freezable: 1.0/1.0
  ✅ no_blacklist: 1.0/1.0
```

## Weight Guidelines

### Choosing Weights

**Critical (3.0-5.0)**: Deal-breakers that indicate high risk
- Honeypot detection
- Mintable supply
- Pausable transfers
- Hidden backdoors

**High (2.0-2.5)**: Very important but might have legitimate use cases
- Contract renounced
- LP burned/locked
- Open source verification

**Medium (1.0-1.5)**: Important but not critical
- Freezable functionality
- Blacklist capability
- Moderate taxes

**Low (0.5-0.9)**: Nice to have
- Minor UX issues
- Documentation quality
- Community engagement

### Weight Strategies

**Conservative (High Threshold)**
```typescript
ruleWeights: {
    'critical_checks': 5.0,
    'important_checks': 2.0,
    'nice_to_have': 1.0
},
minOptionalScore: 0.85 // 85% required
```

**Balanced (Mixed Weights)**
```typescript
ruleWeights: {
    'critical': 3.0,
    'high': 2.0,
    'medium': 1.0
},
minOptionalScore: 0.75 // 75% required
```

**Aggressive (Low Threshold)**
```typescript
ruleWeights: {
    'critical': 3.0,
    'all_others': 1.0
},
minOptionalScore: 0.60 // 60% required
```

## Advanced Patterns

### Dynamic Weights Based on Chain

```typescript
const weights = chainId === 'solana' 
    ? { 'no_freezable': 5.0 }  // Very important on Solana
    : { 'no_freezable': 1.0 }; // Less critical on EVM

const config = {
    optionalRules: ['no_freezable', 'is_renounced'],
    ruleWeights: weights,
    minOptionalScore: 0.7
};
```

### Category-Based Weights

```typescript
const categoryWeights = {
    SECURITY: 3.0,
    LIQUIDITY: 2.0,
    DISTRIBUTION: 1.5,
    MARKET: 1.0
};

// Apply weights based on rule group
for (const rule of engine.getRules()) {
    if (!config.ruleWeights[rule.name]) {
        config.ruleWeights[rule.name] = categoryWeights[rule.group];
    }
}
```

### Conditional Weights

```typescript
// Increase weight for certain rules based on context
if (tokenData.marketCap < 100000) {
    config.ruleWeights['lp_burned'] = 5.0; // Very important for low caps
}
```

## Benefits

1. **Flexibility**: Adjust importance without changing rules
2. **Transparency**: Clear reasoning for decisions
3. **Debuggability**: See exact contribution of each rule
4. **Configurability**: Different strategies for different scenarios
5. **Scalability**: Easy to add new rules without rebalancing

## Comparison: Unweighted vs Weighted

### Unweighted (Simple)
```
All rules equal = 1 point
Score = Passed Rules / Total Rules
Example: 6/8 = 75%
```

**Problem**: Treating honeypot detection same as blacklist check

### Weighted (Smart)
```
Rules have different importance
Score = Weighted Passed / Total Weighted
Example: (3+3+2+0+1) / (3+3+2+2+1) = 9/11 = 82%
```

**Benefit**: Critical rules have more impact on final score

## Best Practices

1. **Start Simple**: Use default weights (1.0) initially
2. **Measure Impact**: Log score details to understand patterns
3. **Iterate**: Adjust weights based on false positives/negatives
4. **Document**: Explain why certain rules have higher weights
5. **Test**: Create scenarios to validate weight distribution
6. **Review**: Periodically reassess weights as threats evolve

## Testing

```typescript
describe('Custom Weighted Rules', () => {
    it('should prioritize critical security over minor issues', async () => {
        const config = {
            optionalRules: ['critical', 'minor'],
            ruleWeights: { 'critical': 10.0, 'minor': 1.0 },
            minOptionalScore: 0.8
        };
        
        // Critical passes, minor fails
        // Score: 10/11 = 91% - Should pass
        
        // Critical fails, minor passes  
        // Score: 1/11 = 9% - Should fail
    });
});
```

## Combining Rule Types

You can combine different rule types for sophisticated filtering:

### Example 1: Strict Security Filter

```typescript
const strictConfig = {
    // Must not be a honeypot (immediate reject if true)
    blockerRules: ['no_honeypot'],

    // Must not have any of these dangerous features
    blacklistRules: ['no_mintable', 'no_pausable', 'no_proxy'],

    // Must have at least one form of protection
    whitelistRules: ['is_renounced', 'lp_locked'],

    // Both of these are required
    requiredRules: ['verified_contract', 'no_freezable'],

    // Nice to have, but not required
    optionalRules: ['low_tax', 'good_distribution'],
    minOptionalScore: 0.5
};
```

**Evaluation flow**:
1. ❌ If honeypot → reject immediately
2. ❌ If mintable/pausable/proxy → reject
3. ❌ If not renounced AND not LP locked → reject
4. ❌ If not verified OR is freezable → reject
5. ✅/❌ If < 50% of optional checks pass → reject

### Example 2: Balanced Filter (Recommended)

```typescript
const balancedConfig = {
    // Critical security only
    blockerRules: ['no_honeypot'],

    // Must have at least one protection
    whitelistRules: ['is_renounced', 'lp_burned', 'lp_locked'],

    // Everything else is optional with weights
    optionalRules: [
        'no_mintable',
        'no_pausable',
        'no_freezable',
        'no_blacklist',
        'low_tax',
        'good_distribution'
    ],
    ruleWeights: {
        'no_mintable': 3.0,    // Critical
        'no_pausable': 3.0,    // Critical
        'no_freezable': 2.0,   // High
        'no_blacklist': 1.0,   // Medium
        'low_tax': 1.0,        // Medium
        'good_distribution': 1.0  // Medium
    },
    minOptionalScore: 0.70  // 70% of weighted score
};
```

### Example 3: Aggressive Filter (More Alerts)

```typescript
const aggressiveConfig = {
    // Only block obvious scams
    blockerRules: ['no_honeypot'],

    // Just need one good sign
    whitelistRules: ['is_renounced', 'lp_burned', 'verified_contract'],

    // Lower threshold for alerts
    optionalRules: ['no_mintable', 'no_pausable', 'low_tax'],
    minOptionalScore: 0.33  // Only 33% required
};
```

### Example 4: Conservative Filter (Fewer Alerts)

```typescript
const conservativeConfig = {
    blockerRules: ['no_honeypot', 'no_mintable', 'no_pausable'],

    blacklistRules: ['no_freezable', 'no_proxy'],

    whitelistRules: ['is_renounced'],  // Must be renounced

    requiredRules: ['lp_burned'],  // AND must have burned LP

    optionalRules: ['no_blacklist', 'low_tax', 'verified_contract'],
    minOptionalScore: 0.80  // 80% required
};
```

## Blacklist vs Whitelist vs Required

These three rule types can be confusing. Here's when to use each:

| Rule Type | Logic | Use When |
|-----------|-------|----------|
| **Blacklist** | ALL must pass (AND) | Checking for bad things that must NOT exist |
| **Whitelist** | At least ONE must pass (OR) | Checking for good things where at least one is needed |
| **Required** | ALL must pass (AND) | Checking for good things that ALL are needed |

**Example scenarios**:

```typescript
// Scenario 1: Token must NOT have dangerous features (blacklist)
blacklistRules: ['no_mintable', 'no_pausable', 'no_proxy']
// All three must pass (token must not be mintable AND not pausable AND not a proxy)

// Scenario 2: Token must have SOME protection (whitelist)
whitelistRules: ['is_renounced', 'lp_locked', 'verified_contract']
// At least one must pass (renounced OR locked OR verified)

// Scenario 3: Token must have ALL protections (required)
requiredRules: ['is_renounced', 'lp_burned']
// Both must pass (renounced AND burned)

// Combining them:
{
    blacklistRules: ['no_honeypot', 'no_mintable'],  // Must not be scam
    whitelistRules: ['is_renounced', 'lp_locked'],   // Must have some protection
    requiredRules: ['verified_contract']             // Must be verified
}
// Token must: NOT be (honeypot OR mintable) AND have (renounced OR locked) AND be verified
```

## Blocker vs Blacklist

Both reject on failure, but they differ in timing:

| Feature | Blocker | Blacklist |
|---------|---------|-----------|
| **Evaluation** | First (before everything) | Second (after blockers) |
| **Short-circuit** | Yes (stops immediately) | No (evaluates all) |
| **Use case** | Fast rejection of obvious scams | Comprehensive checks with full feedback |
| **Performance** | Faster | Slower but more informative |

```typescript
// Use blocker for expensive checks or obvious scams
blockerRules: ['no_honeypot']  // If honeypot, don't waste time on other checks

// Use blacklist when you want to see ALL failures
blacklistRules: ['no_mintable', 'no_pausable', 'no_freezable']
// Even if mintable fails, still check pausable and freezable for debugging
```

## Migration from Unweighted

If you're currently using unweighted scoring:

```typescript
// Old (unweighted)
optionalRules: ['rule1', 'rule2', 'rule3'],
minOptionalScore: 0.67  // 2/3 rules

// New (weighted, equivalent)
optionalRules: ['rule1', 'rule2', 'rule3'],
ruleWeights: { 'rule1': 1.0, 'rule2': 1.0, 'rule3': 1.0 },
minOptionalScore: 0.67  // Same threshold
```

Then gradually adjust weights:
```typescript
ruleWeights: {
    'rule1': 2.0,  // More important
    'rule2': 1.0,  // Keep same
    'rule3': 0.5   // Less important
}
```

## Quick Reference: All Rule Types

```typescript
const config: AlertRuleConfig = {
    // 1. Blocker: ANY fail = immediate reject (fastest)
    blockerRules: ['no_honeypot'],
    evaluateAllRules: false,  // Stop on first blocker failure

    // 2. Blacklist: ALL must pass (things to avoid)
    blacklistRules: ['no_mintable', 'no_pausable'],

    // 3. Whitelist: At least ONE must pass (need some protection)
    whitelistRules: ['is_renounced', 'lp_locked'],

    // 4. Required: ALL must pass (must-have features)
    requiredRules: ['verified_contract'],

    // 5. Optional: Scored with weights (nice-to-have)
    optionalRules: ['low_tax', 'good_distribution'],
    ruleWeights: {
        'low_tax': 2.0,
        'good_distribution': 1.0
    },
    minOptionalScore: 0.7
};
```

