import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { SecretManagerService } from './secret-manager.service';

@Injectable()
export class SecretAdapter {
  constructor(private readonly secretManager: SecretManagerService) {}

  generateSecret(): string {
    return this.secretManager.generateSHA256();
  }

  generateKey(): string {
    return uuidv4();
  }
}
