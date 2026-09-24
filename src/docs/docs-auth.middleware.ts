import type { INestApplication } from '@nestjs/common';
import { timingSafeEqual } from 'node:crypto';
import type { NextFunction, Request, Response } from 'express';
import { appConfig } from '../config/app.config';

const docsRealm = 'Gifello API Docs';

export function setupDocsAuth(app: INestApplication) {
  if (!appConfig.docsAuthEnabled) {
    return;
  }

  app.use(
    [
      '/docs',
      normalizePath(appConfig.swaggerPath),
      `${normalizePath(appConfig.swaggerPath)}-json`,
      `${normalizePath(appConfig.swaggerPath)}-yaml`,
      '/postman',
    ],
    docsAuthMiddleware,
  );
}

function docsAuthMiddleware(req: Request, res: Response, next: NextFunction) {
  if (isAuthorized(req)) {
    next();
    return;
  }

  res.setHeader('WWW-Authenticate', `Basic realm="${docsRealm}"`);
  res.status(401).send('Authentication required.');
}

function isAuthorized(req: Request): boolean {
  if (!appConfig.docsUsername || !appConfig.docsPassword) {
    return false;
  }

  const authorization = req.headers.authorization;

  if (!authorization?.startsWith('Basic ')) {
    return false;
  }

  const credentials = decodeCredentials(authorization);

  if (!credentials) {
    return false;
  }

  return (
    safeEqual(credentials.username, appConfig.docsUsername) &&
    safeEqual(credentials.password, appConfig.docsPassword)
  );
}

function decodeCredentials(
  authorization: string,
): { username: string; password: string } | null {
  const encoded = authorization.slice('Basic '.length).trim();
  const decoded = Buffer.from(encoded, 'base64').toString('utf8');
  const separatorIndex = decoded.indexOf(':');

  if (separatorIndex === -1) {
    return null;
  }

  return {
    username: decoded.slice(0, separatorIndex),
    password: decoded.slice(separatorIndex + 1),
  };
}

function safeEqual(value: string, expected: string): boolean {
  const valueBuffer = Buffer.from(value);
  const expectedBuffer = Buffer.from(expected);

  return (
    valueBuffer.length === expectedBuffer.length &&
    timingSafeEqual(valueBuffer, expectedBuffer)
  );
}

function normalizePath(path: string): string {
  return path.startsWith('/') ? path : `/${path}`;
}
