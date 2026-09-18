# Docker Stack PKI

## Certificat de développement local (`app.crt`)

Le certificat wildcard `*.proconnect.127.0.0.1.nip.io` est généré via `mkcert`.

```shell
dks ssl
```

Cette commande :
1. installe la CA locale mkcert dans le store système (`mkcert -install`)
2. génère `app.crt` / `app.key` dans ce dossier
3. copie la CA racine mkcert dans `docker-stack-ca.crt`

Ces fichiers sont ignorés par git (voir `.gitignore`). Ils sont régénérés localement et en CI à chaque `dks up`.

---

Procédure pour générer un certificat signé avec l'autorité de certification local de développement (Docker Stack CA).

> L'exemple ci-dessous a été utilisé pour générer le certificat `mongo.pem`

## Créer un fichier de config openssl

à déposer dans le dossier `./requests/mongo-req.conf`

```ini
[req]
distinguished_name = req_distinguished_name
x509_extensions = req_ext
prompt = no

[req_distinguished_name]
C = FR
ST = IDF
L = Paris
O = FranceConnect
OU = docker-stack
CN = mongo

[req_ext]
keyUsage = digitalSignature, nonRepudiation, keyEncipherment, dataEncipherment
authorityKeyIdentifier = keyid,issuer
extendedKeyUsage = serverAuth
subjectAltName = @alt_names
basicConstraints = CA:FALSE

[alt_names]
DNS.1 = mongo
DNS.2 = mongo-fcp-high
DNS.3 = mongo-fca-low
DNS.4 = mongo-fcp-low
DNS.5 = localhost
IP.1  = 127.0.0.1


```

> Les champs importants à modifier sont `CN` et `alt_names`.

## Générer la CSR (Certificate Signing Request)

```shell
> openssl genpkey -algorithm RSA -out mongo.key
> openssl req -new -key mongo.key -out requests/mongo.csr -config requests/mongo-req.conf
```

## Signer la CSR

`docker-stack-ca.key` n'existe plus dans ce dossier (`dks ssl` ne copie que `rootCA.pem`, jamais la clé). Utilisez la clé de la CA mkcert (`$(mkcert -CAROOT)/rootCA-key.pem`) :

```shell
> openssl x509 -req \
    -in requests/mongo.csr \
    -CA docker-stack-ca.crt \
    -CAkey "$(mkcert -CAROOT)/rootCA-key.pem" \
    -CAcreateserial \
    -out mongo.crt \
    -days 3650 \
    -extfile requests/mongo-req.conf \
    -extensions req_ext
```

## Utilisation des certificats

### Fusionner le certificat et la clé privée

Il est parfois nécessaire d'avoir la clé privée et le certificat dans un même fichier.

Par convention nous les mettrons dans un fichier `pem`.

### Certificat CA et NodeJS

Afin que les requêtes https vers nos mocks soient validées, il faut déclarer la variable `NODE_EXTRA_CA_CERTS`:

```
NODE_EXTRA_CA_CERTS=/etc/ssl/docker_host/docker-stack-ca.crt
```

### Ajouter le certificat CA dans votre navigateur

Vous pouvez ajouter le certificat CA `docker-stack-ca.crt` dans votre navigateur. Ce dernier pourra ainsi valider les certificats.

- Firefox: https://support.mozilla.org/en-US/kb/setting-certificate-authorities-firefox
- Chrome: https://support.globalsign.com/digital-certificates/digital-certificate-installation/install-client-digital-certificate-windows-using-chrome

### Ajouter le certificat CA sur votre système

#### Ubuntu / Debian

```shell
> sudo cp docker-stack-ca.crt /usr/local/share/ca-certificates/
> sudo update-ca-certificates
```

#### Archlinux / Fedora

```shell
> sudo trust anchor --store docker-stack-ca.crt
```
