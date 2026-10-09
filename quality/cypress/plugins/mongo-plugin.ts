import { execFile } from "child_process";
import { promisify } from "util";

const asyncExecFile = promisify(execFile);

// Mongo is not exposed on the host, queries are run through the container's mongosh.
const MONGO_CONTAINER_NAME = "pc-mongo-1";
const MONGO_DATABASE = "core-fca-low";
const MONGO_USER = "rootAdmin";
const MONGO_PASSWORD = "pass";

interface CountCrossDeviceAuthenticationRequestsArgs {
  email: string;
  status: string;
  createdSince: string;
}

export const countCrossDeviceAuthenticationRequests = async (
  args: CountCrossDeviceAuthenticationRequestsArgs,
): Promise<number> => {
  const filter = JSON.stringify({
    email: args.email,
    status: args.status,
  });
  const script = `
    const filter = ${filter};
    filter.createdAt = { $gte: new Date(${JSON.stringify(args.createdSince)}) };
    print(db.getSiblingDB("${MONGO_DATABASE}").crossDeviceAuthenticationRequest.countDocuments(filter));
  `;

  const { stdout } = await asyncExecFile("docker", [
    "exec",
    MONGO_CONTAINER_NAME,
    "mongosh",
    "--quiet",
    "-u",
    MONGO_USER,
    "-p",
    MONGO_PASSWORD,
    "--authenticationDatabase",
    "admin",
    "--eval",
    script,
  ]);

  return parseInt(stdout.trim(), 10);
};
