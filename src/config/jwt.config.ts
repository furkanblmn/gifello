export const jwtConfig = {
  accessTokenSecret: process.env.JWT_ACCESS_SECRET ?? 'dev-access-secret',
  accessTokenTtl: process.env.JWT_ACCESS_TTL ?? '15m',
  refreshTokenTtl: process.env.JWT_REFRESH_TTL ?? '7d',
  emailVerificationTtl: process.env.EMAIL_VERIFICATION_TTL ?? '1d',
  passwordResetTtl: process.env.PASSWORD_RESET_TTL ?? '30m',
  bcryptRounds: Number(process.env.BCRYPT_ROUNDS ?? 12),
};
