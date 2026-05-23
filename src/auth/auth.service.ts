import { Injectable, OnModuleInit, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { LoginDto } from './dto/login.dto';
import { LoginResponseDto } from './dto/login-response.dto';
import { AdminUser } from './entities/admin-user.entity';

@Injectable()
export class AuthService implements OnModuleInit {
  constructor(
    @InjectRepository(AdminUser)
    private readonly adminRepo: Repository<AdminUser>,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {}

  async onModuleInit() {
    const username = this.config.get<string>('ADMIN_USERNAME', 'admin');
    const password = this.config.get<string>('ADMIN_PASSWORD', 'admin123');

    const existing = await this.adminRepo.findOne({ where: { username } });
    if (!existing) {
      const passwordHash = await bcrypt.hash(password, 10);
      await this.adminRepo.save(
        this.adminRepo.create({ username, passwordHash }),
      );
    }
  }

  async getProfile(userId: number): Promise<{ id: number; username: string }> {
    const user = await this.adminRepo.findOne({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedException('Admin user not found');
    }
    return { id: user.id, username: user.username };
  }

  async login(dto: LoginDto): Promise<LoginResponseDto> {
    const user = await this.adminRepo.findOne({
      where: { username: dto.username },
    });

    if (!user || !(await bcrypt.compare(dto.password, user.passwordHash))) {
      throw new UnauthorizedException('Invalid username or password');
    }

    const expiresIn = this.config.get<string>('JWT_EXPIRES_IN', '24h');
    const payload = { sub: user.id, username: user.username };
    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
      tokenType: 'Bearer',
      expiresIn: this.parseExpiresIn(expiresIn),
    };
  }

  private parseExpiresIn(expiresIn: string): number {
    const match = expiresIn.match(/^(\d+)([smhd])$/);
    if (!match) return 86400;
    const value = parseInt(match[1], 10);
    const unit = match[2];
    const multipliers: Record<string, number> = {
      s: 1,
      m: 60,
      h: 3600,
      d: 86400,
    };
    return value * (multipliers[unit] ?? 86400);
  }
}
