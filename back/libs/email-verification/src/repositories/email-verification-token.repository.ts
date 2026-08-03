import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { EmailVerificationToken } from "../schemas";

@Injectable()
export class EmailVerificationTokenRepository {
  constructor(
    @InjectModel("EmailVerificationToken")
    private model: Model<EmailVerificationToken>,
  ) {}

  async findOne(email: string) {
    return this.model.findOne({ email });
  }

  async upsert(params: { email: string; token: string }) {
    const { email, token } = params;
    return this.model.findOneAndUpdate(
      {
        email,
      },
      {
        email,
        token,
        sentAt: new Date(),
      },
      { upsert: true },
    );
  }

  async deleteOne(email: string) {
    return this.model.deleteOne({ email });
  }
}
