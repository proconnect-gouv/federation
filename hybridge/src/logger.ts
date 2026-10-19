import { pino } from "pino";

export const logger = pino({
  formatters: {
    level: (level, levelNumber) => ({ level, levelNumber }),
  },
});
