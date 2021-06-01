/**
 * Proxy configuration middleware
 *
 * @see https://create-react-app.dev/docs/proxying-api-requests-in-development/#configuring-the-proxy-manually
 *
 * This proxy configuration middleware allows us to redirect traffic for developpement.
 *
 * It MUST be configured in two ways:
 *
 * @param {string} API_PROXY_HOST the full address to proxy calls to
 *  ie. `https://my-backend.lan:3000`
 *
 * @param {string} API_PROXY_FOR_PATH the path for wich the proxy is applied
 *  ie. `/api`
 */
const { createProxyMiddleware } = require('http-proxy-middleware');

const API_PROXY_HOST = process.env.API_PROXY_HOST;
const API_PROXY_FOR_PATH = process.env.API_PROXY_FOR_PATH;

module.exports = function (app) {
  app.use(
    API_PROXY_FOR_PATH,
    createProxyMiddleware({
      target: API_PROXY_HOST,
      changeOrigin: true,
    })
  );
};
