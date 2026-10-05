import transfer from "./s3-transfer-job.js";

transfer().catch((error: unknown) => {
  console.error("Transfer failed:", error);
  process.exitCode = 1;
});
