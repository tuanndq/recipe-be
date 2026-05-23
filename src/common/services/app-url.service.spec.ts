import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { AppUrlService } from './app-url.service';

describe('AppUrlService', () => {
  let service: AppUrlService;

  const mockConfig = (appUrl = 'http://localhost:3000') => ({
    get: jest.fn((key: string, defaultValue?: string) => {
      if (key === 'APP_URL') return appUrl;
      return defaultValue;
    }),
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AppUrlService,
        { provide: ConfigService, useValue: mockConfig() },
      ],
    }).compile();

    service = module.get(AppUrlService);
  });

  describe('resolvePublicUrl', () => {
    it('returns null for empty input', () => {
      expect(service.resolvePublicUrl(null)).toBeNull();
      expect(service.resolvePublicUrl(undefined)).toBeNull();
    });

    it('returns absolute URLs unchanged', () => {
      expect(service.resolvePublicUrl('https://cdn.example.com/a.webp')).toBe(
        'https://cdn.example.com/a.webp',
      );
    });

    it('prefixes relative paths with APP_URL', () => {
      expect(service.resolvePublicUrl('/uploads/pho.webp')).toBe(
        'http://localhost:3000/uploads/pho.webp',
      );
    });

    it('adds leading slash when missing', () => {
      expect(service.resolvePublicUrl('uploads/pho.webp')).toBe(
        'http://localhost:3000/uploads/pho.webp',
      );
    });
  });

  describe('normalizeStoredUrl', () => {
    it('strips APP_URL prefix', () => {
      expect(
        service.normalizeStoredUrl('http://localhost:3000/uploads/pho.webp'),
      ).toBe('/uploads/pho.webp');
    });

    it('keeps external absolute URLs', () => {
      expect(service.normalizeStoredUrl('https://cdn.example.com/x.webp')).toBe(
        'https://cdn.example.com/x.webp',
      );
    });

    it('normalizes relative paths', () => {
      expect(service.normalizeStoredUrl('uploads/pho.webp')).toBe('/uploads/pho.webp');
    });
  });
});
