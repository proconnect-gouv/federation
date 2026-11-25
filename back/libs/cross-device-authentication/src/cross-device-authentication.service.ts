import { ConfigService } from "#libs/config";
import { IpGeolocationService } from "#libs/ip-geolocation";
import { LoggerService, TrackedEvent } from "#libs/logger";
import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { randomInt } from "crypto";
import { isValidObjectId, Model, Types } from "mongoose";
import { CrossDeviceAuthenticationConfig } from "./dto";
import { NOT_REVIEWED_STATUSES, RequestStatus } from "./enums";
import { formatLocation, formatUserAgent } from "./helpers";
import { CrossDeviceAuthenticationRequest } from "./schemas";
import { XdaReviewerSessionService } from "./xda-reviewer-session.service";

const TRACKED_EVENTS: Record<RequestStatus, TrackedEvent> = {
  [RequestStatus.CREATED]: TrackedEvent.FC_CROSS_DEVICE_AUTHENTICATION_CREATED,
  [RequestStatus.VERIFICATION_STARTED]:
    TrackedEvent.FC_CROSS_DEVICE_AUTHENTICATION_VERIFICATION_STARTED,
  [RequestStatus.EMOJIS_DISPLAYED]:
    TrackedEvent.FC_CROSS_DEVICE_AUTHENTICATION_EMOJIS_DISPLAYED,
  [RequestStatus.APPROVED]:
    TrackedEvent.FC_CROSS_DEVICE_AUTHENTICATION_APPROVED,
  [RequestStatus.REJECTED]:
    TrackedEvent.FC_CROSS_DEVICE_AUTHENTICATION_REJECTED,
  [RequestStatus.CONSUMED]:
    TrackedEvent.FC_CROSS_DEVICE_AUTHENTICATION_CONSUMED,
};

@Injectable()
export class CrossDeviceAuthenticationService {
  constructor(
    @InjectModel("CrossDeviceAuthenticationRequest")
    private model: Model<CrossDeviceAuthenticationRequest>,
    private readonly config: ConfigService,
    private readonly xdaReviewerSession: XdaReviewerSessionService,
    private readonly logger: LoggerService,
    private readonly ipGeolocation: IpGeolocationService,
  ) {}

  async findOrCreateRequest(params: {
    ip: string | undefined;
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
    return result.map(({ id, spName, userAgent, location, createdAt }) => ({
      id,
      spName,
      device: formatUserAgent(userAgent),
      location: formatLocation(location, createdAt),
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
    // The request as it was before the update
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
      { updatePipeline: true },
    );
    if (!request) {
      return null;
    }

    const { emojis } = request;
    if (request.status === RequestStatus.EMOJIS_DISPLAYED) {
      return { status: RequestStatus.EMOJIS_DISPLAYED, emojis };
    }
    if (request.status === RequestStatus.CREATED) {
      this.trackStatus(params.requestId, RequestStatus.VERIFICATION_STARTED);
    }
    return { status: RequestStatus.VERIFICATION_STARTED, emojis };
  }

  async markAsEmojisDisplayed(params: {
    requestId: string;
    browsingSessionId: string;
  }): Promise<void> {
    if (!isValidObjectId(params.requestId) || !params.browsingSessionId) {
      return;
    }
    const request = await this.model.findOneAndUpdate(
      {
        _id: params.requestId,
        status: RequestStatus.VERIFICATION_STARTED,
        browsingSessionId: params.browsingSessionId,
        ...this.getNotExpiredFilter(),
      },
      { status: RequestStatus.EMOJIS_DISPLAYED, updatedAt: new Date() },
    );
    if (request) {
      this.trackStatus(params.requestId, RequestStatus.EMOJIS_DISPLAYED);
    }
  }

  async review(params: {
    requestId: string;
    email: string;
    status: RequestStatus.APPROVED | RequestStatus.REJECTED;
    reviewerSessionId: string;
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
    if (!request) {
      return false;
    }
    this.trackStatus(params.requestId, params.status);

    // Once the request is approved, so that only its reviewer can write here
    if (params.status === RequestStatus.APPROVED) {
      await this.xdaReviewerSession.save({
        requestId: params.requestId,
        reviewerSessionId: params.reviewerSessionId,
        ttlInMs: this.getRemainingTtlInMs(request.startedAt),
      });
    }
    return true;
  }

  async consume(params: {
    requestId: string;
    browsingSessionId: string;
  }): Promise<{ reviewerSessionId: string | null } | null> {
    if (!isValidObjectId(params.requestId) || !params.browsingSessionId) {
      return null;
    }
    const request = await this.model.findOneAndUpdate(
      {
        _id: params.requestId,
        status: RequestStatus.APPROVED,
        browsingSessionId: params.browsingSessionId,
        ...this.getNotExpiredFilter(),
      },
      { status: RequestStatus.CONSUMED, updatedAt: new Date() },
    );
    if (!request) {
      return null;
    }
    this.trackStatus(params.requestId, RequestStatus.CONSUMED);

    return {
      reviewerSessionId: await this.xdaReviewerSession.getAndDelete(
        params.requestId,
      ),
    };
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
    ip: string | undefined;
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
    this.trackStatus(_id.toString(), RequestStatus.CREATED);

    // In the background, so that the requester does not wait for it
    void this.saveLocation(_id, params.ip);

    return { _id };
  }

  private async saveLocation(
    _id: Types.ObjectId,
    ip: string | undefined,
  ): Promise<void> {
    try {
      const location = await this.ipGeolocation.getLocation(ip);
      await this.model.updateOne({ _id }, { location });
    } catch (error) {
      this.logger.error({
        code: "xda-location-not-saved",
        xdaLocationError: error?.message,
      });
    }
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

  private trackStatus(requestId: string, status: RequestStatus): void {
    this.logger.track(TRACKED_EVENTS[status], {
      crossDeviceAuthenticationRequestId: requestId,
    });
  }

  private getRemainingTtlInMs(startedAt: Date): number {
    const { requestExpirationDurationInMs } =
      this.config.get<CrossDeviceAuthenticationConfig>(
        "CrossDeviceAuthentication",
      );
    const expiresAt = startedAt.getTime() + requestExpirationDurationInMs;
    // Redis refuses a TTL that is not positive
    return Math.max(expiresAt - Date.now(), 1);
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
