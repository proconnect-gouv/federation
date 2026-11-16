import { mockClient, type AwsClientStub } from "aws-sdk-client-mock";
import assert from "node:assert/strict";
import { afterEach, beforeEach, describe, it, mock } from "node:test";
import {
  S3Client,
  ListObjectsV2Command,
  GetObjectCommand,
  PutObjectCommand,
  DeleteObjectCommand,
  type GetObjectCommandOutput,
} from "@aws-sdk/client-s3";
import { Readable } from "node:stream";
import { inspect, isDeepStrictEqual } from "node:util";

import transfer from "./s3-transfer-job.ts";

type S3Mock = AwsClientStub<S3Client>;

function assertCalledWith(
  fn: { mock: { calls: { arguments: unknown[] }[] } },
  ...expected: unknown[]
): void {
  assert.ok(
    fn.mock.calls.some((call) => isDeepStrictEqual(call.arguments, expected)),
    `Expected a call with ${inspect(expected)}`,
  );
}

let s3Mock: S3Mock;
let originalEnv: NodeJS.ProcessEnv;

async function runTransferWithS3Mock(
  configure: (s3Mock: S3Mock) => void,
): Promise<void> {
  s3Mock = mockClient(S3Client);
  s3Mock.rejects(new Error("Unexpected S3 command"));
  configure(s3Mock);
  await transfer();
}

describe("transfer", () => {
  beforeEach(() => {
    originalEnv = process.env;
    process.env = {
      ...originalEnv,
      PRIVATE_S3_ENDPOINT: "https://private-s3.example",
      PRIVATE_S3_REGION: "eu-west-1",
      PRIVATE_NETWORK_S3_ACCESS_KEY_ID: "private-key",
      PRIVATE_NETWORK_S3_SECRET_ACCESS_KEY: "private-secret",
      INTERNET_REACHABLE_S3_ENDPOINT: "https://public-s3.example",
      INTERNET_REACHABLE_S3_REGION: "eu-west-1",
      INTERNET_REACHABLE_S3_ACCESS_KEY_ID: "public-key",
      INTERNET_REACHABLE_S3_SECRET_ACCESS_KEY: "public-secret",
      PRIVATE_S3_BUCKET_NAME: "proconnect-preprod-statistiques",
      INTERNET_REACHABLE_S3_BUCKET_NAME: "proconnect-statistiques-preprod",
    };
  });

  afterEach(() => {
    process.env = originalEnv;
    s3Mock.restore();
    mock.restoreAll();
  });

  it("calls S3 with the expected buckets, key, and CSV body", async () => {
    const csvBody = "date,count\n2026-10-07,12";
    await runTransferWithS3Mock((s3) => {
      s3.on(ListObjectsV2Command).resolves({
        Contents: [{ Key: "daily.csv" }, { Key: "notes.txt" }, {}],
      });
      s3.on(GetObjectCommand).resolves({
        Body: Readable.from([csvBody]) as NonNullable<
          GetObjectCommandOutput["Body"]
        >,
        ContentType: "text/csv",
      });
      s3.on(PutObjectCommand).resolves({});
      s3.on(DeleteObjectCommand).resolves({});
    });

    assert.equal(s3Mock.commandCalls(GetObjectCommand).length, 1);
    assert.partialDeepStrictEqual(
      s3Mock.commandCalls(GetObjectCommand)[0]!.args[0].input,
      {
        Bucket: "proconnect-preprod-statistiques",
        Key: "daily.csv",
      },
    );

    assert.equal(s3Mock.commandCalls(PutObjectCommand).length, 1);
    const putInput = s3Mock.commandCalls(PutObjectCommand)[0]!.args[0].input;
    assert.partialDeepStrictEqual(putInput, {
      Bucket: "proconnect-statistiques-preprod",
      Key: "daily.csv",
      ContentType: "text/csv",
    });
    assert.equal(Buffer.from(putInput.Body as Uint8Array).toString(), csvBody);

    assert.equal(s3Mock.commandCalls(DeleteObjectCommand).length, 1);
    assert.partialDeepStrictEqual(
      s3Mock.commandCalls(DeleteObjectCommand)[0]!.args[0].input,
      {
        Bucket: "proconnect-preprod-statistiques",
        Key: "daily.csv",
      },
    );
  });

  it("does not delete the private file when the public upload fails", async () => {
    const uploadError = new Error("Public S3 upload failed");
    mock.method(console, "log", () => {});

    await assert.rejects(
      runTransferWithS3Mock((s3) => {
        s3.on(ListObjectsV2Command).resolves({
          Contents: [{ Key: "daily.csv" }],
        });
        s3.on(GetObjectCommand).resolves({
          Body: Readable.from(["date,count\n2026-10-07,12"]) as NonNullable<
            GetObjectCommandOutput["Body"]
          >,
          ContentType: "text/csv",
        });
        s3.on(PutObjectCommand).rejects(uploadError);
      }),
      (thrown) => thrown === uploadError,
    );

    assert.equal(s3Mock.commandCalls(PutObjectCommand).length, 1);
    assert.equal(s3Mock.commandCalls(DeleteObjectCommand).length, 0);
  });

  it("does not attempt a transfer when there are no files", async () => {
    const log = mock.method(console, "log", () => {});
    await runTransferWithS3Mock((s3) => {
      s3.on(ListObjectsV2Command).resolves({
        Contents: [],
      });
    });
    assertCalledWith(log, "ℹ️  No file found in private-network S3 bucket");
    assert.equal(s3Mock.commandCalls(GetObjectCommand).length, 0);
    assert.equal(s3Mock.commandCalls(PutObjectCommand).length, 0);
    assert.equal(s3Mock.commandCalls(DeleteObjectCommand).length, 0);
  });

  it("does not attempt a transfer when there are no CSV files", async () => {
    const log = mock.method(console, "log", () => {});
    await runTransferWithS3Mock((s3) => {
      s3.on(ListObjectsV2Command).resolves({
        Contents: [{ Key: "notes.txt" }],
      });
    });
    assertCalledWith(log, "ℹ️  No CSV file found in private-network S3 bucket");
    assert.equal(s3Mock.commandCalls(GetObjectCommand).length, 0);
    assert.equal(s3Mock.commandCalls(PutObjectCommand).length, 0);
    assert.equal(s3Mock.commandCalls(DeleteObjectCommand).length, 0);
  });

  it("logs a listing error and stops without transferring files", async () => {
    const error = new Error("S3 listing failed");
    const errorLog = mock.method(console, "error", () => {});
    mock.method(console, "log", () => {});
    await assert.rejects(
      runTransferWithS3Mock((s3) => {
        s3.on(ListObjectsV2Command).rejects(error);
      }),
      (thrown) => thrown === error,
    );

    assertCalledWith(
      errorLog,
      "Error occurred while listing S3 objects:",
      error,
    );
    assert.equal(s3Mock.commandCalls(GetObjectCommand).length, 0);
    assert.equal(s3Mock.commandCalls(PutObjectCommand).length, 0);
    assert.equal(s3Mock.commandCalls(DeleteObjectCommand).length, 0);
  });
});
