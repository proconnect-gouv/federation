import {
  ListObjectsV2Command,
  S3Client,
  GetObjectCommand,
  DeleteObjectCommand,
  type ListObjectsV2CommandOutput,
} from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";

function getRequiredEnv(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

function initializeS3Clients(): {
  privateS3Client: S3Client;
  publicS3Client: S3Client;
} {
  const privateS3Client = new S3Client({
    endpoint: getRequiredEnv("PRIVATE_S3_ENDPOINT"),
    region: getRequiredEnv("PRIVATE_S3_REGION"),
    forcePathStyle: process.env["S3_FORCE_PATH_STYLE"] === "true",
    credentials: {
      accessKeyId: getRequiredEnv("PRIVATE_NETWORK_S3_ACCESS_KEY_ID"),
      secretAccessKey: getRequiredEnv("PRIVATE_NETWORK_S3_SECRET_ACCESS_KEY"),
    },
  });

  const publicS3Client = new S3Client({
    endpoint: getRequiredEnv("INTERNET_REACHABLE_S3_ENDPOINT"),
    region: getRequiredEnv("INTERNET_REACHABLE_S3_REGION"),
    forcePathStyle: process.env["S3_FORCE_PATH_STYLE"] === "true",
    credentials: {
      accessKeyId: getRequiredEnv("INTERNET_REACHABLE_S3_ACCESS_KEY_ID"),
      secretAccessKey: getRequiredEnv(
        "INTERNET_REACHABLE_S3_SECRET_ACCESS_KEY",
      ),
    },
  });

  return {
    privateS3Client,
    publicS3Client,
  };
}

async function transferCSVFromPrivateToPublic(
  privateS3Client: S3Client,
  privateBucketName: string,
  csvFileKey: string,
  publicS3Client: S3Client,
  publicBucketName: string,
): Promise<void> {
  const source = await privateS3Client.send(
    new GetObjectCommand({ Bucket: privateBucketName, Key: csvFileKey }),
  );

  console.log(`Fetched source object for key: ${csvFileKey}`);

  if (!source.Body) {
    throw new Error(`Objet vide ou introuvable : ${csvFileKey}`);
  }

  await new Upload({
    client: publicS3Client,
    params: {
      Bucket: publicBucketName,
      Key: `${csvFileKey}`,
      Body: source.Body,
      ContentType: source.ContentType,
    },
  }).done();

  // delete the source object from the private S3 bucket after successful transfer
  await privateS3Client.send(
    new DeleteObjectCommand({ Bucket: privateBucketName, Key: csvFileKey }),
  );
  console.log(`Deleted source object from private S3 bucket: ${csvFileKey}`);
}

export default async function transfer(): Promise<void> {
  const { privateS3Client, publicS3Client } = initializeS3Clients();
  const privateBucketName = getRequiredEnv("PRIVATE_S3_BUCKET_NAME");
  const publicBucketName = getRequiredEnv("INTERNET_REACHABLE_S3_BUCKET_NAME");
  const command = new ListObjectsV2Command({ Bucket: privateBucketName });

  let filesOnS3: ListObjectsV2CommandOutput | undefined;
  try {
    filesOnS3 = await privateS3Client.send(command);
  } catch (error) {
    console.error("Error occurred while listing S3 objects:", error);
    throw error;
  }

  if (!filesOnS3?.Contents?.length) {
    console.log("ℹ️  No file found in private-network S3 bucket");
    return;
  }

  const fileKeys =
    filesOnS3.Contents?.map((file) =>
      file.Key && file.Key.endsWith(".csv") ? file.Key : null,
    ).filter((key): key is string => key !== null) || [];

  if (!fileKeys.length) {
    console.log("ℹ️  No CSV file found in private-network S3 bucket");
    return;
  }

  console.log("📄 CSV files to transfer:", fileKeys);

  let transferCount = 0;
  for (const csvFileKey of fileKeys) {
    console.log(`Transferring file: ${csvFileKey}`);
    await transferCSVFromPrivateToPublic(
      privateS3Client,
      privateBucketName,
      csvFileKey,
      publicS3Client,
      publicBucketName,
    );
    console.log(`✅ File transferred and deleted from source: ${csvFileKey}`);
    transferCount++;
  }

  console.log(
    `✅ Transfer completed: ${transferCount} file(s) moved from private-network S3 to internet-reachable S3`,
  );
}
