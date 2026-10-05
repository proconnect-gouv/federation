import { mockClient, type AwsClientStub } from "aws-sdk-client-mock";
import { afterEach, describe, expect, it, jest } from "@jest/globals";
import { Readable } from "node:stream";
import {
  S3Client,
  ListObjectsV2Command,
  GetObjectCommand,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import transfer from "./s3-transfer.js";

type S3Mock = AwsClientStub<S3Client>;

let s3Mock: S3Mock;

async function startTransfer(
  configure: (s3Mock: S3Mock) => void,
): Promise<void> {
  s3Mock = mockClient(S3Client);
  s3Mock.rejects(new Error("Unexpected S3 command"));
  configure(s3Mock);
  await transfer();
}

describe("transfer", () => {
  afterEach(() => {
    s3Mock.restore();
    jest.restoreAllMocks();
  });

  it("transfers CSV files to the public bucket and deletes them from the private bucket", async () => {
    const csvBody = "date,count\n2026-10-07,12";
    await startTransfer((mock) => {
      mock.on(ListObjectsV2Command).resolves({
        Contents: [{ Key: "daily.csv" }, { Key: "notes.txt" }, {}],
      });
      mock.on(GetObjectCommand).resolves({
        Body: Object.assign(Readable.from([csvBody]), {
          transformToByteArray: async () => new TextEncoder().encode(csvBody),
          transformToString: async () => csvBody,
          transformToWebStream: () =>
            new ReadableStream({
              start(controller) {
                controller.enqueue(new TextEncoder().encode(csvBody));
                controller.close();
              },
            }),
        }),
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
    expect(Array.from(putInput.Body as Uint8Array)).toEqual(
      Array.from(new TextEncoder().encode(csvBody)),
    );
    expect(
      s3Mock.commandCalls(DeleteObjectCommand)[0]!.args[0].input,
    ).toMatchObject({
      Bucket: "proconnect-preprod-statistiques",
      Key: "daily.csv",
    });
  });

  it("does not attempt a transfer when there are no CSV files", async () => {
    const log = jest.spyOn(console, "log").mockImplementation(() => {});
    await startTransfer((mock) => {
      mock.on(ListObjectsV2Command).resolves({
        Contents: [{ Key: "notes.txt" }],
      });
    });
    expect(log).toHaveBeenCalledWith("📄 CSV files to transfer:", []);
    expect(log).toHaveBeenCalledWith(
      expect.stringContaining("Transfer completed: 0 file(s) moved"),
    );
    expect(s3Mock.commandCalls(GetObjectCommand)).toHaveLength(0);
    expect(s3Mock.commandCalls(PutObjectCommand)).toHaveLength(0);
    expect(s3Mock.commandCalls(DeleteObjectCommand)).toHaveLength(0);
  });

  it("logs a listing error and stops without transferring files", async () => {
    const error = new Error("S3 listing failed");
    const errorLog = jest.spyOn(console, "error").mockImplementation(() => {});
    jest.spyOn(console, "log").mockImplementation(() => {});
    await startTransfer((mock) => {
      mock.on(ListObjectsV2Command).rejects(error);
    });

    expect(errorLog).toHaveBeenCalledWith(
      "Error occurred while listing S3 objects:",
      error,
    );
    expect(s3Mock.commandCalls(GetObjectCommand)).toHaveLength(0);
    expect(s3Mock.commandCalls(PutObjectCommand)).toHaveLength(0);
    expect(s3Mock.commandCalls(DeleteObjectCommand)).toHaveLength(0);
  });
});
