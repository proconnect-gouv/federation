export function getStackTraceArray(exception: any) {
  const { stack = '' } = exception;
  let stackTrace = stack.split('\n');

  if (exception.originalError) {
    const originalStack = exception.originalError.stack || '';
    stackTrace = originalStack.split('\n').concat(stackTrace);
  }

  // Remove empty element if any
  stackTrace = stackTrace.filter(Boolean);

  return stackTrace;
}
