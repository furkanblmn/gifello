import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthService {
  getHealth() {
    return { module: 'auth', status: 'ok' };
  }
}
