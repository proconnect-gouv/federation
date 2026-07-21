import { exec } from "child_process";
import { promisify } from "util";

const asyncExec = promisify(exec);

// Path to script
const EXEC_TOOL_PATH = "./scripts/parse-business-log.ts";
const GET_BUSINESS_LOG_SCRIPT_PATH = "./scripts/get-business-logs.ts";

// Business events are read from the container stdout (docker logs).
// The marker is moved forward by clearBusinessLog so each scenario
// only sees the events emitted after its own start.
let logsSince = new Date().toISOString();

const dockerLogsCommand = (containerName: string): string =>
  `docker logs '${containerName}' --since '${logsSince}' 2>&1`;

export const clearBusinessLog = async (): Promise<number> => {
  logsSince = new Date().toISOString();
  return 0;
};

interface hasBusinessLogArgs {
  event: Record<string, unknown>;
  containerName: string;
}

export const hasBusinessLog = async (
  args: hasBusinessLogArgs,
): Promise<number> => {
  const { event, containerName } = args;
  const stringifiedEvent = JSON.stringify(event);
  const command = `${dockerLogsCommand(containerName)} | tsx ${EXEC_TOOL_PATH} /dev/stdin '${stringifiedEvent}'`;

  let exitCode = 0;
  try {
    await asyncExec(command);
  } catch (err) {
    exitCode = Number((err as NodeJS.ErrnoException).code);
  }
  return exitCode;
};

export const getBusinessLogs = async (
  args: hasBusinessLogArgs,
): Promise<Record<string, string>> => {
  const { event, containerName } = args;
  const stringifiedEvent = JSON.stringify(event);
  const command = `${dockerLogsCommand(containerName)} | tsx ${GET_BUSINESS_LOG_SCRIPT_PATH} /dev/stdin '${stringifiedEvent}'`;

  const { stdout } = await asyncExec(command);

  return JSON.parse(stdout);
};
