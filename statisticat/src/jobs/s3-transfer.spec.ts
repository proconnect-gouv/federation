import { mockClient, type AwsClientStub } from "aws-sdk-client-mock";
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  jest,
} from "@jest/globals";
import {
  S3Client,
  ListObjectsV2Command,
  GetObjectCommand,
  PutObjectCommand,
  DeleteObjectCommand,
  type GetObjectCommandOutput,
} from "@aws-sdk/client-s3";
import { Readable } from "node:stream";

jest.mock("https-proxy-agent", () => ({
  HttpsProxyAgent: jest.fn(),
}));

jest.mock("http-proxy-agent", () => ({
  HttpProxyAgent: jest.fn(),
}));

import transfer from "./s3-transfer-job.js";

type S3Mock = AwsClientStub<S3Client>;

let s3Mock: S3Mock;

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
    jest.replaceProperty(process, "env", {
      ...process.env,
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
    });
  });

  afterEach(() => {
    s3Mock.restore();
    jest.restoreAllMocks();
  });

  it("calls S3 with the expected buckets, key, and CSV body", async () => {
    const csvBody = "date,count\n2026-10-07,12";
    await runTransferWithS3Mock((mock) => {
      mock.on(ListObjectsV2Command).resolves({
        Contents: [{ Key: "daily.csv" }, { Key: "notes.txt" }, {}],
      });
      mock.on(GetObjectCommand).resolves({
        Body: Readable.from([csvBody]) as NonNullable<
          GetObjectCommandOutput["Body"]
        >,
        ContentType: "text/csv",
      });
      mock.on(PutObjectCommand).resolves({});
      mock.on(DeleteObjectCommand).resolves({});
    });

    expect(s3Mock.commandCalls(GetObjectCommand)).toHaveLength(1);
    expect(
      s3Mock.commandCalls(GetObjectCommand)[0]!.args[0].input,
    ).toMatchObject({
      Bucket: "proconnect-preprod-statistiques",
      Key: "daily.csv",
    });

    expect(s3Mock.commandCalls(PutObjectCommand)).toHaveLength(1);
    const putInput = s3Mock.commandCalls(PutObjectCommand)[0]!.args[0].input;
    expect(putInput).toMatchObject({
      Bucket: "proconnect-statistiques-preprod",
      Key: "daily.csv",
      ContentType: "text/csv",
    });
    expect(Buffer.from(putInput.Body as Uint8Array).toString()).toBe(csvBody);

    expect(s3Mock.commandCalls(DeleteObjectCommand)).toHaveLength(1);
    expect(
      s3Mock.commandCalls(DeleteObjectCommand)[0]!.args[0].input,
    ).toMatchObject({
      Bucket: "proconnect-preprod-statistiques",
      Key: "daily.csv",
    });
  });

  it("does not delete the private file when the public upload fails", async () => {
    const uploadError = new Error("Public S3 upload failed");
    jest.spyOn(console, "log").mockImplementation(() => {});

    await expect(
      runTransferWithS3Mock((mock) => {
        mock.on(ListObjectsV2Command).resolves({
          Contents: [{ Key: "daily.csv" }],
        });
        mock.on(GetObjectCommand).resolves({
          Body: Readable.from(["date,count\n2026-10-07,12"]) as NonNullable<
            GetObjectCommandOutput["Body"]
          >,
          ContentType: "text/csv",
        });
        mock.on(PutObjectCommand).rejects(uploadError);
      }),
    ).rejects.toBe(uploadError);

    expect(s3Mock.commandCalls(PutObjectCommand)).toHaveLength(1);
    expect(s3Mock.commandCalls(DeleteObjectCommand)).toHaveLength(0);
  });

  it("does not attempt a transfer when there are no files", async () => {
    const log = jest.spyOn(console, "log").mockImplementation(() => {});
    await runTransferWithS3Mock((mock) => {
      mock.on(ListObjectsV2Command).resolves({
        Contents: [],
      });
    });
    expect(log).toHaveBeenCalledWith(
      "ℹ️  No file found in private-network S3 bucket",
    );
    expect(s3Mock.commandCalls(GetObjectCommand)).toHaveLength(0);
    expect(s3Mock.commandCalls(PutObjectCommand)).toHaveLength(0);
    expect(s3Mock.commandCalls(DeleteObjectCommand)).toHaveLength(0);
  });

  it("does not attempt a transfer when there are no CSV files", async () => {
    const log = jest.spyOn(console, "log").mockImplementation(() => {});
    await runTransferWithS3Mock((mock) => {
      mock.on(ListObjectsV2Command).resolves({
        Contents: [{ Key: "notes.txt" }],
      });
    });
    expect(log).toHaveBeenCalledWith(
      "ℹ️  No CSV file found in private-network S3 bucket",
    );
    expect(s3Mock.commandCalls(GetObjectCommand)).toHaveLength(0);
    expect(s3Mock.commandCalls(PutObjectCommand)).toHaveLength(0);
    expect(s3Mock.commandCalls(DeleteObjectCommand)).toHaveLength(0);
  });

  it("logs a listing error and stops without transferring files", async () => {
    const error = new Error("S3 listing failed");
    const errorLog = jest.spyOn(console, "error").mockImplementation(() => {});
    jest.spyOn(console, "log").mockImplementation(() => {});
    await expect(
      runTransferWithS3Mock((mock) => {
        mock.on(ListObjectsV2Command).rejects(error);
      }),
    ).rejects.toBe(error);

    expect(errorLog).toHaveBeenCalledWith(
      "Error occurred while listing S3 objects:",
      error,
    );
    expect(s3Mock.commandCalls(GetObjectCommand)).toHaveLength(0);
    expect(s3Mock.commandCalls(PutObjectCommand)).toHaveLength(0);
    expect(s3Mock.commandCalls(DeleteObjectCommand)).toHaveLength(0);
  });
});
