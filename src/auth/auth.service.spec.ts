import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { AdminUser } from './entities/admin-user.entity';

describe('AuthService', () => {
  let service: AuthService;
  let adminRepo: {
    findOne: jest.Mock;
    save: jest.Mock;
    create: jest.Mock;
  };
  let jwtService: jest.Mocked<Pick<JwtService, 'sign'>>;

  const adminUser = {
    id: 1,
    username: 'admin',
    passwordHash: '',
    createdAt: new Date(),
  } as AdminUser;

  beforeEach(async () => {
    adminUser.passwordHash = await bcrypt.hash('admin123', 10);

    adminRepo = {
      findOne: jest.fn(),
      save: jest.fn(),
      create: jest.fn(),
    };

    jwtService = {
      sign: jest.fn().mockReturnValue('signed-jwt-token'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(AdminUser),
          useValue: adminRepo,
        },
        { provide: JwtService, useValue: jwtService },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string, defaultValue?: string) => {
              const values: Record<string, string> = {
                ADMIN_USERNAME: 'admin',
                ADMIN_PASSWORD: 'admin123',
                JWT_EXPIRES_IN: '24h',
              };
              return values[key] ?? defaultValue;
            }),
          },
        },
      ],
    }).compile();

    service = module.get(AuthService);
  });

  describe('login', () => {
    it('returns access token for valid credentials', async () => {
      adminRepo.findOne.mockResolvedValue(adminUser);

      const result = await service.login({
        username: 'admin',
        password: 'admin123',
      });

      expect(result.accessToken).toBe('signed-jwt-token');
      expect(result.tokenType).toBe('Bearer');
      expect(result.expiresIn).toBe(86400);
      expect(jwtService.sign).toHaveBeenCalledWith({
        sub: 1,
        username: 'admin',
      });
    });

    it('throws UnauthorizedException for wrong password', async () => {
      adminRepo.findOne.mockResolvedValue(adminUser);

      await expect(
        service.login({ username: 'admin', password: 'wrong' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('throws UnauthorizedException for unknown user', async () => {
      adminRepo.findOne.mockResolvedValue(null);

      await expect(
        service.login({ username: 'nobody', password: 'admin123' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('getProfile', () => {
    it('returns admin profile', async () => {
      adminRepo.findOne.mockResolvedValue(adminUser);

      await expect(service.getProfile(1)).resolves.toEqual({
        id: 1,
        username: 'admin',
      });
    });

    it('throws when user not found', async () => {
      adminRepo.findOne.mockResolvedValue(null);

      await expect(service.getProfile(99)).rejects.toThrow(UnauthorizedException);
    });
  });
});
