import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import type { Request } from 'express';
import { AuthService } from '../auth.service';
import { Public } from '../decorators/public.decorator';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { CurrentUser } from '../decorators/current-user.decorator';
import type { AuthUser } from '../types/auth-user.type';
import { RegisterDto } from '../dto/register.dto';
import { LoginDto } from '../dto/login.dto';
import { RefreshTokenDto } from '../dto/refresh-token.dto';
import { RequestPasswordResetDto } from '../dto/request-password-reset.dto';
import { ResetPasswordDto } from '../dto/reset-password.dto';
import { VerifyEmailDto } from '../dto/verify-email.dto';
import { RevokeSessionDto } from '../dto/revoke-session.dto';

@ApiTags('Auth')
@Controller({
  path: 'auth',
  version: '1',
})
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Get('health')
  @ApiOperation({ summary: 'Auth module health check' })
  getHealth() {
    return this.authService.getHealth();
  }

  @Public()
  @Post('register')
  @ApiOperation({ summary: 'Register a new user and create a session' })
  @ApiBody({ type: RegisterDto })
  register(@Body() dto: RegisterDto, @Req() request: Request) {
    return this.authService.register(dto, request);
  }

  @Public()
  @Post('login')
  @ApiOperation({ summary: 'Login with email and password' })
  @ApiBody({ type: LoginDto })
  @ApiUnauthorizedResponse({ description: 'Invalid credentials.' })
  login(@Body() dto: LoginDto, @Req() request: Request) {
    return this.authService.login(dto, request);
  }

  @Public()
  @Post('refresh')
  @ApiOperation({ summary: 'Rotate refresh token and get a new access token' })
  @ApiBody({ type: RefreshTokenDto })
  @ApiUnauthorizedResponse({ description: 'Invalid refresh token.' })
  refresh(@Body() dto: RefreshTokenDto, @Req() request: Request) {
    return this.authService.refreshTokens(dto, request);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'Get the currently authenticated user' })
  getMe(@CurrentUser() user: AuthUser) {
    return this.authService.getMe(user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('sessions')
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'List sessions for the current user' })
  getSessions(@CurrentUser() user: AuthUser) {
    return this.authService.listSessions(user);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('sessions/:sessionId')
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'Revoke a specific session' })
  @ApiParam({ name: 'sessionId', type: Number, example: 12 })
  revokeSession(
    @CurrentUser() user: AuthUser,
    @Param('sessionId', ParseIntPipe) sessionId: number,
  ) {
    return this.authService.revokeUserSession(user, sessionId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'Logout the current session' })
  @ApiBody({ type: RevokeSessionDto, required: false })
  logout(@CurrentUser() user: AuthUser, @Body() dto?: RevokeSessionDto) {
    return this.authService.logout(user, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout-all')
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'Logout every active session for the current user' })
  logoutAll(@CurrentUser() user: AuthUser) {
    return this.authService.logoutAll(user);
  }

  @UseGuards(JwtAuthGuard)
  @Post('verify-email/request')
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'Create a new email verification token' })
  requestEmailVerification(@CurrentUser() user: AuthUser) {
    return this.authService.createEmailVerificationToken(user);
  }

  @Public()
  @Post('verify-email/confirm')
  @ApiOperation({ summary: 'Verify email with token' })
  @ApiBody({ type: VerifyEmailDto })
  verifyEmail(@Body() dto: VerifyEmailDto) {
    return this.authService.verifyEmail(dto);
  }

  @Public()
  @Post('password-reset/request')
  @ApiOperation({ summary: 'Request password reset token' })
  @ApiBody({ type: RequestPasswordResetDto })
  requestPasswordReset(@Body() dto: RequestPasswordResetDto) {
    return this.authService.requestPasswordReset(dto);
  }

  @Public()
  @Post('password-reset/confirm')
  @ApiOperation({ summary: 'Reset password with token' })
  @ApiBody({ type: ResetPasswordDto })
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto);
  }
}
