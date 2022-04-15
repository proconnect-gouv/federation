### Ternaries nesting

Nesting ternaries operations is forbidden

```typescript
/**
 * 😍 Cool 😍
 */

const isActive = accountState === "active" ? true : false;

const isAdmin = isActive && grade === "admin" ? true : false;

const message = isErrorCodeValid(errorCode)
  ? getUserMessage(errorCode)
  : getDefaultUserMessage();
```

```typescript
/**
 * 😱 Not cool 😱
 */

const isAdmin =
  accountState === "active" ? (grade === "admin" ? true : false) : false;
```
