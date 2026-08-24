import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { VerificationTokenType } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import type { Request } from 'express';
import { PrismaService } from '../../database/prisma/prisma.service';
import { jwtConfig } from '../../config/jwt.config';
import { appConfig } from '../../config/app.config';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { RequestPasswordResetDto } from './dto/request-password-reset.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { RevokeSessionDto } from './dto/revoke-session.dto';
import { AuthUser } from './types/auth-user.type';
import { addDuration, durationToSeconds } from './utils/duration.util';
import { generateOpaqueToken, hashToken } from './utils/token.util';
import { JwtPayload } from './interfaces/jwt-payload.interface';

type RequestMetadata = {
  ipAddress: string | null;
  userAgent: string | null;
  deviceId?: string;
  deviceName?: string;
  platform?: string;
};

type BcryptModule = {
  hash(value: string, rounds: number): Promise<string>;
  compare(value: string, encrypted: string): Promise<boolean>;
};

const bcryptLib = bcrypt as unknown as BcryptModule;

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  getHealth() {
    return { module: 'auth', status: 'ok' };
  }

  async register(dto: RegisterDto, request: Request) {
    const email = dto.email.trim().toLowerCase();
    const username = dto.username.trim().toLowerCase();

    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [{ email }, { username }],
      },
    });

    if (existingUser) {
      throw new ConflictException('Email or username already exists.');
    }

    const passwordHash = await bcryptLib.hash(
      dto.password,
      jwtConfig.bcryptRounds,
    );

    const user = await this.prisma.user.create({
      data: {
        email,
        username,
        passwordHash,
        displayName: dto.displayName?.trim() || username,
      },
    });

    const authResponse = await this.issueSession(
      user.id,
      user.email,
      user.role,
      dto,
      request,
    );
    const verificationToken = await this.createVerificationToken(
      user.id,
      VerificationTokenType.EMAIL_VERIFICATION,
    );

    return {
      user: this.toUserResponse(user),
      ...authResponse,
      emailVerificationRequired: true,
      ...(appConfig.isProduction ? {} : { verificationToken }),
    };
  }

  async login(dto: LoginDto, request: Request) {
    const email = dto.email.trim().toLowerCase();
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user?.passwordHash) {
      throw new UnauthorizedException('Invalid credentials.');
    }

    if (!this.isUserActive(user)) {
      throw new UnauthorizedException('User is not active.');
    }

    const passwordMatches = await bcryptLib.compare(
      dto.password,
      user.passwordHash,
    );
    if (!passwordMatches) {
      throw new UnauthorizedException('Invalid credentials.');
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        lastLoginAt: new Date(),
      },
    });

    return {
      user: this.toUserResponse(user),
      ...(await this.issueSession(
        user.id,
        user.email,
        user.role,
        dto,
        request,
      )),
      emailVerificationRequired: !user.emailVerifiedAt,
    };
  }

  async refreshTokens(dto: RefreshTokenDto, request: Request) {
    const now = new Date();
    const incomingHash = hashToken(dto.refreshToken);
    const metadata = this.extractRequestMetadata(request);

    const storedToken = await this.prisma.refreshToken.findUnique({
      where: {
        tokenHash: incomingHash,
      },
      include: {
        session: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!storedToken) {
      throw new UnauthorizedException('Invalid refresh token.');
    }

    if (
      storedToken.revokedAt ||
      storedToken.expiresAt <= now ||
      storedToken.session.revokedAt ||
      storedToken.session.expiresAt <= now
    ) {
      await this.invalidateSession(storedToken.sessionId);
      throw new UnauthorizedException('Refresh token is no longer valid.');
    }

    if (!this.isUserActive(storedToken.session.user)) {
      throw new UnauthorizedException('User is not active.');
    }

    const refreshToken = generateOpaqueToken();
    const refreshTokenHash = hashToken(refreshToken);
    const refreshExpiresAt = addDuration(now, jwtConfig.refreshTokenTtl);
    const nextToken = await this.prisma.$transaction(async (tx) => {
      const createdToken = await tx.refreshToken.create({
        data: {
          sessionId: storedToken.sessionId,
          tokenHash: refreshTokenHash,
          expiresAt: refreshExpiresAt,
        },
      });

      await tx.refreshToken.update({
        where: {
          id: storedToken.id,
        },
        data: {
          revokedAt: now,
          replacedByTokenId: createdToken.id,
        },
      });

      return createdToken;
    });

    const accessToken = await this.signAccessToken({
      sub: storedToken.session.user.id,
      email: storedToken.session.user.email,
      role: storedToken.session.user.role,
      sessionId: storedToken.session.id,
      type: 'access',
    });

    await this.prisma.session.update({
      where: { id: storedToken.session.id },
      data: {
        lastUsedAt: now,
        ipAddress: metadata.ipAddress,
        userAgent: metadata.userAgent,
      },
    });

    return {
      accessToken,
      refreshToken,
      refreshTokenId: nextToken.id,
      session: this.toSessionResponse(storedToken.session),
    };
  }

  async getMe(user: AuthUser) {
    const existingUser = await this.prisma.user.findUnique({
      where: { id: user.userId },
    });

    if (!existingUser) {
      throw new NotFoundException('User not found.');
    }

    return this.toUserResponse(existingUser);
  }

  async logout(user: AuthUser, dto: RevokeSessionDto | undefined) {
    await this.revokeSession(user.userId, user.sessionId);

    if (dto?.refreshToken) {
      const tokenHash = hashToken(dto.refreshToken);
      const token = await this.prisma.refreshToken.findUnique({
        where: { tokenHash },
        include: { session: true },
      });

      if (token?.session.userId === user.userId) {
        await this.prisma.refreshToken.update({
          where: { id: token.id },
          data: {
            revokedAt: new Date(),
          },
        });
      }
    }
    return { success: true };
  }

  async logoutAll(user: AuthUser) {
    await this.prisma.session.updateMany({
      where: {
        userId: user.userId,
        revokedAt: null,
      },
      data: {
        revokedAt: new Date(),
      },
    });

    const sessions = await this.prisma.session.findMany({
      where: { userId: user.userId },
      select: { id: true },
    });

    await this.prisma.refreshToken.updateMany({
      where: {
        sessionId: {
          in: sessions.map((session) => session.id),
        },
        revokedAt: null,
      },
      data: {
        revokedAt: new Date(),
      },
    });

    return { success: true };
  }

  async listSessions(user: AuthUser) {
    const sessions = await this.prisma.session.findMany({
      where: {
        userId: user.userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return sessions.map((session) => ({
      ...this.toSessionResponse(session),
      current: session.id === user.sessionId,
    }));
  }

  async revokeUserSession(user: AuthUser, sessionId: number) {
    await this.revokeSession(user.userId, sessionId);
    return { success: true };
  }

  async createEmailVerificationToken(user: AuthUser) {
    const existingUser = await this.prisma.user.findUnique({
      where: { id: user.userId },
    });

    if (!existingUser) {
      throw new NotFoundException('User not found.');
    }

    if (existingUser.emailVerifiedAt) {
      throw new BadRequestException('Email is already verified.');
    }

    const token = await this.createVerificationToken(
      user.userId,
      VerificationTokenType.EMAIL_VERIFICATION,
    );

    return {
      success: true,
      ...(appConfig.isProduction ? {} : { verificationToken: token }),
    };
  }

  async verifyEmail(dto: VerifyEmailDto) {
    const tokenHash = hashToken(dto.token);
    const record = await this.prisma.verificationToken.findUnique({
      where: {
        tokenHash,
      },
      include: {
        user: true,
      },
    });

    if (
      !record ||
      record.type !== VerificationTokenType.EMAIL_VERIFICATION ||
      record.usedAt ||
      record.expiresAt <= new Date()
    ) {
      throw new UnauthorizedException('Verification token is invalid.');
    }

    await this.prisma.$transaction([
      this.prisma.verificationToken.update({
        where: { id: record.id },
        data: { usedAt: new Date() },
      }),
      this.prisma.user.update({
        where: { id: record.userId },
        data: {
          emailVerifiedAt: new Date(),
        },
      }),
    ]);

    return { success: true };
  }

  async requestPasswordReset(dto: RequestPasswordResetDto) {
    const user = await this.prisma.user.findUnique({
      where: {
        email: dto.email.trim().toLowerCase(),
      },
    });

    if (!user) {
      return {
        success: true,
      };
    }

    const token = await this.createVerificationToken(
      user.id,
      VerificationTokenType.PASSWORD_RESET,
    );

    return {
      success: true,
      ...(appConfig.isProduction ? {} : { resetToken: token }),
    };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const tokenHash = hashToken(dto.token);
    const record = await this.prisma.verificationToken.findUnique({
      where: {
        tokenHash,
      },
      include: {
        user: true,
      },
    });

    if (
      !record ||
      record.type !== VerificationTokenType.PASSWORD_RESET ||
      record.usedAt ||
      record.expiresAt <= new Date()
    ) {
      throw new UnauthorizedException('Reset token is invalid.');
    }

    const passwordHash = await bcryptLib.hash(
      dto.newPassword,
      jwtConfig.bcryptRounds,
    );
    const now = new Date();

    await this.prisma.$transaction([
      this.prisma.verificationToken.update({
        where: { id: record.id },
        data: { usedAt: now },
      }),
      this.prisma.user.update({
        where: { id: record.userId },
        data: { passwordHash },
      }),
      this.prisma.session.updateMany({
        where: {
          userId: record.userId,
          revokedAt: null,
        },
        data: {
          revokedAt: now,
        },
      }),
      this.prisma.refreshToken.updateMany({
        where: {
          session: {
            userId: record.userId,
          },
          revokedAt: null,
        },
        data: {
          revokedAt: now,
        },
      }),
    ]);

    return { success: true };
  }

  private async issueSession(
    userId: number,
    email: string,
    role: AuthUser['role'],
    dto: {
      deviceId?: string;
      deviceName?: string;
      platform?: string;
    },
    request: Request,
  ) {
    const now = new Date();
    const sessionExpiresAt = addDuration(now, jwtConfig.refreshTokenTtl);
    const metadata = this.extractRequestMetadata(request);

    const session = await this.prisma.session.create({
      data: {
        userId,
        deviceId: dto.deviceId || null,
        deviceName: dto.deviceName || null,
        platform: dto.platform || null,
        ipAddress: metadata.ipAddress,
        userAgent: metadata.userAgent,
        lastUsedAt: now,
        expiresAt: sessionExpiresAt,
      },
    });

    const refreshToken = generateOpaqueToken();
    const refreshTokenHash = hashToken(refreshToken);

    const storedRefreshToken = await this.prisma.refreshToken.create({
      data: {
        sessionId: session.id,
        tokenHash: refreshTokenHash,
        expiresAt: sessionExpiresAt,
      },
    });

    const accessToken = await this.signAccessToken({
      sub: userId,
      email,
      role,
      sessionId: session.id,
      type: 'access',
    });

    return {
      accessToken,
      refreshToken,
      refreshTokenId: storedRefreshToken.id,
      session: this.toSessionResponse(session),
    };
  }

  private async signAccessToken(payload: JwtPayload) {
    return this.jwtService.signAsync(payload, {
      secret: jwtConfig.accessTokenSecret,
      expiresIn: durationToSeconds(jwtConfig.accessTokenTtl),
    });
  }

  private async createVerificationToken(
    userId: number,
    type: VerificationTokenType,
  ) {
    await this.prisma.verificationToken.updateMany({
      where: {
        userId,
        type,
        usedAt: null,
      },
      data: {
        usedAt: new Date(),
      },
    });

    const token = generateOpaqueToken();
    const tokenHash = hashToken(token);
    const ttl =
      type === VerificationTokenType.EMAIL_VERIFICATION
        ? jwtConfig.emailVerificationTtl
        : jwtConfig.passwordResetTtl;

    await this.prisma.verificationToken.create({
      data: {
        userId,
        type,
        tokenHash,
        expiresAt: addDuration(new Date(), ttl),
      },
    });

    return token;
  }

  private async revokeSession(userId: number, sessionId: number) {
    const session = await this.prisma.session.findFirst({
      where: {
        id: sessionId,
        userId,
      },
    });

    if (!session) {
      throw new NotFoundException('Session not found.');
    }

    await this.invalidateSession(session.id);
  }

  private async invalidateSession(sessionId: number) {
    const revokedAt = new Date();

    await this.prisma.$transaction([
      this.prisma.session.update({
        where: { id: sessionId },
        data: { revokedAt },
      }),
      this.prisma.refreshToken.updateMany({
        where: {
          sessionId,
          revokedAt: null,
        },
        data: { revokedAt },
      }),
    ]);
  }

  private extractRequestMetadata(request: Request): RequestMetadata {
    const forwardedFor = request.headers['x-forwarded-for'];
    const ipAddress = Array.isArray(forwardedFor)
      ? forwardedFor[0]
      : forwardedFor?.split(',')[0]?.trim() || request.ip || null;

    return {
      ipAddress,
      userAgent: request.get('user-agent') || null,
      deviceId: request.get('x-device-id') || undefined,
      deviceName: request.get('x-device-name') || undefined,
      platform: request.get('x-platform') || undefined,
    };
  }

  private toUserResponse(user: {
    id: number;
    email: string;
    username: string;
    displayName: string | null;
    role: AuthUser['role'];
    emailVerifiedAt: Date | null;
    createdAt: Date;
  }) {
    return {
      id: user.id,
      email: user.email,
      username: user.username,
      displayName: user.displayName,
      role: user.role,
      isEmailVerified: Boolean(user.emailVerifiedAt),
      createdAt: user.createdAt,
    };
  }

  private toSessionResponse(session: {
    id: number;
    deviceId: string | null;
    deviceName: string | null;
    platform: string | null;
    ipAddress: string | null;
    userAgent: string | null;
    lastUsedAt: Date | null;
    expiresAt: Date;
    revokedAt: Date | null;
    createdAt: Date;
  }) {
    return {
      id: session.id,
      deviceId: session.deviceId,
      deviceName: session.deviceName,
      platform: session.platform,
      ipAddress: session.ipAddress,
      userAgent: session.userAgent,
      status: session.revokedAt
        ? 'REVOKED'
        : session.expiresAt <= new Date()
          ? 'EXPIRED'
          : 'ACTIVE',
      lastUsedAt: session.lastUsedAt,
      expiresAt: session.expiresAt,
      revokedAt: session.revokedAt,
      createdAt: session.createdAt,
    };
  }

  private isUserActive(user: { status: string; deletedAt: Date | null }) {
    return user.status === 'ACTIVE' && !user.deletedAt;
  }
}
