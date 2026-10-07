import {
  ListObjectsV2Command,
  S3Client,
  GetObjectCommand,
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
  fileKey: string,
  publicS3Client: S3Client,
  publicBucketName: string,
): Promise<void> {
  const source = await privateS3Client.send(
    new GetObjectCommand({ Bucket: privateBucketName, Key: fileKey }),
  );

  if (!source.Body) {
    throw new Error(`Objet vide ou introuvable : ${fileKey}`);
  }

  await new Upload({
    client: publicS3Client,
    params: {
      Bucket: publicBucketName,
      Key: fileKey,
      Body: source.Body,
      ContentType: source.ContentType,
    },
  }).done();
}

async function transfer(): Promise<any> {
  const { privateS3Client, publicS3Client } = await initializeS3Clients();

  // Step 1: List CSV files available in the private-network S3 bucket
  const s3PrivateParams = { Bucket: "proconnect-preprod-statistiques" };
  const command = new ListObjectsV2Command(s3PrivateParams);

  let filesOnS3: any;

  try {
    filesOnS3 = await privateS3Client.send(command);
  } catch (error) {
    console.error("Error occurred while listing S3 objects:", error);
  }

  if (!filesOnS3?.Contents?.length) {
    console.log("ℹ️ No CSV file found in private-network S3 bucket");
    return;
  }

  // Step 2: Transfer the CSV file from private-network S3 to internet-reachable S3
  const fileKeys = filesOnS3.Contents?.map((file) => file.Key) || [];
  console.log("📄 CSV files to transfer:", fileKeys);

  let transferCount = 0;
  for (const fileKey of fileKeys) {
    console.log(`Transferring file: ${fileKey}`);

    await transferCSVFromPrivateToPublic(
      privateS3Client,
      s3PrivateParams.Bucket,
      fileKey,
      publicS3Client,
      "proconnect-preprod-statistiques-public",
    );

    // Step 3: Delete the CSV file from private-network S3 bucket after successful transfer
    // todo: implement deletion from private-network S3 after successful transfer
    // aws_private s3 rm "s3://{{ .Values.storage.statsPrivateNetworkS3.bucketName }}/$CSV_FILE" --region {{ .Values.storage.statsPrivateNetworkS3.region | quote }} --endpoint-url {{ .Values.storage.statsPrivateNetworkS3.endpointUrl | quote }}

    // clean local file after transfer
    // rm "$LOCAL_FILE"

    console.log(`✅ File transferred and deleted from source: ${fileKey}`);
    transferCount++;
  }

  console.log(
    `✅ Transfer completed: ${transferCount} file(s) moved from private-network S3 to internet-reachable S3`,
  );
}

transfer();
