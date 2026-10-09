import type { INestApplicationContext } from "@nestjs/common";
import { getModelToken } from "@nestjs/mongoose";
import type { Model } from "mongoose";

import { IdentityProviderAdapterMongoService } from "../src/identity-provider-adapter-mongo.service";
import type { IdentityProvider } from "../src/schemas";
import { Fia1IdentityProviderDocument } from "./seeds";

export class FakeIdentityProvider {
  private constructor(private data: Partial<IdentityProvider>) {}

  static create(
    base: Partial<IdentityProvider> = Fia1IdentityProviderDocument,
  ): FakeIdentityProvider {
    return new FakeIdentityProvider({ ...base });
  }

  withFields(fields: Partial<IdentityProvider>): this {
    Object.assign(this.data, fields);
    return this;
  }

  async seed(app: INestApplicationContext): Promise<IdentityProvider> {
    const IdentityProviderModel = app.get<Model<IdentityProvider>>(
      getModelToken("IdentityProvider"),
    );

    const identityProvider = await IdentityProviderModel.create(this.data);

    await app.get(IdentityProviderAdapterMongoService).refreshCache();

    return identityProvider;
  }
}
