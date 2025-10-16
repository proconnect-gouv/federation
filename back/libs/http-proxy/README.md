# Proxy

Ce module force l'utilisation ou non de paramètres proxy sur les requêtes HTTP et HTTPS

Ce module repose sur la librairie [global-agent](https://www.npmjs.com/package/global-agent) et [axios](https://www.npmjs.com/package/axios)

Des proxies séparés peuvent être configurés pour HTTP et HTTPS.

### Configuration des paramètres Proxy

Les paramètres proxy sont réglés automatiquement par les variables d'env suivant :

**GLOBAL_AGENT_HTTP_PROXY**=http://theProxyHost:port

**GLOBAL_AGENT_HTTPS_PROXY**=https://theProxyHost:port
