import * as otplib from 'otplib';
import * as qrcode from 'qrcode';
import { InjectConfig } from 'nestjs-config';
import { Injectable } from '@nestjs/common';

@Injectable()
export class TotpService {
  public constructor(@InjectConfig() private readonly config) {
    // setting
    otplib.authenticator.options = this.config.get('totp');
  }

  generateTotpSecret() {
    return otplib.authenticator.generateSecret();
  }

  async generateTotpQRCode(userData): Promise<any> {
    const user = userData.username;
    const { appName, environment } = this.config.get('app');
    const issuer = `${appName} - ${environment}`;
    const secret = userData.secret;
    const otpauth = otplib.authenticator.keyuri(user, issuer, secret);

    return new Promise((resolve, reject) => {
      qrcode.toDataURL(otpauth, (err, imageUrl) => {
        if (err) {
          reject(err);
        }

        resolve({
          user,
          issuer,
          secret,
          QRCode: imageUrl,
          step: otplib.authenticator.options.step,
          algorithm: otplib.authenticator.options.algorithm,
        });
      });
    });
  }
}
