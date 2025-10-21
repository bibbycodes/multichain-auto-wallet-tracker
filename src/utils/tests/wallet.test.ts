import { isSolanaAddress, isEvmAddress } from '../wallet';

describe('wallet utils', () => {
  describe('isSolanaAddress', () => {
    it('should return false for any input (not implemented)', () => {
      expect(isSolanaAddress('SomeValidSolanaAddress')).toBe(false);
      expect(isSolanaAddress('0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb')).toBe(false);
      expect(isSolanaAddress('')).toBe(false);
    });

    it('should return false for typical Solana-like addresses', () => {
      // Solana addresses are typically base58 encoded, 32-44 chars
      expect(isSolanaAddress('DYw8jCTfwHNRJhhmFcbXvVDTqWMEVFBX6ZKUmG5CNSKK')).toBe(false);
    });

    it('should return false for EVM addresses', () => {
      expect(isSolanaAddress('0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb')).toBe(false);
    });
  });

  describe('isEvmAddress', () => {
    it('should return true for addresses starting with 0x', () => {
      expect(isEvmAddress('0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb')).toBe(true);
      expect(isEvmAddress('0xABC123')).toBe(true);
      expect(isEvmAddress('0x0000000000000000000000000000000000000000')).toBe(true);
    });

    it('should return false for addresses not starting with 0x', () => {
      expect(isEvmAddress('742d35Cc6634C0532925a3b844Bc9e7595f0bEb')).toBe(false);
      expect(isEvmAddress('ABC123')).toBe(false);
    });

    it('should return false for empty string', () => {
      expect(isEvmAddress('')).toBe(false);
    });

    it('should return false for non-address strings', () => {
      expect(isEvmAddress('hello')).toBe(false);
      expect(isEvmAddress('0xhello')).toBe(true); // Still starts with 0x, even if invalid
    });

    it('should return false for Solana-like addresses', () => {
      expect(isEvmAddress('DYw8jCTfwHNRJhhmFcbXvVDTqWMEVFBX6ZKUmG5CNSKK')).toBe(false);
    });

    it('should handle case sensitivity', () => {
      expect(isEvmAddress('0xABCDEF')).toBe(true);
      expect(isEvmAddress('0xabcdef')).toBe(true);
      expect(isEvmAddress('0XabcDEF')).toBe(false); // Capital X
    });

    it('should return true even for invalid EVM address formats (only checks prefix)', () => {
      // Note: This function only checks the prefix, not the validity
      expect(isEvmAddress('0x')).toBe(true);
      expect(isEvmAddress('0x123')).toBe(true); // Too short for valid EVM
      expect(isEvmAddress('0x' + 'a'.repeat(100))).toBe(true); // Too long for valid EVM
    });
  });

  describe('address type detection integration', () => {
    it('should distinguish between EVM and non-EVM addresses', () => {
      const evmAddress = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb';
      const solanaAddress = 'DYw8jCTfwHNRJhhmFcbXvVDTqWMEVFBX6ZKUmG5CNSKK';
      
      expect(isEvmAddress(evmAddress)).toBe(true);
      expect(isSolanaAddress(evmAddress)).toBe(false);
      
      expect(isEvmAddress(solanaAddress)).toBe(false);
      expect(isSolanaAddress(solanaAddress)).toBe(false); // Not implemented
    });

    it('should handle mixed case EVM addresses', () => {
      const checksumAddress = '0x5aAeb6053F3E94C9b9A09f33669435E7Ef1BeAed';
      const lowercaseAddress = '0x5aaeb6053f3e94c9b9a09f33669435e7ef1beaed';
      
      expect(isEvmAddress(checksumAddress)).toBe(true);
      expect(isEvmAddress(lowercaseAddress)).toBe(true);
    });
  });
});

