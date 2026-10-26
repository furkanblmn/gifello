import { Injectable, NotFoundException } from '@nestjs/common';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { appConfig } from '../../config/app.config';

interface PostmanCollection {
  variable: Array<{ key: string; value: string }>;
  [key: string]: unknown;
}

@Injectable()
export class SiteService {
  getPostmanCollection(): Buffer {
    const filePath = join(
      process.cwd(),
      'docs',
      'postman',
      'gifello-v1.postman_collection.json',
    );

    if (!existsSync(filePath)) {
      throw new NotFoundException('Postman collection was not found.');
    }

    const collection = JSON.parse(
      readFileSync(filePath, 'utf8'),
    ) as PostmanCollection;

    if (appConfig.isProduction) {
      for (const variable of collection.variable) {
        if (variable.key === 'baseUrl') {
          variable.value = 'https://gifello.app';
        }
      }
    }

    return Buffer.from(JSON.stringify(collection, null, 2));
  }
}
