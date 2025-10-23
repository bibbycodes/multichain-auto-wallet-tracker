import { createMockAlert, createMockToken } from '../../../../tests/mocks/common';
import { ChainsMap } from '../../../shared/chains';
import { PriceUpdateContext } from './price-update-context';

describe('PriceUpdateContext', () => {
    const mockNow = new Date('2024-01-15T12:00:00.000Z');
    const mockToken = createMockToken({
        address: '0xtoken123',
        symbol: 'TEST',
        totalSupply: 1000000000,
        chainId: ChainsMap.bsc,
    });


    beforeEach(() => {
        jest.useFakeTimers();
        jest.setSystemTime(mockNow);
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    describe('Constructor and basic properties', () => {
        it('should create context with all required properties', () => {
            const signalAlert = createMockAlert({
                token_address: '0xtoken123',
                price: 0.001,
                market_cap: 1000000,
            });
            const context = new PriceUpdateContext({
                signalAlert,
                token: mockToken,
                currentPrice: 0.002,
                currentMcap: 2000000,
                priceUpdateCount: 0,
            });

            expect(context.signalAlert).toBe(signalAlert);
            expect(context.token).toBe(mockToken);
            expect(context.currentPrice).toBe(0.002);
            expect(context.currentMcap).toBe(2000000);
            expect(context.priceUpdateCount).toBe(0);
            expect(context.lastPriceUpdate).toBeUndefined();
        });

        it('should create context with optional lastPriceUpdate', () => {
            const signalAlert = createMockAlert();
            const lastUpdate = createMockAlert({
                id: 'alert-2',
                type: 'PRICE_UPDATE',
                created_at: new Date('2024-01-15T11:00:00.000Z'),
            });

            const context = new PriceUpdateContext({
                signalAlert,
                token: mockToken,
                currentPrice: 0.002,
                currentMcap: 2000000,
                lastPriceUpdate: lastUpdate,
                priceUpdateCount: 1,
            });

            expect(context.lastPriceUpdate).toBe(lastUpdate);
            expect(context.priceUpdateCount).toBe(1);
        });
    });

    describe('Time calculations', () => {
        it('should calculate timeSinceSignal correctly', () => {
            const signalAlert = createMockAlert({
                created_at: new Date('2024-01-15T10:00:00.000Z'), // 2 hours ago
            });

            const context = new PriceUpdateContext({
                signalAlert,
                token: mockToken,
                currentPrice: 0.002,
                currentMcap: 2000000,
                priceUpdateCount: 0,
            });

            expect(context.timeSinceSignal).toBe(2 * 60 * 60 * 1000); // 2 hours in milliseconds
        });

        it('should calculate timeSinceLastUpdate when lastUpdate is provided', () => {
            const signalAlert = createMockAlert({
                created_at: new Date('2024-01-15T10:00:00.000Z'),
            });
            const lastUpdate = createMockAlert({
                created_at: new Date('2024-01-15T11:30:00.000Z'), // 30 minutes ago
            });

            const context = new PriceUpdateContext({
                signalAlert,
                token: mockToken,
                currentPrice: 0.002,
                currentMcap: 2000000,
                lastPriceUpdate: lastUpdate,
                priceUpdateCount: 1,
            });

            expect(context.timeSinceLastUpdate).toBe(30 * 60 * 1000); // 30 minutes in milliseconds
        });

        it('should have undefined timeSinceLastUpdate when no lastUpdate provided', () => {
            const signalAlert = createMockAlert();
            const context = new PriceUpdateContext({
                signalAlert,
                token: mockToken,
                currentPrice: 0.002,
                currentMcap: 2000000,
                priceUpdateCount: 0,
            });

            expect(context.timeSinceLastUpdate).toBeUndefined();
        });

        it('should handle zero time differences', () => {
            const signalAlert = createMockAlert({
                created_at: mockNow, // Same time as now
            });

            const context = new PriceUpdateContext({
                signalAlert,
                token: mockToken,
                currentPrice: 0.002,
                currentMcap: 2000000,
                priceUpdateCount: 0,
            });

            expect(context.timeSinceSignal).toBe(0);
        });
    });

    describe('Multiplier calculations', () => {
        it('should calculate priceMultiplier correctly', () => {
            const signalAlert = createMockAlert({ price: 0.001 });
            const context = new PriceUpdateContext({
                signalAlert,
                token: mockToken,
                currentPrice: 0.002, // 2x the signal price
                currentMcap: 2000000,
                priceUpdateCount: 0,
            });

            expect(context.priceMultiplier).toBe(2);
        });

        it('should calculate mcapMultiplier correctly', () => {
            const signalAlert = createMockAlert({ market_cap: 1000000 });
            const context = new PriceUpdateContext({
                signalAlert,
                token: mockToken,
                currentPrice: 0.002,
                currentMcap: 3000000, // 3x the signal mcap
                priceUpdateCount: 0,
            });

            expect(context.mcapMultiplier).toBe(3);
        });

        it('should handle fractional multipliers', () => {
            const signalAlert = createMockAlert({ price: 0.002 });
            const context = new PriceUpdateContext({
                signalAlert,
                token: mockToken,
                currentPrice: 0.001, // 0.5x the signal price
                currentMcap: 2000000,
                priceUpdateCount: 0,
            });

            expect(context.priceMultiplier).toBe(0.5);
        });

        it('should handle zero signal price', () => {
            const signalAlert = createMockAlert({ price: 0 });
            const context = new PriceUpdateContext({
                signalAlert,
                token: mockToken,
                currentPrice: 0.001,
                currentMcap: 2000000,
                priceUpdateCount: 0,
            });

            expect(context.priceMultiplier).toBe(Infinity);
        });

        it('should handle zero signal market cap', () => {
            const signalAlert = createMockAlert({ market_cap: 0 });
            const context = new PriceUpdateContext({
                signalAlert,
                token: mockToken,
                currentPrice: 0.002,
                currentMcap: 2000000,
                priceUpdateCount: 0,
            });

            expect(context.mcapMultiplier).toBe(Infinity);
        });

        it('should handle very small multipliers', () => {
            const signalAlert = createMockAlert({ price: 0.000001 });
            const context = new PriceUpdateContext({
                signalAlert,
                token: mockToken,
                currentPrice: 0.0000005, // 0.5x
                currentMcap: 2000000,
                priceUpdateCount: 0,
            });

            expect(context.priceMultiplier).toBe(0.5);
        });
    });

    describe('isFirstUpdate property', () => {
        it('should return true when priceUpdateCount is 0', () => {
            const signalAlert = createMockAlert();
            const context = new PriceUpdateContext({
                signalAlert,
                token: mockToken,
                currentPrice: 0.002,
                currentMcap: 2000000,
                priceUpdateCount: 0,
            });

            expect(context.isFirstUpdate).toBe(true);
        });

        it('should return false when priceUpdateCount is greater than 0', () => {
            const signalAlert = createMockAlert();
            const context = new PriceUpdateContext({
                signalAlert,
                token: mockToken,
                currentPrice: 0.002,
                currentMcap: 2000000,
                priceUpdateCount: 1,
            });

            expect(context.isFirstUpdate).toBe(false);
        });

        it('should return false for large priceUpdateCount values', () => {
            const signalAlert = createMockAlert();
            const context = new PriceUpdateContext({
                signalAlert,
                token: mockToken,
                currentPrice: 0.002,
                currentMcap: 2000000,
                priceUpdateCount: 10,
            });

            expect(context.isFirstUpdate).toBe(false);
        });
    });

    describe('toObject method', () => {
        it('should return complete context data', () => {
            const signalAlert = createMockAlert({
                price: 0.001,
                created_at: new Date('2024-01-15T10:00:00.000Z'),
            });
            const lastUpdate = createMockAlert({
                id: 'alert-2',
                created_at: new Date('2024-01-15T11:00:00.000Z'),
            });

            const context = new PriceUpdateContext({
                signalAlert,
                token: mockToken,
                currentPrice: 0.002,
                currentMcap: 2000000,
                lastPriceUpdate: lastUpdate,
                priceUpdateCount: 1,
            });

            const contextData = context.toObject();

            expect(contextData).toEqual({
                signalAlert,
                token: mockToken,
                currentPrice: 0.002,
                currentMcap: 2000000,
                lastPriceUpdate: lastUpdate,
                priceUpdateCount: 1,
                timeSinceSignal: 2 * 60 * 60 * 1000,
                timeSinceLastUpdate: 1 * 60 * 60 * 1000,
                priceMultiplier: 2, // 0.002 / 0.001
                mcapMultiplier: 2, // 2000000 / 1000000
            });
        });

        it('should return context data without lastPriceUpdate', () => {
            const signalAlert = createMockAlert();
            const context = new PriceUpdateContext({
                signalAlert,
                token: mockToken,
                currentPrice: 0.002,
                currentMcap: 2000000,
                priceUpdateCount: 0,
            });

            const contextData = context.toObject();

            expect(contextData.lastPriceUpdate).toBeUndefined();
            expect(contextData.timeSinceLastUpdate).toBeUndefined();
        });
    });

    describe('Edge cases and error handling', () => {
        it('should handle negative time differences', () => {
            const signalAlert = createMockAlert({
                created_at: new Date('2024-01-15T13:00:00.000Z'), // 1 hour in the future
            });

            const context = new PriceUpdateContext({
                signalAlert,
                token: mockToken,
                currentPrice: 0.002,
                currentMcap: 2000000,
                priceUpdateCount: 0,
            });

            expect(context.timeSinceSignal).toBe(-60 * 60 * 1000); // Negative 1 hour
        });

        it('should handle very large time differences', () => {
            const signalAlert = createMockAlert({
                created_at: new Date('2020-01-01T00:00:00.000Z'), // 4 years ago
            });

            const context = new PriceUpdateContext({
                signalAlert,
                token: mockToken,
                currentPrice: 0.002,
                currentMcap: 2000000,
                priceUpdateCount: 0,
            });

            // Calculate actual time difference from 2020-01-01 to 2024-01-15
            const actualTimeDiff = mockNow.getTime() - new Date('2020-01-01T00:00:00.000Z').getTime();
            expect(context.timeSinceSignal).toBe(actualTimeDiff);
        });

        it('should handle very small price differences', () => {
            const signalAlert = createMockAlert({ price: 0.0000001 });
            const context = new PriceUpdateContext({
                signalAlert,
                token: mockToken,
                currentPrice: 0.0000002, // 2x
                currentMcap: 2000000,
                priceUpdateCount: 0,
            });

            expect(context.priceMultiplier).toBe(2);
        });

        it('should handle very large multipliers', () => {
            const signalAlert = createMockAlert({ price: 0.000001 });
            const context = new PriceUpdateContext({
                signalAlert,
                token: mockToken,
                currentPrice: 0.001, // 1000x
                currentMcap: 2000000,
                priceUpdateCount: 0,
            });

            expect(context.priceMultiplier).toBeCloseTo(1000, 10);
        });
    });

    describe('Real-world scenarios', () => {
        it('should work with typical price increase scenario', () => {
            const signalAlert = createMockAlert({
                price: 0.0001,
                market_cap: 100000,
                created_at: new Date('2024-01-15T09:00:00.000Z'), // 3 hours ago
            });

            const lastUpdate = createMockAlert({
                id: 'alert-2',
                created_at: new Date('2024-01-15T11:00:00.000Z'), // 1 hour ago
            });

            const context = new PriceUpdateContext({
                signalAlert,
                token: mockToken,
                currentPrice: 0.0005, // 5x increase
                currentMcap: 500000, // 5x increase
                lastPriceUpdate: lastUpdate,
                priceUpdateCount: 1,
            });

            expect(context.priceMultiplier).toBe(5);
            expect(context.mcapMultiplier).toBe(5);
            expect(context.timeSinceSignal).toBe(3 * 60 * 60 * 1000);
            expect(context.timeSinceLastUpdate).toBe(1 * 60 * 60 * 1000);
            expect(context.isFirstUpdate).toBe(false);
        });

        it('should work with price decrease scenario', () => {
            const signalAlert = createMockAlert({
                price: 0.001,
                market_cap: 1000000,
                created_at: new Date('2024-01-15T10:00:00.000Z'), // 2 hours ago
            });

            const context = new PriceUpdateContext({
                signalAlert,
                token: mockToken,
                currentPrice: 0.0005, // 50% decrease
                currentMcap: 500000, // 50% decrease
                priceUpdateCount: 0,
            });

            expect(context.priceMultiplier).toBe(0.5);
            expect(context.mcapMultiplier).toBe(0.5);
            expect(context.isFirstUpdate).toBe(true);
        });

        it('should work with first update scenario', () => {
            const signalAlert = createMockAlert({
                price: 0.0001,
                market_cap: 100000,
                created_at: new Date('2024-01-15T11:30:00.000Z'), // 30 minutes ago
            });

            const context = new PriceUpdateContext({
                signalAlert,
                token: mockToken,
                currentPrice: 0.0002, // 2x increase
                currentMcap: 200000, // 2x increase
                priceUpdateCount: 0,
            });

            expect(context.isFirstUpdate).toBe(true);
            expect(context.lastPriceUpdate).toBeUndefined();
            expect(context.timeSinceLastUpdate).toBeUndefined();
        });
    });
});
