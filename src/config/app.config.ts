export const appConfig = {
  port: Number(process.env.PORT ?? 3000),
  corsOrigin: process.env.CORS_ORIGIN ?? '*',
  swaggerPath: process.env.SWAGGER_PATH ?? '/api/docs',
  nodeEnv: process.env.NODE_ENV ?? 'development',
  isProduction: (process.env.NODE_ENV ?? 'development') === 'production',
  docsAuthEnabled:
    (process.env.NODE_ENV ?? 'development') === 'production' ||
    process.env.DOCS_AUTH_ENABLED !== 'false',
  docsUsername: process.env.DOCS_USERNAME ?? '',
  docsPassword: process.env.DOCS_PASSWORD ?? '',
};
