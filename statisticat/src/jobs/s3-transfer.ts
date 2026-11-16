import transfer from "./s3-transfer-job.ts";

transfer().catch((error: unknown) => {
  console.error("Transfer failed:", error);
  process.exitCode = 1;
});
