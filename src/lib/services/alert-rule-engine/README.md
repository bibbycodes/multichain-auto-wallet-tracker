# Alert Rule Engine

A flexible, testable, and maintainable rule-based system for determining when to send token alerts.

## Features

- **Rule-Based Architecture**: Each security check is an independent, testable rule
- **Flexible Configuration**: Support for required rules, blocker rules, and optional rules with scoring
- **Easy to Extend**: Add new rules by implementing the `AlertRule` interface
- **Comprehensive Testing**: Each rule and the engine itself can be tested in isolation
- **Multiple Configurations**: Comes with strict, balanced, and permissive presets

## Quick Start

```typescript
import { AlertRuleEngine, balancedConfig } from './alert-rule-engine';
import { BaseContext } from '../token-context/base-context';

// Create engine with balanced configuration
const engine = new AlertRuleEngine(baseContext, balancedConfig);

// Evaluate and get decision
const decision = await engine.evaluate();

if (decision.shouldAlert) {
    console.log('✅ Alert should be sent:', decision.reason);
    console.log('Passed rules:', decision.passedRules);
} else {
    console.log('❌ Alert blocked:', decision.reason);
    console.log('Failed rules:', decision.failedRules);
}
```

## Predefined Configurations

### Strict Configuration
All security checks must pass. Maximum safety.

```typescript
import { strictConfig } from './configs';
const engine = new AlertRuleEngine(baseContext, strictConfig);
```

**Required Rules:**
- `is_renounced` - Contract ownership renounced
- `lp_burned` - LP tokens burned/locked
- `no_honeypot` - Not a honeypot
- `no_mintable` - Supply cannot be increased
- `no_pausable` - Transfers cannot be paused
- `no_freezable` - Wallets cannot be frozen
- `no_blacklist` - No blacklist functionality

### Balanced Configuration (Default)
Core security required, some flexibility on less critical checks.

```typescript
import { balancedConfig } from './configs';
const engine = new AlertRuleEngine(baseContext, balancedConfig);
```

**Required Rules:**
- `is_renounced`
- `lp_burned`

**Blocker Rules** (immediate rejection):
- `no_honeypot`
- `no_mintable`
- `no_pausable`
- `no_freezable`

**Optional Rules:**
- `no_blacklist` (50% must pass)

### Permissive Configuration
Only blocks honeypots, uses scoring for other checks.

```typescript
import { permissiveConfig } from './configs';
const engine = new AlertRuleEngine(baseContext, permissiveConfig);
```

**Blocker Rules:**
- `no_honeypot`

**Optional Rules** (60% must pass):
- All other security rules

## Custom Configuration

```typescript
import { AlertRuleConfig } from './types';

const customConfig: AlertRuleConfig = {
    // All must pass
    requiredRules: [
        'is_renounced',
        'lp_burned'
    ],
    
    // If any fail, immediately reject
    blockerRules: [
        'no_honeypot'
    ],
    
    // At least minOptionalScore must pass
    optionalRules: [
        'no_mintable',
        'no_pausable'
    ],
    minOptionalScore: 0.7, // 70%
    
    // Continue evaluating after blocker fails (for debugging)
    evaluateAllRules: true
};

const engine = new AlertRuleEngine(baseContext, customConfig);
```

## Creating Custom Rules

```typescript
import { AlertRule, RuleGroup, RuleResult } from './types';
import { BaseContextData } from '../token-context/types';

export class MinLiquidityRule implements AlertRule {
    name = 'min_liquidity';
    group = RuleGroup.LIQUIDITY;
    
    constructor(private minLiquidity: number = 10000) {}

    async evaluate(context: BaseContextData): Promise<RuleResult> {
        const { priceDetails } = context;
        const liquidity = priceDetails.liquidity;

        return {
            passed: liquidity >= this.minLiquidity,
            reason: liquidity >= this.minLiquidity
                ? `Liquidity (${liquidity}) meets minimum`
                : `Liquidity (${liquidity}) below minimum (${this.minLiquidity})`,
            severity: 'warning',
            metadata: { liquidity, minLiquidity: this.minLiquidity }
        };
    }
}

// Register custom rule
const customRule = new MinLiquidityRule(50000);
engine.registerRule(customRule);

// Add to config
const config = {
    requiredRules: ['min_liquidity', 'is_renounced']
};
```

