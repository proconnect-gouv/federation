import { generate } from 'otplib';

export function getTotp(args) {
  const { secret } = args;
  return generate({ secret });
}
