import { ConfigService } from "#libs/config";
import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { randomInt } from "crypto";
import { isValidObjectId, Model } from "mongoose";
import { CrossDeviceAuthenticationConfig } from "./dto";
import { RequestStatus } from "./enums";
import { formatUserAgent } from "./helpers";
import { CrossDeviceAuthenticationRequest } from "./schemas";

@Injectable()
export class CrossDeviceAuthenticationService {
  constructor(
    @InjectModel("CrossDeviceAuthenticationRequest")
    private model: Model<CrossDeviceAuthenticationRequest>,
    private readonly config: ConfigService,
  ) {}

  async create(params: {
    userAgent: string;
    spName: string;
    email: string;
    browsingSessionId: string;
  }) {
    const emojis = this.generateEmojis();
    const { _id } = await this.model.insertOne({
      status: RequestStatus.INITIATED,
      emojis,
      userAgent: params.userAgent,
      spName: params.spName,
      email: params.email.toLowerCase(),
      browsingSessionId: params.browsingSessionId,
    });
    return { _id, emojis };
  }

  async getAwaitingRequests(email: string) {
    const result = await this.model.find({
      status: { $in: [RequestStatus.INITIATED, RequestStatus.PENDING] },
      email: email.toLowerCase(),
      createdAt: { $gt: this.getExpirationThreshold() },
    });
    return result.map(({ id, spName, userAgent }) => ({
      id,
      spName,
      device: formatUserAgent(userAgent),
    }));
  }

  async getRequest(params: { requestId: string; browsingSessionId: string }) {
    if (!isValidObjectId(params.requestId) || !params.browsingSessionId) {
      return null;
    }
    const request = await this.model.findOne({
      _id: params.requestId,
      browsingSessionId: params.browsingSessionId,
      createdAt: { $gt: this.getExpirationThreshold() },
    });
    if (!request) {
      return null;
    }
    return { status: request.status, emojis: request.emojis };
  }

  async markAsPending(params: { requestId: string; email: string }) {
    if (!isValidObjectId(params.requestId)) {
      return null;
    }
    const request = await this.model.findOneAndUpdate(
      {
        _id: params.requestId,
        status: { $in: [RequestStatus.INITIATED, RequestStatus.PENDING] },
        email: params.email.toLowerCase(),
        createdAt: { $gt: this.getExpirationThreshold() },
      },
      { status: RequestStatus.PENDING, updatedAt: new Date() },
      { new: true },
    );
    if (!request) {
      return null;
    }
    return {
      emojis: request.emojis,
      device: formatUserAgent(request.userAgent),
      spName: request.spName,
    };
  }

  async review(params: {
    requestId: string;
    email: string;
    status: RequestStatus.APPROVED | RequestStatus.REJECTED;
  }): Promise<boolean> {
    if (!isValidObjectId(params.requestId)) {
      return false;
    }
    const request = await this.model.findOneAndUpdate(
      {
        _id: params.requestId,
        status: RequestStatus.PENDING,
        email: params.email.toLowerCase(),
        createdAt: { $gt: this.getExpirationThreshold() },
      },
      { status: params.status, updatedAt: new Date() },
    );
    return !!request;
  }

  private getExpirationThreshold(): Date {
    const { requestExpirationDurationInMs } =
      this.config.get<CrossDeviceAuthenticationConfig>(
        "CrossDeviceAuthentication",
      );
    return new Date(Date.now() - requestExpirationDurationInMs);
  }

  private generateEmojis(): string[] {
    const { emojiAlphabet, emojiCodeLength } =
      this.config.get<CrossDeviceAuthenticationConfig>(
        "CrossDeviceAuthentication",
      );

    const availableEmojis = [...emojiAlphabet];
    const selectedEmojis: string[] = [];

    for (let i = 0; i < emojiCodeLength; i++) {
      const randomIndex = randomInt(0, availableEmojis.length);
      const selectedEmoji = availableEmojis.splice(randomIndex, 1)[0];
      selectedEmojis.push(selectedEmoji);
    }

    return selectedEmojis;
  }
}
