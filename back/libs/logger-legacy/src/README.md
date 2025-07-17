# Logger Legacy

## Description

A file-based logging service using [Pino](https://github.com/pinojs/pino) for structured JSON logging of business events.

## Configuration

Configure the log file path in your application's configuration:

```typescript
{
  LoggerLegacy: {
    path: '/path/to/your/logfile.log'
  }
}
```

## Usage

Inject the `LoggerService` and use the `businessEvent()` method to log business events:

```typescript
// Log a business event
this.logger.businessEvent({
  category: 'user',
  event: 'login',
  ip: '192.168.1.1',
  source: networkContext
});
```

Each log entry is automatically assigned a UUID and formatted as JSON.
