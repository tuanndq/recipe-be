export const THROTTLE_DEFAULT = 'default' as const;

export const LOGIN_THROTTLE = {
  limit: 10,
  ttl: 60_000,
} as const;

export const UPLOAD_THROTTLE = {
  limit: 20,
  ttl: 60_000,
} as const;
