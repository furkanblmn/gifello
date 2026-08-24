import { UserRole } from '@prisma/client';

export type AuthUser = {
  userId: number;
  email: string;
  role: UserRole;
  sessionId: number;
};
