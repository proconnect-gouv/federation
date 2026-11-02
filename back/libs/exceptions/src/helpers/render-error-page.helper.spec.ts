import { Response } from "express";
import { renderErrorPage } from "./render-error-page.helper";

describe("renderErrorPage", () => {
  const errorPageParams = { exceptionDisplay: {}, error: { code: "code" } };

  it("should resolve with the rendered html", async () => {
    const res = {
      render: jest.fn((_view, _params, callback) => callback(null, "<html>")),
    } as unknown as Response;

    await expect(renderErrorPage(res, errorPageParams)).resolves.toBe("<html>");
    expect(res.render).toHaveBeenCalledWith(
      "error",
      errorPageParams,
      expect.any(Function),
    );
  });

  it("should reject when rendering fails", async () => {
    const error = new Error("render failed");
    const res = {
      render: jest.fn((_view, _params, callback) => callback(error)),
    } as unknown as Response;

    await expect(renderErrorPage(res, errorPageParams)).rejects.toBe(error);
  });
});
