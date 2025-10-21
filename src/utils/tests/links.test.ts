import { getTwitterUrlFromUsername, getTelegramUrlFromUsername } from '../links';

describe('links utils', () => {
  describe('getTwitterUrlFromUsername', () => {
    it('should generate correct Twitter URL for simple username', () => {
      const username = 'johndoe';
      const url = getTwitterUrlFromUsername(username);
      expect(url).toBe('https://x.com/johndoe');
    });

    it('should handle username with underscores', () => {
      const username = 'john_doe_123';
      const url = getTwitterUrlFromUsername(username);
      expect(url).toBe('https://x.com/john_doe_123');
    });

    it('should handle username with numbers', () => {
      const username = 'user12345';
      const url = getTwitterUrlFromUsername(username);
      expect(url).toBe('https://x.com/user12345');
    });

    it('should handle empty string', () => {
      const username = '';
      const url = getTwitterUrlFromUsername(username);
      expect(url).toBe('https://x.com/');
    });

    it('should not add @ symbol if not present in username', () => {
      const username = 'username';
      const url = getTwitterUrlFromUsername(username);
      expect(url).toBe('https://x.com/username');
      expect(url).not.toContain('@');
    });

    it('should preserve @ symbol if included in username', () => {
      const username = '@username';
      const url = getTwitterUrlFromUsername(username);
      expect(url).toBe('https://x.com/@username');
    });
  });

  describe('getTelegramUrlFromUsername', () => {
    it('should generate correct Telegram URL for simple username', () => {
      const username = 'johndoe';
      const url = getTelegramUrlFromUsername(username);
      expect(url).toBe('https://t.me/johndoe');
    });

    it('should handle username with underscores', () => {
      const username = 'john_doe_123';
      const url = getTelegramUrlFromUsername(username);
      expect(url).toBe('https://t.me/john_doe_123');
    });

    it('should handle username with numbers', () => {
      const username = 'user12345';
      const url = getTelegramUrlFromUsername(username);
      expect(url).toBe('https://t.me/user12345');
    });

    it('should handle empty string', () => {
      const username = '';
      const url = getTelegramUrlFromUsername(username);
      expect(url).toBe('https://t.me/');
    });

    it('should not add @ symbol if not present in username', () => {
      const username = 'username';
      const url = getTelegramUrlFromUsername(username);
      expect(url).toBe('https://t.me/username');
      expect(url).not.toContain('@');
    });

    it('should preserve @ symbol if included in username', () => {
      const username = '@username';
      const url = getTelegramUrlFromUsername(username);
      expect(url).toBe('https://t.me/@username');
    });
  });
});

