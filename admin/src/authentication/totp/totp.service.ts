import * as otplib from 'otplib';
import qrcode from 'qrcode';
import { InjectConfig } from 'nestjs-config';
import { Injectable } from '@nestjs/common';
import { LoggerService } from '../../logger/logger.service';

@Injectable()
export class TotpService {
  public constructor(
    @InjectConfig() private readonly config,
    private readonly logger: LoggerService,
  ) {}

  generateTotpSecret() {
    return otplib.generateSecret();
  }

  async check(totp: string, secret: string): Promise<boolean> {
    try {
      const result = await otplib.verify({
        token: totp,
        secret,
        counterTolerance: [1, 1],
      });
      return result.valid;
    } catch (error) {
      this.logger.error(error);
      return false;
    }
  }

  async generateTotpQRCode(userData: {
    username: string;
    secret: string;
  }): Promise<{
    user: string;
    issuer: string;
    secret: string;
    QRCode: string;
    algorithm: string;
    period: number;
  }> {
    const period = 30;
    const algorithm = 'sha1';
    const user = userData.username;
    const { appName, environment } = this.config.get('app');
    const issuer = `${appName} - ${environment}`;
    const secret = userData.secret;
    const uri = otplib.generateURI({
      label: user,
      issuer,
      secret,
      algorithm,
      period,
    });

    return new Promise((resolve, reject) => {
      qrcode.toDataURL(uri, (err, imageUrl) => {
        if (err) {
          reject(err);
        }

        resolve({
          user,
          issuer,
          secret,
          QRCode: imageUrl,
          algorithm,
          period,
        });
      });
    });
  }
}
