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
    });
    return result.map(({ id, spName, userAgent }) => ({
      id,
      spName,
      device: formatUserAgent(userAgent),
    }));
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
