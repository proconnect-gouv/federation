/**
 * Log data in native console to help debugging
 * @param {unknow[]} messages elements to display in the console
 */
export const log = (...messages: unknown[]): null => {
  console.log("[console]: ", ...messages);

  return null;
};

export const table = (tabularData: unknown[]): null => {
  console.table(tabularData);
  return null;
};
