# Tracking

## Description

An application-level tracking service for business events. It builds a normalized log entry from the provided context and session data, then forwards it to the Logger Legacy service as structured JSON.

## Configuration

No specific configuration is required for this library. Ensure Logger Legacy is configured in your application:

```typescript
{
  LoggerLegacy: {
    path: '/path/to/your/logfile.log'
  }
}
```

## Usage

Inject the `TrackingService` and call `track()` with a `TrackedEvent` and its context:

```typescript
import { TrackingService } from '@fc/tracking';
import { TrackedEvent } from '@fc/tracking/enums';

// Track an event
await this.tracking.track(TrackedEvent.FC_AUTHORIZE_INITIATED, { req });
```

Notes:
- Session information is extracted from the request (or via the sessionId) with the sessionService.
- Network information (IP) is extracted from `headers`.
