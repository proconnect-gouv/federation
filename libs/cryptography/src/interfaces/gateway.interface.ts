export interface IGateway {
  sign(privateKey: string, data: Buffer, digest?: string): Promise<Buffer>;
  privateDecrypt(privateKey: string, cipher: Buffer): Promise<Buffer>;
}
