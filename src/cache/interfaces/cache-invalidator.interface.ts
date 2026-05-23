export interface CacheInvalidator {
  deleteByPattern(pattern: string): Promise<void>;
}

export const CACHE_INVALIDATOR = Symbol('CACHE_INVALIDATOR');
