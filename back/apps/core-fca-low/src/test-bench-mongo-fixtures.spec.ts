import { getModelToken } from "@nestjs/mongoose";
import type { Model } from "mongoose";

import type { IdentityProvider } from "@fc/identity-provider-adapter-mongo/schemas";
import {
  createIdentityProvider,
  Fia1IdentityProviderDocument,
} from "@mocks/identity-provider-adapter-mongo";

import { TestingBench } from "./test-bench";

describe("TestingBench mongo fixtures", () => {
  it("seeds fia1 and reads it back with the schema-declared fields intact", async () => {
    await using bench = await TestingBench.createTestBench();

    await createIdentityProvider(bench.app, Fia1IdentityProviderDocument);

    const IdentityProviderModel = bench.app.get<Model<IdentityProvider>>(
      getModelToken("IdentityProvider"),
    );
    const stored = await IdentityProviderModel.findOne({
      uid: Fia1IdentityProviderDocument.uid,
    }).lean();

    expect(stored).toMatchObject(Fia1IdentityProviderDocument);
  });
});
