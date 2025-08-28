import * as otplib from 'otplib';
interface TotpArgs {
  totpSecret: string;
}

export function getTotp(args: TotpArgs): Promise<string> {
  const { totpSecret } = args;
  return new Promise((resolve) =>
    resolve(otplib.authenticator.generate(totpSecret)),
  );
}