## Available Rules

### Security Rules

| Rule Name | Description | Severity |
|-----------|-------------|----------|
| `is_renounced` | Contract ownership is renounced | Critical |
| `lp_burned` | LP tokens are burned/locked (>90%) | Critical |
| `no_honeypot` | Token is not a honeypot | Critical |
| `no_mintable` | Token supply cannot be increased | Critical |
| `no_pausable` | Transfers cannot be paused | Critical |
| `no_freezable` | Individual wallets cannot be frozen | Critical |
| `no_blacklist` | No blacklist functionality | Warning |

## Testing

### Testing Individual Rules

```typescript
import { IsRenouncedRule } from './rules/security/is-renounced-rule';

describe('IsRenouncedRule', () => {
    it('should pass when contract is renounced', async () => {
        const rule = new IsRenouncedRule();
        const context = {
            tokenSecurity: { isRenounced: true, /* ... */ }
        };
        
        const result = await rule.evaluate(context);
        
        expect(result.passed).toBe(true);
    });
});
```

### Testing the Engine

```typescript
import { AlertRuleEngine } from './alert-rule-engine';

describe('AlertRuleEngine', () => {
    it('should alert when all checks pass', async () => {
        const mockContext = createMockContext({
            tokenSecurity: {
                isRenounced: true,
                isLpTokenBurned: true,
                isHoneypot: false,
                // ...
            }
        });
        
        const engine = new AlertRuleEngine(mockContext);
        const decision = await engine.evaluate();
        
        expect(decision.shouldAlert).toBe(true);
    });
});
```

## Advanced Usage

### Debugging Failed Evaluations

```typescript
const decision = await engine.evaluate();

if (!decision.shouldAlert) {
    console.log('Alert blocked:', decision.reason);
    
    // Get detailed results
    for (const [ruleName, result] of decision.results!) {
        if (!result.passed) {
            console.log(`❌ ${ruleName}: ${result.reason} (${result.severity})`);
        }
    }
}
```

### Dynamic Rule Management

```typescript
// Get all registered rules
const rules = engine.getRules();
console.log(`Registered rules: ${rules.map(r => r.name).join(', ')}`);

// Unregister a rule
engine.unregisterRule('no_blacklist');

// Register multiple rules at once
[rule1, rule2, rule3].forEach(rule => engine.registerRule(rule));
```

### Evaluation Summary

```typescript
const decision = await engine.evaluate();
const summary = engine.getSummary(decision.results!);

console.log(`
    Total Rules: ${summary.totalRules}
    Passed: ${summary.passedRules}
    Failed: ${summary.failedRules}
    Critical Failures: ${summary.criticalFailures}
    Warning Failures: ${summary.warningFailures}
`);
```

## Architecture

```
alert-rule-engine/
├── types.ts                    # Core interfaces and types
├── alert-rule-engine.ts        # Main engine implementation
├── rules/                      # Rule implementations
│   ├── security/               # Security-related rules
│   │   ├── is-renounced-rule.ts
│   │   ├── lp-burned-rule.ts
│   │   └── ...
│   ├── distribution/           # Distribution rules (future)
│   └── liquidity/              # Liquidity rules (future)
├── configs/                    # Predefined configurations
│   ├── strict-config.ts
│   ├── balanced-config.ts
│   └── permissive-config.ts
└── tests/                      # Test files
    ├── alert-rule-engine.test.ts
    └── rules/
        └── ...
```

## Best Practices

1. **Keep Rules Focused**: Each rule should check one thing
2. **Use Meaningful Names**: Rule names should be self-documenting
3. **Add Helpful Reasons**: Explain why a rule passed or failed
4. **Test Thoroughly**: Test rules independently and in combination
5. **Use Appropriate Severity**: Critical for blockers, Warning for soft checks
6. **Add Metadata**: Include relevant data in results for debugging

## Future Enhancements

- [ ] Distribution rules (holder concentration, whale detection)
- [ ] Liquidity rules (minimum liquidity, liquidity changes)
- [ ] Market rules (volume, price action)
- [ ] Tax rules (buy/sell tax thresholds)
- [ ] Rule dependencies (Rule A requires Rule B)
- [ ] Rule weights (some rules more important than others)
- [ ] Async rule evaluation with timeout
- [ ] Rule execution logging/telemetry

