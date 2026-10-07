import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { RequestStatus } from "./enums";

import { CrossDeviceAuthenticationRequest } from "./schemas";

@Injectable()
export class CrossDeviceAuthenticationService {
  constructor(
    @InjectModel("CrossDeviceAuthenticationRequest")
    private model: Model<CrossDeviceAuthenticationRequest>,
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

  private generateEmojis() {
    // Replace this with your actual emoji generation logic
    return ["😀", "😎", "🤖", "👾"];
  }
}
