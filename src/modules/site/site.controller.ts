import {
  Controller,
  Get,
  Header,
  Headers,
  NotFoundException,
  Res,
  StreamableFile,
  VERSION_NEUTRAL,
} from '@nestjs/common';
import { createReadStream, existsSync } from 'node:fs';
import { join } from 'node:path';
import type { Response } from 'express';

@Controller({
  version: VERSION_NEUTRAL,
})
export class SiteController {
  @Get()
  @Header('Content-Type', 'text/html; charset=utf-8')
  home(@Headers('host') host = ''): string {
    return this.isDocsHost(host) ? this.docsHtml() : this.welcomeHtml();
  }

  @Get('docs')
  @Header('Content-Type', 'text/html; charset=utf-8')
  docs(): string {
    return this.docsHtml();
  }

  @Get('postman/gifello-v1.postman_collection.json')
  downloadPostmanCollection(@Res({ passthrough: true }) res: Response) {
    const filePath = join(
      process.cwd(),
      'docs',
      'postman',
      'gifello-v1.postman_collection.json',
    );

    if (!existsSync(filePath)) {
      throw new NotFoundException('Postman collection was not found.');
    }

    res.set({
      'Content-Type': 'application/json; charset=utf-8',
      'Content-Disposition':
        'attachment; filename="gifello-v1.postman_collection.json"',
    });

    return new StreamableFile(createReadStream(filePath));
  }

  private isDocsHost(host: string): boolean {
    return host.toLowerCase().split(':')[0] === 'doc.gifello.app';
  }

  private welcomeHtml(): string {
    return `<!doctype html>
<html lang="tr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Gifello</title>
  <style>
    :root {
      color-scheme: light;
      font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      color: #172026;
      background: #f5f7f8;
    }
    * { box-sizing: border-box; }
    body {
      min-height: 100vh;
      margin: 0;
      display: grid;
      place-items: center;
      padding: 24px;
    }
    main {
      width: min(720px, 100%);
      text-align: center;
      padding: 40px 24px;
    }
    h1 {
      margin: 0 0 12px;
      font-size: clamp(36px, 8vw, 72px);
      line-height: 1;
      letter-spacing: 0;
    }
    p {
      margin: 0 auto 28px;
      max-width: 520px;
      color: #53616a;
      font-size: 18px;
      line-height: 1.6;
    }
    a {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-height: 44px;
      padding: 0 18px;
      border-radius: 8px;
      background: #111827;
      color: #fff;
      text-decoration: none;
      font-weight: 700;
    }
  </style>
</head>
<body>
  <main>
    <h1>Gifello</h1>
    <p>Gifello API yayında. Mobil ve frontend entegrasyonları için dokümantasyon alanını kullanabilirsiniz.</p>
    <a href="/docs">API Dokümantasyonu</a>
  </main>
</body>
</html>`;
  }

  private docsHtml(): string {
    return `<!doctype html>
<html lang="tr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Gifello API Docs</title>
  <style>
    :root {
      color-scheme: light;
      font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      color: #172026;
      background: #eef2f3;
    }
    * { box-sizing: border-box; }
    body {
      min-height: 100vh;
      margin: 0;
      display: flex;
      flex-direction: column;
    }
    header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      padding: 18px 24px;
      background: #fff;
      border-bottom: 1px solid #d8e0e4;
    }
    h1 {
      margin: 0;
      font-size: 22px;
      line-height: 1.2;
      letter-spacing: 0;
    }
    nav {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
      justify-content: flex-end;
    }
    a {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-height: 38px;
      padding: 0 14px;
      border-radius: 8px;
      border: 1px solid #cbd5da;
      color: #172026;
      text-decoration: none;
      font-weight: 700;
      background: #fff;
    }
    a.primary {
      border-color: #111827;
      background: #111827;
      color: #fff;
    }
    iframe {
      width: 100%;
      flex: 1;
      min-height: calc(100vh - 75px);
      border: 0;
      background: #fff;
    }
    @media (max-width: 640px) {
      header {
        align-items: stretch;
        flex-direction: column;
      }
      nav {
        justify-content: flex-start;
      }
      a {
        flex: 1 1 180px;
      }
      iframe {
        min-height: calc(100vh - 156px);
      }
    }
  </style>
</head>
<body>
  <header>
    <h1>Gifello API Docs</h1>
    <nav>
      <a class="primary" href="/postman/gifello-v1.postman_collection.json">Postman Collection İndir</a>
      <a href="/api/docs" target="_blank" rel="noreferrer">Swagger Aç</a>
      <a href="/api/docs-json" target="_blank" rel="noreferrer">OpenAPI JSON</a>
    </nav>
  </header>
  <iframe src="/api/docs" title="Gifello Swagger UI"></iframe>
</body>
</html>`;
  }
}
