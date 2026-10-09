import type { INestApplicationContext } from "@nestjs/common";
import { getModelToken } from "@nestjs/mongoose";
import type { Model } from "mongoose";

import type { ServiceProvider } from "../src/schemas";
import { ServiceProviderAdapterMongoService } from "../src/service-provider-adapter-mongo.service";
import { Fsa1ServiceProviderDocument } from "./seeds";

export class FakeServiceProvider {
  private constructor(private data: Partial<ServiceProvider>) {}

  static create(
    base: Partial<ServiceProvider> = Fsa1ServiceProviderDocument,
  ): FakeServiceProvider {
    return new FakeServiceProvider({ ...base });
  }

  withFields(fields: Partial<ServiceProvider>): this {
    Object.assign(this.data, fields);
    return this;
  }

  async seed(app: INestApplicationContext): Promise<ServiceProvider> {
    const ServiceProviderModel = app.get<Model<ServiceProvider>>(
      getModelToken("ServiceProvider"),
    );

    const serviceProvider = await ServiceProviderModel.create(this.data);

    await app.get(ServiceProviderAdapterMongoService).refreshCache();

    return serviceProvider;
  }
}
