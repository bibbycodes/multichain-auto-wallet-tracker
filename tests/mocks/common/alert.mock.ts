import { Alert, AlertType, SocialPlatform } from '@prisma/client';

/**
 * Creates a mock Alert with default values
 * All fields can be overridden via the partial parameter
 */
export function createMockAlert(partial: Partial<Alert> = {}): Alert {
    const defaultAlert: Alert = {
        id: '1',
        token_id: 'token-1',
        token_address: '0xe8852d270294cc9a84fe73d5a434ae85a1c34444',
        social_platform: SocialPlatform.TELEGRAM,
        price: 100,
        market_cap: 1000000,
        type: AlertType.SIGNAL,
        created_at: new Date('2024-01-15T12:00:00.000Z'),
        updated_at: new Date('2024-01-15T12:00:00.000Z'),
        ...partial,
    };

    return defaultAlert;
}

/**
 * Creates a mock SIGNAL alert
 */
export function createMockSignalAlert(partial: Partial<Alert> = {}): Alert {
    return createMockAlert({
        type: AlertType.SIGNAL,
        ...partial,
    });
}

/**
 * Creates a mock PRICE_UPDATE alert
 */
export function createMockPriceUpdateAlert(partial: Partial<Alert> = {}): Alert {
    return createMockAlert({
        type: AlertType.PRICE_UPDATE,
        ...partial,
    });
}

/**
 * Creates multiple mock alerts with sequential IDs
 */
export function createMockAlerts(count: number, type: AlertType = AlertType.SIGNAL): Alert[] {
    return Array.from({ length: count }, (_, i) =>
        createMockAlert({
            id: `alert-${i + 1}`,
            type,
            created_at: new Date(`2024-01-15T${12 + i}:00:00.000Z`),
        })
    );
}
