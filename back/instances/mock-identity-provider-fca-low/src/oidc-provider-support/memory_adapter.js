// Source : https://github.com/panva/node-oidc-provider/blob/357ced3924b71819be144f184861a8c78c27fde6/lib/adapters/memory_adapter.js
import QuickLRU from 'quick-lru';

let storage = new QuickLRU({ maxSize: 1000 });

function grantKeyFor(id) {
  return `grant:${id}`;
}

function sessionUidKeyFor(id) {
  return `sessionUid:${id}`;
}

function userCodeKeyFor(userCode) {
  return `userCode:${userCode}`;
}

const grantable = new Set([
  'AccessToken',
  'AuthorizationCode',
  'RefreshToken',
  'DeviceCode',
  'BackchannelAuthenticationRequest',
]);

class MemoryAdapter {
  constructor(model) {
    this.model = model;
  }

  key(id) {
    return `${this.model}:${id}`;
  }

  async destroy(id) {
    const key = this.key(id);
    storage.delete(key);
  }

  async consume(id) {
    storage.get(this.key(id)).consumed = Math.floor(Date.now() / 1000);
  }

  async find(id) {
    return storage.get(this.key(id));
  }

  async findByUid(uid) {
    const id = storage.get(sessionUidKeyFor(uid));
    return this.find(id);
  }

  async findByUserCode(userCode) {
    const id = storage.get(userCodeKeyFor(userCode));
    return this.find(id);
  }

  async upsert(id, payload, expiresIn) {
    const key = this.key(id);

    if (this.model === 'Session') {
      storage.set(sessionUidKeyFor(payload.uid), id, expiresIn * 1000);
    }

    const { grantId, userCode } = payload;
    if (grantable.has(this.model) && grantId) {
      const grantKey = grantKeyFor(grantId);
      const grant = storage.get(grantKey);
      if (!grant) {
        storage.set(grantKey, [key]);
      } else {
        grant.push(key);
      }
    }

    if (userCode) {
      storage.set(userCodeKeyFor(userCode), id, expiresIn * 1000);
    }

    storage.set(key, payload, expiresIn * 1000);
  }

  async revokeByGrantId(grantId) { // eslint-disable-line class-methods-use-this
    const grantKey = grantKeyFor(grantId);
    const grant = storage.get(grantKey);
    if (grant) {
      grant.forEach((token) => storage.delete(token));
      storage.delete(grantKey);
    }
  }
}

export default MemoryAdapter;
