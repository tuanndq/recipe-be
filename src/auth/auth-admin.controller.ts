import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CurrentUser, CurrentUserPayload } from '../common/decorators/current-user.decorator';
import { AdminProfileDto } from './dto/admin-profile.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { AuthService } from './auth.service';

@ApiTags('admin/auth')
@Controller('admin/auth')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AuthAdminController {
  constructor(private readonly authService: AuthService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get current admin profile' })
  @ApiResponse({ status: 200, type: AdminProfileDto })
  me(@CurrentUser() user: CurrentUserPayload): Promise<AdminProfileDto> {
    return this.authService.getProfile(user.userId);
  }
}
