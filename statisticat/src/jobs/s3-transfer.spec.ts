import { mockClient } from "aws-sdk-client-mock";
import { afterEach, describe, expect, it, jest } from "@jest/globals";

type S3Mock = ReturnType<typeof mockClient>;
type S3Sdk = typeof import("@aws-sdk/client-s3");

let restoreS3Mock: (() => void) | undefined;

type TransferContext = { s3Mock: S3Mock; sdk: S3Sdk };
async function startTransfer(
  configure: (s3Mock: S3Mock, sdk: S3Sdk) => void,
): Promise<TransferContext> {
  jest.resetModules();
  const sdk = jest.requireActual<S3Sdk>("@aws-sdk/client-s3");
  const s3Mock = mockClient(sdk.S3Client);
  restoreS3Mock = () => s3Mock.restore();
  configure(s3Mock, sdk);
  jest.requireActual("./s3-transfer");
  return { s3Mock, sdk };
}

async function waitFor(assertion: () => boolean): Promise<void> {
  for (let attempt = 0; attempt < 20 && !assertion(); attempt++) {
    await Promise.resolve();
  }
  expect(assertion()).toBe(true);
}

describe("transfer", () => {
  afterEach(() => {
    restoreS3Mock?.();
    restoreS3Mock = undefined;
    jest.restoreAllMocks();
  });

  it("transfers CSV files to the public bucket and deletes them from the private bucket", async () => {
    const csvBody = "date,count\n2026-10-07,12";
    const { s3Mock, sdk } = await startTransfer((mock, sdk) => {
      mock.on(sdk.ListObjectsV2Command).resolves({
        Contents: [{ Key: "daily.csv" }, { Key: "notes.txt" }, {}],
      });
      mock.on(sdk.GetObjectCommand).resolves({
        Body: Buffer.from(csvBody),
        ContentType: "text/csv",
      });
      mock.on(sdk.PutObjectCommand).resolves({});
      mock.on(sdk.DeleteObjectCommand).resolves({});
    });

    await waitFor(
      () => s3Mock.commandCalls(sdk.DeleteObjectCommand).length === 1,
    );

    expect(s3Mock.commandCalls(sdk.GetObjectCommand)).toHaveLength(1);
    expect(
      s3Mock.commandCalls(sdk.GetObjectCommand)[0]!.args[0].input,
    ).toMatchObject({
      Bucket: "proconnect-preprod-statistiques",
      Key: "daily.csv",
    });
    expect(s3Mock.commandCalls(sdk.PutObjectCommand)).toHaveLength(1);
    const putInput = s3Mock.commandCalls(sdk.PutObjectCommand)[0]!.args[0]
      .input;
    expect(putInput).toMatchObject({
      Bucket: "proconnect-statistiques-preprod",
      Key: "daily.csv",
      ContentType: "text/csv",
    });
    expect(Array.from(putInput.Body as Uint8Array)).toEqual(
      Array.from(new TextEncoder().encode(csvBody)),
    );
    expect(
      s3Mock.commandCalls(sdk.DeleteObjectCommand)[0]!.args[0].input,
    ).toMatchObject({
      Bucket: "proconnect-preprod-statistiques",
      Key: "daily.csv",
    });
  });

  it("does not attempt a transfer when there are no CSV files", async () => {
    const log = jest.spyOn(console, "log").mockImplementation(() => {});
    const { s3Mock, sdk } = await startTransfer((mock, sdk) => {
      mock.on(sdk.ListObjectsV2Command).resolves({
        Contents: [{ Key: "notes.txt" }],
      });
    });
    await waitFor(() =>
      log.mock.calls.some(([message]) =>
        String(message).includes("Transfer completed: 0 file(s) moved"),
      ),
    );

    expect(log).toHaveBeenCalledWith("📄 CSV files to transfer:", []);
    expect(log).toHaveBeenCalledWith(
      expect.stringContaining("Transfer completed: 0 file(s) moved"),
    );
    expect(s3Mock.commandCalls(sdk.GetObjectCommand)).toHaveLength(0);
    expect(s3Mock.commandCalls(sdk.PutObjectCommand)).toHaveLength(0);
    expect(s3Mock.commandCalls(sdk.DeleteObjectCommand)).toHaveLength(0);
  });

  it("logs a listing error and stops without transferring files", async () => {
    const error = new Error("S3 listing failed");
    const errorLog = jest.spyOn(console, "error").mockImplementation(() => {});
    jest.spyOn(console, "log").mockImplementation(() => {});
    const { s3Mock, sdk } = await startTransfer((mock, sdk) => {
      mock.on(sdk.ListObjectsV2Command).rejects(error);
    });

    await waitFor(() => errorLog.mock.calls.length > 0);

    expect(errorLog).toHaveBeenCalledWith(
      "Error occurred while listing S3 objects:",
      error,
    );
    expect(s3Mock.commandCalls(sdk.GetObjectCommand)).toHaveLength(0);
    expect(s3Mock.commandCalls(sdk.PutObjectCommand)).toHaveLength(0);
    expect(s3Mock.commandCalls(sdk.DeleteObjectCommand)).toHaveLength(0);
  });
});
