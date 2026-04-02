import { getCauseChain } from "./cause.helper";

describe("getCauseChain", () => {
  it("should return empty array when no cause", () => {
    const error = new Error("test");
    expect(getCauseChain(error)).toEqual([]);
  });

  it("should return single cause", () => {
    const cause = new TypeError("root cause");
    const error = new Error("test", { cause });
    expect(getCauseChain(error)).toEqual([
      {
        message: "root cause",
        stack: cause.stack?.split("\n"),
        type: "TypeError",
      },
    ]);
  });

  it("should return nested causes recursively", () => {
    const root = new RangeError("deep");
    const mid = new TypeError("middle", { cause: root });
    const error = new Error("top", { cause: mid });
    expect(getCauseChain(error)).toEqual([
      { message: "middle", stack: mid.stack?.split("\n"), type: "TypeError" },
      { message: "deep", stack: root.stack?.split("\n"), type: "RangeError" },
    ]);
  });

  it("should stop when cause is not an Error", () => {
    const error = new Error("test", { cause: "string cause" });
    expect(getCauseChain(error)).toEqual([]);
  });
});
