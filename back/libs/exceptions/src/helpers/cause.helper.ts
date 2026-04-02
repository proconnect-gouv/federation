export function getCauseChain(exception: Error): object[] {
  const causes: object[] = [];
  let current = exception.cause;

  while (current instanceof Error) {
    causes.push({
      message: current.message,
      stack: current.stack?.split("\n"),
      type: current.constructor.name,
    });
    current = current.cause;
  }

  return causes;
}
