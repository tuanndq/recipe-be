import { configValidationSchema } from './config.validation';

describe('configValidationSchema', () => {
  const validEnv = {
    DB_HOST: 'localhost',
    DB_USERNAME: 'recipe',
    DB_PASSWORD: 'secret',
    DB_DATABASE: 'recipe_db',
    JWT_SECRET: 'test-secret',
    ADMIN_USERNAME: 'admin',
    ADMIN_PASSWORD: 'admin123',
  };

  it('accepts minimal required env', () => {
    const { error, value } = configValidationSchema.validate(validEnv);
    expect(error).toBeUndefined();
    expect(value.NODE_ENV).toBe('development');
    expect(value.THROTTLE_LIMIT).toBe(100);
  });

  it('accepts NODE_ENV=test', () => {
    const { error } = configValidationSchema.validate({
      ...validEnv,
      NODE_ENV: 'test',
    });
    expect(error).toBeUndefined();
  });

  it('rejects missing JWT_SECRET', () => {
    const { error } = configValidationSchema.validate({
      ...validEnv,
      JWT_SECRET: undefined,
    });
    expect(error).toBeDefined();
  });

  it('requires S3 fields when STORAGE_DRIVER=s3', () => {
    const { error } = configValidationSchema.validate({
      ...validEnv,
      STORAGE_DRIVER: 's3',
    });
    expect(error).toBeDefined();
  });
});
