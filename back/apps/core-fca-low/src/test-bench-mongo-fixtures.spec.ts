import { getModelToken } from "@nestjs/mongoose";
import type { Model } from "mongoose";

import type { IdentityProvider } from "@fc/identity-provider-adapter-mongo/schemas";
import {
  FakeIdentityProvider,
  Fia1IdentityProviderDocument,
} from "@mocks/identity-provider-adapter-mongo";

import { TestingBench } from "./test-bench";

describe("TestingBench mongo fixtures", () => {
  it("seeds fia1 and reads it back with the schema-declared fields intact", async () => {
    await using bench = await TestingBench.createTestBench();

    await FakeIdentityProvider.create(Fia1IdentityProviderDocument).seed(
      bench.app,
    );

    const IdentityProviderModel = bench.app.get<Model<IdentityProvider>>(
      getModelToken("IdentityProvider"),
    );
    const stored = await IdentityProviderModel.findOne({
      uid: Fia1IdentityProviderDocument.uid,
    }).lean();

    expect(stored).toMatchObject(Fia1IdentityProviderDocument);
  });
});
