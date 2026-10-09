import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import crypto from "crypto";
import { Model } from "mongoose";
import { v4 as uuid } from "uuid";
import { RequestStatus } from "./enums";

import { CryptographyService } from "@fc/cryptography";
import { CrossDeviceAuthenticationRequest } from "./schemas";

const EXPIRATION_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

@Injectable()
export class CrossDeviceAuthenticationService {
  constructor(
    @InjectModel("CrossDeviceAuthenticationRequest")
    private model: Model<CrossDeviceAuthenticationRequest>,
    private readonly cryptography: CryptographyService,
  ) {}

  async create(params: { userAgent: string; spName: string; email: string }) {
    const deviceSecret = this.generateDeviceSecret();
    const id = uuid();
    const emojis = this.generateEmojis();
    const hashedDeviceSecret = this.cryptography.hash(deviceSecret);
    const now = new Date();
    const expiresAt = new Date(now.getTime() + EXPIRATION_DURATION);
    await this.model.insertOne({
      id,
      status: RequestStatus.INITIATED,
      emojis,
      userAgent: params.userAgent,
      spName: params.spName,
      email: params.email.toLowerCase(),
      hashedDeviceSecret,
      createdAt: now,
      expiresAt,
    });
    return { id, emojis, deviceSecret };
  }

  async getInitiatedRequests(email: string) {
    const result = await this.model.find({
      status: RequestStatus.INITIATED,
      email: email.toLowerCase(),
    });
    return result;
  }

  private generateDeviceSecret() {
    return crypto.randomBytes(32).toString("hex");
  }
  private generateEmojis() {
    // Replace this with your actual emoji generation logic
    return ["😀", "😎", "🤖", "👾"];
  }
}
