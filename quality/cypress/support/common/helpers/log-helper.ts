export enum LogResult {
  EventFound,
  UnexpectedError,
  Unknown,
  EventNotFound,
  EventMismatch,
}

export function clearBusinessLog(): void {
  cy.task("clearBusinessLog").should("eq", 0);
}

export function hasBusinessLog(
  event: Record<string, unknown>,
  result: LogResult = LogResult.EventFound,
  container?: string,
): void {
  const containerName: string = container || Cypress.env("LOG_CONTAINER_NAME");
  cy.task<number>("hasBusinessLog", { containerName, event }).then(
    (exitCode) => {
      const text = result === LogResult.EventFound ? "be" : "not be";
      expect(
        exitCode,
        `${JSON.stringify(event)} should ${text} present in the business log`,
      ).to.eq(result);
    },
  );
}

export function getBusinessLogs(
  event: Record<string, unknown>,
  container?: string,
): Cypress.Chainable<Record<string, string>[]> {
  const containerName: string = container || Cypress.env("LOG_CONTAINER_NAME");
  return cy.task<Record<string, string>[]>("getBusinessLogs", {
    containerName,
    event,
  });
}

export function getValueByKeyFromFirstEvent(
  key: string,
  logs: Record<string, string>[],
): string {
  expect(logs?.length).to.be.ok;
  const [firstEvent] = logs;
  const value = firstEvent[key];
  return value;
}
