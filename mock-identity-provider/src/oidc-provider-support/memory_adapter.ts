// Source : https://github.com/panva/node-oidc-provider/blob/6fffbe1ae42335b8683806352cfca2d5a870f006/lib/adapters/memory_adapter.js (v8.8.0)
import type { Adapter, AdapterPayload } from "oidc-provider";
import QuickLRU from "quick-lru";

const storage = new QuickLRU<string, AdapterPayload | string | string[]>({
  maxSize: 1000,
});

function grantKeyFor(id: string): string {
  return `grant:${id}`;
}

function sessionUidKeyFor(id: string): string {
  return `sessionUid:${id}`;
}

function userCodeKeyFor(userCode: string): string {
  return `userCode:${userCode}`;
}

const grantable = new Set([
  "AccessToken",
  "AuthorizationCode",
  "RefreshToken",
  "DeviceCode",
  "BackchannelAuthenticationRequest",
]);

class MemoryAdapter implements Adapter {
  model: string;

  constructor(model: string) {
    this.model = model;
  }

  key(id: string): string {
    return `${this.model}:${id}`;
  }

  async destroy(id: string): Promise<void> {
    const key = this.key(id);
    storage.delete(key);
  }

  async consume(id: string): Promise<void> {
    (storage.get(this.key(id)) as AdapterPayload).consumed = Math.floor(
      Date.now() / 1000,
    );
  }

  async find(id: string): Promise<AdapterPayload | undefined> {
    return storage.get(this.key(id)) as AdapterPayload | undefined;
  }

  async findByUid(uid: string): Promise<AdapterPayload | undefined> {
    const id = storage.get(sessionUidKeyFor(uid)) as string;
    return this.find(id);
  }

  async findByUserCode(userCode: string): Promise<AdapterPayload | undefined> {
    const id = storage.get(userCodeKeyFor(userCode)) as string;
    return this.find(id);
  }

  async upsert(
    id: string,
    payload: AdapterPayload,
    expiresIn: number,
  ): Promise<void> {
    const key = this.key(id);

    if (this.model === "Session") {
      storage.set(sessionUidKeyFor(payload.uid!), id, {
        maxAge: expiresIn * 1000,
      });
    }

    const { grantId, userCode } = payload;
    if (grantable.has(this.model) && grantId) {
      const grantKey = grantKeyFor(grantId);
      const grant = storage.get(grantKey) as string[] | undefined;
      if (!grant) {
        storage.set(grantKey, [key]);
      } else {
        grant.push(key);
      }
    }

    if (userCode) {
      storage.set(userCodeKeyFor(userCode), id, { maxAge: expiresIn * 1000 });
    }

    storage.set(key, payload, { maxAge: expiresIn * 1000 });
  }

  async revokeByGrantId(grantId: string): Promise<void> {
    const grantKey = grantKeyFor(grantId);
    const grant = storage.get(grantKey) as string[] | undefined;
    if (grant) {
      grant.forEach((token) => storage.delete(token));
      storage.delete(grantKey);
    }
  }
}

export default MemoryAdapter;
