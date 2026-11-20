import { ConfigService } from "#libs/config";
import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { randomInt } from "crypto";
import { isValidObjectId, Model, Types } from "mongoose";
import { CrossDeviceAuthenticationConfig } from "./dto";
import { NOT_REVIEWED_STATUSES, RequestStatus } from "./enums";
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
    const latestRecentRequest = await this.findLatestNotReviewedRequest(params);
    if (latestRecentRequest) {
      return { _id: latestRecentRequest._id };
    }
    return this.createRequest(params);
  }

  async getNotReviewedRequests(email: string) {
    const result = await this.model.find({
      status: { $in: NOT_REVIEWED_STATUSES },
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

  async getRequestForRequester(params: {
    requestId: string;
    browsingSessionId: string;
  }) {
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

  async getRequestForReviewer(params: { requestId: string; email: string }) {
    if (!isValidObjectId(params.requestId)) {
      return null;
    }
    const request = await this.model.findOne({
      _id: params.requestId,
      email: params.email.toLowerCase(),
      ...this.getNotExpiredFilter(),
    });
    if (!request) {
      return null;
    }
    return { status: request.status };
  }

  async markAsVerificationStarted(params: {
    requestId: string;
    email: string;
  }) {
    if (!isValidObjectId(params.requestId)) {
      return null;
    }
    const now = new Date();
    const request = await this.model.findOneAndUpdate(
      {
        _id: params.requestId,
        status: { $in: NOT_REVIEWED_STATUSES },
        email: params.email.toLowerCase(),
        ...this.getNotExpiredFilter(),
      },
      [
        {
          $set: {
            // Reviewing again once the emojis are displayed keeps that status
            status: {
              $cond: [
                { $eq: ["$status", RequestStatus.EMOJIS_DISPLAYED] },
                "$status",
                RequestStatus.VERIFICATION_STARTED,
              ],
            },
            updatedAt: now,
            // Keeps the first value, so that reviewing again does not extend the request
            startedAt: { $ifNull: ["$startedAt", now] },
          },
        },
      ],
      { new: true, updatePipeline: true },
    );
    if (!request) {
      return null;
    }
    return { status: request.status, emojis: request.emojis };
  }

  async markAsEmojisDisplayed(params: {
    requestId: string;
    browsingSessionId: string;
  }): Promise<void> {
    if (!isValidObjectId(params.requestId) || !params.browsingSessionId) {
      return;
    }
    await this.model.findOneAndUpdate(
      {
        _id: params.requestId,
        status: RequestStatus.VERIFICATION_STARTED,
        browsingSessionId: params.browsingSessionId,
        ...this.getNotExpiredFilter(),
      },
      { status: RequestStatus.EMOJIS_DISPLAYED, updatedAt: new Date() },
    );
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
        status: RequestStatus.EMOJIS_DISPLAYED,
        email: params.email.toLowerCase(),
        ...this.getNotExpiredFilter(),
      },
      { status: params.status, updatedAt: new Date() },
    );
    return !!request;
  }

  private async findLatestNotReviewedRequest(params: {
    spName: string;
    email: string;
    browsingSessionId: string;
  }) {
    return this.model.findOne(
      {
        status: { $in: NOT_REVIEWED_STATUSES },
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
      status: RequestStatus.CREATED,
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
      maxDelayBetweenRequestCreationAndVerificationStartInMs,
    } = this.config.get<CrossDeviceAuthenticationConfig>(
      "CrossDeviceAuthentication",
    );
    const now = Date.now();
    return {
      $or: [
        {
          status: RequestStatus.CREATED,
          createdAt: {
            $gt: new Date(
              now - maxDelayBetweenRequestCreationAndVerificationStartInMs,
            ),
          },
        },
        {
          status: { $ne: RequestStatus.CREATED },
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
