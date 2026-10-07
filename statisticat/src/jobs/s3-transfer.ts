import {
  ListObjectsV2Command,
  S3Client,
  GetObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";

async function initializeS3Clients(): Promise<{
  privateS3Client: S3Client;
  publicS3Client: S3Client;
}> {
  const privateS3Client = new S3Client({
    endpoint:
      process.env.PRIVATE_S3_ENDPOINT ||
      "https://nuage02.dgfip.finances.rie.gouv.fr:8080",
    region: process.env.PRIVATE_S3_REGION || "us-east-1",
    credentials: {
      accessKeyId: process.env.PRIVATE_S3_ACCESS_KEY_ID || "",
      secretAccessKey: process.env.PRIVATE_S3_SECRET_ACCESS_KEY || "",
    },
  });

  const publicS3Client = new S3Client({
    endpoint:
      process.env.PUBLIC_S3_ENDPOINT ||
      "https://oos.cloudgouv-eu-west-1.outscale.com",
    region: process.env.PUBLIC_S3_REGION || "cloudgouv-eu-west-1",
    credentials: {
      accessKeyId: process.env.PUBLIC_S3_ACCESS_KEY_ID || "",
      secretAccessKey: process.env.PUBLIC_S3_SECRET_ACCESS_KEY || "",
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

async function transfer(): Promise<any> {
  const { privateS3Client, publicS3Client } = await initializeS3Clients();

  // Step 1: List CSV files available in the private-network S3 bucket
  const s3PrivateParams = {
    Bucket:
      process.env.PRIVATE_S3_BUCKET_NAME || "proconnect-preprod-statistiques",
  };
  const command = new ListObjectsV2Command(s3PrivateParams);

  let filesOnS3: any;

  try {
    filesOnS3 = await privateS3Client.send(command);
  } catch (error) {
    console.error("Error occurred while listing S3 objects:", error);
  }

  if (!filesOnS3?.Contents?.length) {
    console.log("ℹ️  No CSV file found in private-network S3 bucket");
    return;
  }

  // Step 2: Transfer the CSV file from private-network S3 to internet-reachable S3
  const fileKeys =
    filesOnS3.Contents?.map((file) =>
      file.Key && file.Key.endsWith(".csv") ? file.Key : null,
    ).filter(Boolean) || [];
  console.log("📄 CSV files to transfer:", fileKeys);

  let transferCount = 0;
  for (const csvFileKey of fileKeys) {
    console.log(`Transferring file: ${csvFileKey}`);

    await transferCSVFromPrivateToPublic(
      privateS3Client,
      s3PrivateParams.Bucket,
      csvFileKey,
      publicS3Client,
      process.env.PUBLIC_S3_BUCKET_NAME || "proconnect-statistiques-preprod",
    );

    console.log(`✅ File transferred and deleted from source: ${csvFileKey}`);
    transferCount++;
  }

  console.log(
    `✅ Transfer completed: ${transferCount} file(s) moved from private-network S3 to internet-reachable S3`,
  );
}

transfer();
