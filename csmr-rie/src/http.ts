import type { RequestListener } from "node:http";

export function createRoutes({
  isConnected,
}: {
  isConnected: () => boolean;
}): RequestListener {
  return (req, res) => {
    const url = URL.parse(req.url ?? "/", "http://_");
    const reply = (status: number, body: string) =>
      res.writeHead(status, { "Content-Type": "text/plain" }).end(body);

    if (req.method !== "GET" || !url) return reply(404, "Not Found");
    const verbose = url.searchParams.has("verbose");
    if (url.pathname === "/livez") return reply(200, "ok");
    if (url.pathname !== "/readyz") return reply(404, "Not Found");
    if (isConnected())
      return reply(200, verbose ? "[+]broker ok\nreadyz check passed" : "ok");
    return reply(
      503,
      verbose
        ? "[-]broker failed (disconnected)\nreadyz check failed"
        : "error",
    );
  };
}
