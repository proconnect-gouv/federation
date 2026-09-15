import { Response } from "express";
import { ErrorPageParams } from "../types/error-page-params";

// Express 5 always renders views asynchronously, so res.render() without a
// callback no longer returns the HTML synchronously. Koa (oidc-provider) needs
// the HTML as ctx.body, so we wait for it here.
export function renderErrorPage(
  res: Response,
  errorPageParams: ErrorPageParams,
): Promise<string> {
  return new Promise((resolve, reject) => {
    res.render("error", errorPageParams, (err: Error | null, html: string) => {
      if (err) {
        return reject(err);
      }
      resolve(html);
    });
  });
}
