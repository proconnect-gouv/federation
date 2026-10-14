import { ConfigService } from "#libs/config";
import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { randomInt } from "crypto";
import { Model } from "mongoose";
import { CrossDeviceAuthenticationConfig } from "./dto";
import { RequestStatus } from "./enums";
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

  async getInitiatedRequests(email: string) {
    const result = await this.model.find({
      status: RequestStatus.INITIATED,
      email: email.toLowerCase(),
    });
    return result;
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
