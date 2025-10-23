import { 
    xMinutesAgo, xSecondsAgo, xHoursAgo, xDaysAgo, xMonthsAgo, xYearsAgo,
    xMinutesFromNow, xSecondsFromNow, xHoursFromNow, xDaysFromNow, xMonthsFromNow, xYearsFromNow
} from '../date';

describe('Date Utils', () => {
    const mockNow = new Date('2024-01-15T12:00:00.000Z');
    
    beforeEach(() => {
        jest.useFakeTimers();
        jest.setSystemTime(mockNow);
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    describe('xMinutesAgo', () => {
        it('should return correct date for 1 minute ago', () => {
            const result = xMinutesAgo(1);
            const expected = new Date('2024-01-15T11:59:00.000Z');
            expect(result).toEqual(expected);
        });

        it('should return correct date for 30 minutes ago', () => {
            const result = xMinutesAgo(30);
            const expected = new Date('2024-01-15T11:30:00.000Z');
            expect(result).toEqual(expected);
        });

        it('should return correct date for 0 minutes ago', () => {
            const result = xMinutesAgo(0);
            expect(result).toEqual(mockNow);
        });

        it('should handle negative values', () => {
            const result = xMinutesAgo(-5);
            const expected = new Date('2024-01-15T12:05:00.000Z');
            expect(result).toEqual(expected);
        });

        it('should handle large values', () => {
            const result = xMinutesAgo(1440); // 24 hours in minutes
            const expected = new Date('2024-01-14T12:00:00.000Z');
            expect(result).toEqual(expected);
        });
    });

    describe('xSecondsAgo', () => {
        it('should return correct date for 1 second ago', () => {
            const result = xSecondsAgo(1);
            const expected = new Date('2024-01-15T11:59:59.000Z');
            expect(result).toEqual(expected);
        });

        it('should return correct date for 30 seconds ago', () => {
            const result = xSecondsAgo(30);
            const expected = new Date('2024-01-15T11:59:30.000Z');
            expect(result).toEqual(expected);
        });

        it('should return correct date for 0 seconds ago', () => {
            const result = xSecondsAgo(0);
            expect(result).toEqual(mockNow);
        });

        it('should handle negative values', () => {
            const result = xSecondsAgo(-10);
            const expected = new Date('2024-01-15T12:00:10.000Z');
            expect(result).toEqual(expected);
        });

        it('should handle large values', () => {
            const result = xSecondsAgo(3600); // 1 hour in seconds
            const expected = new Date('2024-01-15T11:00:00.000Z');
            expect(result).toEqual(expected);
        });
    });

    describe('xHoursAgo', () => {
        it('should return correct date for 1 hour ago', () => {
            const result = xHoursAgo(1);
            const expected = new Date('2024-01-15T11:00:00.000Z');
            expect(result).toEqual(expected);
        });

        it('should return correct date for 12 hours ago', () => {
            const result = xHoursAgo(12);
            const expected = new Date('2024-01-15T00:00:00.000Z');
            expect(result).toEqual(expected);
        });

        it('should return correct date for 0 hours ago', () => {
            const result = xHoursAgo(0);
            expect(result).toEqual(mockNow);
        });

        it('should handle negative values', () => {
            const result = xHoursAgo(-2);
            const expected = new Date('2024-01-15T14:00:00.000Z');
            expect(result).toEqual(expected);
        });

        it('should handle large values', () => {
            const result = xHoursAgo(48); // 2 days in hours
            const expected = new Date('2024-01-13T12:00:00.000Z');
            expect(result).toEqual(expected);
        });
    });

    describe('xDaysAgo', () => {
        it('should return correct date for 1 day ago', () => {
            const result = xDaysAgo(1);
            const expected = new Date('2024-01-14T12:00:00.000Z');
            expect(result).toEqual(expected);
        });

        it('should return correct date for 7 days ago', () => {
            const result = xDaysAgo(7);
            const expected = new Date('2024-01-08T12:00:00.000Z');
            expect(result).toEqual(expected);
        });

        it('should return correct date for 0 days ago', () => {
            const result = xDaysAgo(0);
            expect(result).toEqual(mockNow);
        });

        it('should handle negative values', () => {
            const result = xDaysAgo(-3);
            const expected = new Date('2024-01-18T12:00:00.000Z');
            expect(result).toEqual(expected);
        });

        it('should handle large values', () => {
            const result = xDaysAgo(365); // 1 year in days
            const expected = new Date('2023-01-15T12:00:00.000Z');
            expect(result).toEqual(expected);
        });
    });

    describe('xMonthsAgo', () => {
        it('should return correct date for 1 month ago (30 days)', () => {
            const result = xMonthsAgo(1);
            const expected = new Date('2023-12-16T12:00:00.000Z'); // 30 days before Jan 15
            expect(result).toEqual(expected);
        });

        it('should return correct date for 6 months ago (180 days)', () => {
            const result = xMonthsAgo(6);
            const expected = new Date('2023-07-19T12:00:00.000Z'); // 180 days before Jan 15
            expect(result).toEqual(expected);
        });

        it('should return correct date for 0 months ago', () => {
            const result = xMonthsAgo(0);
            expect(result).toEqual(mockNow);
        });

        it('should handle negative values', () => {
            const result = xMonthsAgo(-2);
            const expected = new Date('2024-03-15T12:00:00.000Z');
            expect(result).toEqual(expected);
        });

        it('should handle large values', () => {
            const result = xMonthsAgo(12); // 1 year in months (360 days)
            const expected = new Date('2023-01-20T12:00:00.000Z'); // 360 days before Jan 15
            expect(result).toEqual(expected);
        });

        it('should handle edge case with different month lengths', () => {
            // Test with February (28/29 days) vs March (31 days)
            const result = xMonthsAgo(1);
            const expected = new Date('2023-12-16T12:00:00.000Z'); // 30 days before Jan 15
            expect(result).toEqual(expected);
        });
    });

    describe('xYearsAgo', () => {
        it('should return correct date for 1 year ago', () => {
            const result = xYearsAgo(1);
            const expected = new Date('2023-01-15T12:00:00.000Z');
            expect(result).toEqual(expected);
        });

        it('should return correct date for 5 years ago (1825 days)', () => {
            const result = xYearsAgo(5);
            const expected = new Date('2019-01-16T12:00:00.000Z'); // 1825 days before Jan 15
            expect(result).toEqual(expected);
        });

        it('should return correct date for 0 years ago', () => {
            const result = xYearsAgo(0);
            expect(result).toEqual(mockNow);
        });

        it('should handle negative values', () => {
            const result = xYearsAgo(-1);
            const expected = new Date('2025-01-14T12:00:00.000Z'); // 365 days after Jan 15
            expect(result).toEqual(expected);
        });

        it('should handle large values', () => {
            const result = xYearsAgo(10);
            const expected = new Date('2014-01-17T12:00:00.000Z'); // 3650 days before Jan 15
            expect(result).toEqual(expected);
        });
    });

    describe('Edge cases and precision', () => {
        it('should handle fractional values correctly', () => {
            const result = xMinutesAgo(1.5);
            const expected = new Date('2024-01-15T11:58:30.000Z');
            expect(result).toEqual(expected);
        });

        it('should handle very small values', () => {
            const result = xSecondsAgo(0.1);
            const expected = new Date('2024-01-15T11:59:59.900Z');
            expect(result).toEqual(expected);
        });

        it('should maintain precision with floating point arithmetic', () => {
            const result = xHoursAgo(1.5);
            const expected = new Date('2024-01-15T10:30:00.000Z');
            expect(result).toEqual(expected);
        });
    });

    describe('Real-world scenarios', () => {
        it('should work correctly for common time intervals', () => {
            // 1 hour ago
            expect(xHoursAgo(1)).toEqual(new Date('2024-01-15T11:00:00.000Z'));
            
            // 24 hours ago (1 day)
            expect(xHoursAgo(24)).toEqual(new Date('2024-01-14T12:00:00.000Z'));
            
            // 7 days ago
            expect(xDaysAgo(7)).toEqual(new Date('2024-01-08T12:00:00.000Z'));
            
            // 30 days ago (approximately 1 month)
            expect(xDaysAgo(30)).toEqual(new Date('2023-12-16T12:00:00.000Z'));
        });

        it('should handle leap year considerations', () => {
            // Test with a leap year date
            jest.setSystemTime(new Date('2024-02-29T12:00:00.000Z'));
            
            const result = xYearsAgo(1);
            const expected = new Date('2023-03-01T12:00:00.000Z'); // 365 days before Feb 29
            expect(result).toEqual(expected);
        });

        it('should work with different time zones when using UTC', () => {
            // All functions should work consistently with UTC dates
            const utcNow = new Date('2024-01-15T12:00:00.000Z');
            jest.setSystemTime(utcNow);
            
            expect(xMinutesAgo(60)).toEqual(new Date('2024-01-15T11:00:00.000Z'));
            expect(xHoursAgo(1)).toEqual(new Date('2024-01-15T11:00:00.000Z'));
        });
    });

    describe('Performance and consistency', () => {
        it('should return consistent results for same input', () => {
            const result1 = xMinutesAgo(30);
            const result2 = xMinutesAgo(30);
            expect(result1).toEqual(result2);
        });

        it('should handle multiple calls without side effects', () => {
            const results = [
                xMinutesAgo(1),
                xHoursAgo(1),
                xDaysAgo(1),
                xMinutesAgo(1) // Call again
            ];
            
            expect(results[0]).toEqual(results[3]);
            expect(results[0]).not.toEqual(results[1]);
            expect(results[1]).not.toEqual(results[2]);
        });
    });

    // Future date functions tests
    describe('xMinutesFromNow', () => {
        it('should return correct date for 1 minute from now', () => {
            const result = xMinutesFromNow(1);
            const expected = new Date('2024-01-15T12:01:00.000Z');
            expect(result).toEqual(expected);
        });

        it('should return correct date for 30 minutes from now', () => {
            const result = xMinutesFromNow(30);
            const expected = new Date('2024-01-15T12:30:00.000Z');
            expect(result).toEqual(expected);
        });

        it('should return correct date for 0 minutes from now', () => {
            const result = xMinutesFromNow(0);
            expect(result).toEqual(mockNow);
        });

        it('should handle negative values', () => {
            const result = xMinutesFromNow(-5);
            const expected = new Date('2024-01-15T11:55:00.000Z');
            expect(result).toEqual(expected);
        });

        it('should handle large values', () => {
            const result = xMinutesFromNow(1440); // 24 hours in minutes
            const expected = new Date('2024-01-16T12:00:00.000Z');
            expect(result).toEqual(expected);
        });
    });

    describe('xSecondsFromNow', () => {
        it('should return correct date for 1 second from now', () => {
            const result = xSecondsFromNow(1);
            const expected = new Date('2024-01-15T12:00:01.000Z');
            expect(result).toEqual(expected);
        });

        it('should return correct date for 30 seconds from now', () => {
            const result = xSecondsFromNow(30);
            const expected = new Date('2024-01-15T12:00:30.000Z');
            expect(result).toEqual(expected);
        });

        it('should return correct date for 0 seconds from now', () => {
            const result = xSecondsFromNow(0);
            expect(result).toEqual(mockNow);
        });

        it('should handle negative values', () => {
            const result = xSecondsFromNow(-10);
            const expected = new Date('2024-01-15T11:59:50.000Z');
            expect(result).toEqual(expected);
        });

        it('should handle large values', () => {
            const result = xSecondsFromNow(3600); // 1 hour in seconds
            const expected = new Date('2024-01-15T13:00:00.000Z');
            expect(result).toEqual(expected);
        });
    });

    describe('xHoursFromNow', () => {
        it('should return correct date for 1 hour from now', () => {
            const result = xHoursFromNow(1);
            const expected = new Date('2024-01-15T13:00:00.000Z');
            expect(result).toEqual(expected);
        });

        it('should return correct date for 12 hours from now', () => {
            const result = xHoursFromNow(12);
            const expected = new Date('2024-01-16T00:00:00.000Z');
            expect(result).toEqual(expected);
        });

        it('should return correct date for 0 hours from now', () => {
            const result = xHoursFromNow(0);
            expect(result).toEqual(mockNow);
        });

        it('should handle negative values', () => {
            const result = xHoursFromNow(-2);
            const expected = new Date('2024-01-15T10:00:00.000Z');
            expect(result).toEqual(expected);
        });

        it('should handle large values', () => {
            const result = xHoursFromNow(48); // 2 days in hours
            const expected = new Date('2024-01-17T12:00:00.000Z');
            expect(result).toEqual(expected);
        });
    });

    describe('xDaysFromNow', () => {
        it('should return correct date for 1 day from now', () => {
            const result = xDaysFromNow(1);
            const expected = new Date('2024-01-16T12:00:00.000Z');
            expect(result).toEqual(expected);
        });

        it('should return correct date for 7 days from now', () => {
            const result = xDaysFromNow(7);
            const expected = new Date('2024-01-22T12:00:00.000Z');
            expect(result).toEqual(expected);
        });

        it('should return correct date for 0 days from now', () => {
            const result = xDaysFromNow(0);
            expect(result).toEqual(mockNow);
        });

        it('should handle negative values', () => {
            const result = xDaysFromNow(-3);
            const expected = new Date('2024-01-12T12:00:00.000Z');
            expect(result).toEqual(expected);
        });

        it('should handle large values', () => {
            const result = xDaysFromNow(365); // 1 year in days
            const expected = new Date('2025-01-14T12:00:00.000Z'); // 365 days after Jan 15
            expect(result).toEqual(expected);
        });
    });

    describe('xMonthsFromNow', () => {
        it('should return correct date for 1 month from now (30 days)', () => {
            const result = xMonthsFromNow(1);
            const expected = new Date('2024-02-14T12:00:00.000Z'); // 30 days after Jan 15
            expect(result).toEqual(expected);
        });

        it('should return correct date for 6 months from now (180 days)', () => {
            const result = xMonthsFromNow(6);
            const expected = new Date('2024-07-13T12:00:00.000Z'); // 180 days after Jan 15
            expect(result).toEqual(expected);
        });

        it('should return correct date for 0 months from now', () => {
            const result = xMonthsFromNow(0);
            expect(result).toEqual(mockNow);
        });

        it('should handle negative values', () => {
            const result = xMonthsFromNow(-2);
            const expected = new Date('2023-11-16T12:00:00.000Z'); // 60 days before Jan 15
            expect(result).toEqual(expected);
        });

        it('should handle large values', () => {
            const result = xMonthsFromNow(12); // 1 year in months (360 days)
            const expected = new Date('2025-01-09T12:00:00.000Z'); // 360 days after Jan 15
            expect(result).toEqual(expected);
        });

        it('should handle edge case with different month lengths', () => {
            const result = xMonthsFromNow(1);
            const expected = new Date('2024-02-14T12:00:00.000Z'); // 30 days after Jan 15
            expect(result).toEqual(expected);
        });
    });

    describe('xYearsFromNow', () => {
        it('should return correct date for 1 year from now', () => {
            const result = xYearsFromNow(1);
            const expected = new Date('2025-01-14T12:00:00.000Z'); // 365 days after Jan 15
            expect(result).toEqual(expected);
        });

        it('should return correct date for 5 years from now (1825 days)', () => {
            const result = xYearsFromNow(5);
            const expected = new Date('2029-01-13T12:00:00.000Z'); // 1825 days after Jan 15
            expect(result).toEqual(expected);
        });

        it('should return correct date for 0 years from now', () => {
            const result = xYearsFromNow(0);
            expect(result).toEqual(mockNow);
        });

        it('should handle negative values', () => {
            const result = xYearsFromNow(-1);
            const expected = new Date('2023-01-15T12:00:00.000Z'); // 365 days before Jan 15
            expect(result).toEqual(expected);
        });

        it('should handle large values', () => {
            const result = xYearsFromNow(10);
            const expected = new Date('2034-01-12T12:00:00.000Z'); // 3650 days after Jan 15
            expect(result).toEqual(expected);
        });
    });

    describe('Future date edge cases and precision', () => {
        it('should handle fractional values correctly', () => {
            const result = xMinutesFromNow(1.5);
            const expected = new Date('2024-01-15T12:01:30.000Z');
            expect(result).toEqual(expected);
        });

        it('should handle very small values', () => {
            const result = xSecondsFromNow(0.1);
            const expected = new Date('2024-01-15T12:00:00.100Z');
            expect(result).toEqual(expected);
        });

        it('should maintain precision with floating point arithmetic', () => {
            const result = xHoursFromNow(1.5);
            const expected = new Date('2024-01-15T13:30:00.000Z');
            expect(result).toEqual(expected);
        });
    });

    describe('Future date real-world scenarios', () => {
        it('should work correctly for common future time intervals', () => {
            // 1 hour from now
            expect(xHoursFromNow(1)).toEqual(new Date('2024-01-15T13:00:00.000Z'));
            
            // 24 hours from now (1 day)
            expect(xHoursFromNow(24)).toEqual(new Date('2024-01-16T12:00:00.000Z'));
            
            // 7 days from now
            expect(xDaysFromNow(7)).toEqual(new Date('2024-01-22T12:00:00.000Z'));
            
            // 30 days from now (approximately 1 month)
            expect(xDaysFromNow(30)).toEqual(new Date('2024-02-14T12:00:00.000Z'));
        });

        it('should handle leap year considerations for future dates', () => {
            // Test with a leap year date
            jest.setSystemTime(new Date('2024-02-29T12:00:00.000Z'));
            
            const result = xYearsFromNow(1);
            const expected = new Date('2025-02-28T12:00:00.000Z'); // 365 days after Feb 29
            expect(result).toEqual(expected);
        });

        it('should work with different time zones when using UTC', () => {
            // All functions should work consistently with UTC dates
            const utcNow = new Date('2024-01-15T12:00:00.000Z');
            jest.setSystemTime(utcNow);
            
            expect(xMinutesFromNow(60)).toEqual(new Date('2024-01-15T13:00:00.000Z'));
            expect(xHoursFromNow(1)).toEqual(new Date('2024-01-15T13:00:00.000Z'));
        });
    });

    describe('Future date performance and consistency', () => {
        it('should return consistent results for same input', () => {
            const result1 = xMinutesFromNow(30);
            const result2 = xMinutesFromNow(30);
            expect(result1).toEqual(result2);
        });

        it('should handle multiple calls without side effects', () => {
            const results = [
                xMinutesFromNow(1),
                xHoursFromNow(1),
                xDaysFromNow(1),
                xMinutesFromNow(1) // Call again
            ];
            
            expect(results[0]).toEqual(results[3]);
            expect(results[0]).not.toEqual(results[1]);
            expect(results[1]).not.toEqual(results[2]);
        });
    });

    describe('Past vs Future date symmetry', () => {
        it('should have symmetric behavior for opposite values', () => {
            const pastResult = xMinutesAgo(30);
            const futureResult = xMinutesFromNow(-30);
            expect(pastResult).toEqual(futureResult);
        });

        it('should have symmetric behavior for opposite values with different functions', () => {
            const pastResult = xHoursAgo(2);
            const futureResult = xHoursFromNow(-2);
            expect(pastResult).toEqual(futureResult);
        });

        it('should maintain symmetry with zero values', () => {
            const pastResult = xDaysAgo(0);
            const futureResult = xDaysFromNow(0);
            expect(pastResult).toEqual(futureResult);
            expect(pastResult).toEqual(mockNow);
        });
    });
});
