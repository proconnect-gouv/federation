import { ConfigService } from "#libs/config";
import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { randomInt } from "crypto";
import { isValidObjectId, Model, Types } from "mongoose";
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

  async findOrCreateRequest(params: {
    userAgent: string;
    spName: string;
    email: string;
    browsingSessionId: string;
  }): Promise<{ _id: Types.ObjectId }> {
    const latestRecentRequest = await this.findLatestRecentRequest(params);
    if (latestRecentRequest) {
      return { _id: latestRecentRequest._id };
    }
    return this.createRequest(params);
  }

  async getAwaitingRequests(email: string) {
    const result = await this.model.find({
      status: { $in: [RequestStatus.INITIATED, RequestStatus.PENDING] },
      email: email.toLowerCase(),
      ...this.getNotExpiredFilter(),
    });
    return result.map(({ id, spName, userAgent, createdAt }) => ({
      id,
      spName,
      device: formatUserAgent(userAgent),
      createdAt,
    }));
  }

  async getRequest(params: { requestId: string; browsingSessionId: string }) {
    if (!isValidObjectId(params.requestId) || !params.browsingSessionId) {
      return null;
    }
    const request = await this.model.findOne({
      _id: params.requestId,
      browsingSessionId: params.browsingSessionId,
      ...this.getNotExpiredFilter(),
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
    const now = new Date();
    const request = await this.model.findOneAndUpdate(
      {
        _id: params.requestId,
        status: { $in: [RequestStatus.INITIATED, RequestStatus.PENDING] },
        email: params.email.toLowerCase(),
        ...this.getNotExpiredFilter(),
      },
      {
        $set: { status: RequestStatus.PENDING, updatedAt: now },
        // Keeps the first value, so that reviewing again does not extend the request
        $min: { startedAt: now },
      },
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
        ...this.getNotExpiredFilter(),
      },
      { status: params.status, updatedAt: new Date() },
    );
    return !!request;
  }

  private async findLatestRecentRequest(params: {
    spName: string;
    email: string;
    browsingSessionId: string;
  }) {
    return this.model.findOne(
      {
        spName: params.spName,
        email: params.email.toLowerCase(),
        browsingSessionId: params.browsingSessionId,
        ...this.getNotExpiredFilter(),
      },
      { _id: true },
      { sort: { createdAt: -1 } },
    );
  }

  private async createRequest(params: {
    userAgent: string;
    spName: string;
    email: string;
    browsingSessionId: string;
  }) {
    const { _id } = await this.model.insertOne({
      status: RequestStatus.INITIATED,
      emojis: this.generateEmojis(),
      userAgent: params.userAgent,
      spName: params.spName,
      email: params.email.toLowerCase(),
      browsingSessionId: params.browsingSessionId,
    });
    return { _id };
  }

  private getNotExpiredFilter() {
    const {
      requestExpirationDurationInMs,
      requestMaxDelayBetweenCreationAndStart,
    } = this.config.get<CrossDeviceAuthenticationConfig>(
      "CrossDeviceAuthentication",
    );
    const now = Date.now();
    return {
      $or: [
        {
          status: RequestStatus.INITIATED,
          createdAt: {
            $gt: new Date(now - requestMaxDelayBetweenCreationAndStart),
          },
        },
        {
          status: { $ne: RequestStatus.INITIATED },
          startedAt: { $gt: new Date(now - requestExpirationDurationInMs) },
        },
      ],
    };
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
