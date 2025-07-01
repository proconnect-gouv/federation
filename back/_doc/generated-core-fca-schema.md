# Core-FCA Libraries Architecture Schema

## Overview
This document contains multiple focused diagrams showing the libraries and their relationships used in the core-fca application, which is the main federation service for FranceConnect.

## 1. Core-FCA Application Structure

```mermaid
graph TB
    subgraph "Core-FCA Application"
        CFCA[CoreFcaModule]
        CORE_SERVICE[CoreFcaService]
        MIDDLEWARE_SERVICE[CoreFcaMiddlewareService]
        FQDN_SERVICE[CoreFcaFqdnService]
        TRACKING_SERVICE[CoreFcaTrackingService]
        DATA_PROVIDER_SERVICE[DataProviderService]
        IDENTITY_SANITIZER[IdentitySanitizer]
        OIDC_CONFIG_SERVICE[OidcProviderConfigAppService]
        INTERACTION_CTRL[InteractionController]
        OIDC_CLIENT_CTRL[OidcClientController]
        OIDC_PROVIDER_CTRL[OidcProviderController]
        DATA_PROVIDER_CTRL[DataProviderController]
    end

    CFCA --> CORE_SERVICE
    CFCA --> MIDDLEWARE_SERVICE
    CFCA --> FQDN_SERVICE
    CFCA --> TRACKING_SERVICE
    CFCA --> DATA_PROVIDER_SERVICE
    CFCA --> IDENTITY_SANITIZER
    CFCA --> OIDC_CONFIG_SERVICE
    CFCA --> INTERACTION_CTRL
    CFCA --> OIDC_CLIENT_CTRL
    CFCA --> OIDC_PROVIDER_CTRL
    CFCA --> DATA_PROVIDER_CTRL

    classDef coreFca fill:#e1f5fe,stroke:#01579b,stroke-width:2px
    class CFCA,CORE_SERVICE,MIDDLEWARE_SERVICE,FQDN_SERVICE,TRACKING_SERVICE,DATA_PROVIDER_SERVICE,IDENTITY_SANITIZER,OIDC_CONFIG_SERVICE,INTERACTION_CTRL,OIDC_CLIENT_CTRL,OIDC_PROVIDER_CTRL,DATA_PROVIDER_CTRL coreFca
```

## 2. Core Libraries Dependencies

```mermaid
graph TB
    subgraph "Core-FCA Application"
        CFCA[CoreFcaModule]
    end

    subgraph "Core Libraries"
        CORE[CoreModule]
        CONFIG[ConfigModule]
        LOGGER[LoggerModule]
        COMMON[CommonModule]
        EXCEPTIONS[ExceptionsModule]
        APP[AppModule]
    end

    CFCA --> CORE
    CFCA --> CONFIG
    CFCA --> LOGGER
    CFCA --> COMMON
    CFCA --> EXCEPTIONS
    CFCA --> APP

    classDef coreFca fill:#e1f5fe,stroke:#01579b,stroke-width:2px
    classDef coreLib fill:#f3e5f5,stroke:#4a148c,stroke-width:2px

    class CFCA coreFca
    class CORE,CONFIG,LOGGER,COMMON,EXCEPTIONS,APP coreLib
```

## 3. Authentication & Authorization Libraries

```mermaid
graph TB
    subgraph "Core-FCA Application"
        CFCA[CoreFcaModule]
    end

    subgraph "Authentication & Authorization"
        OIDC_PROVIDER[OidcProviderModule]
        OIDC_CLIENT[OidcClientModule]
        OIDC_ACR[OidcAcrModule]
        JWT[JwtModule]
        CSRF[CsrfModule]
        SESSION[SessionModule]
    end

    CFCA --> OIDC_PROVIDER
    CFCA --> OIDC_CLIENT
    CFCA --> OIDC_ACR
    CFCA --> JWT
    CFCA --> CSRF
    CFCA --> SESSION

    %% Internal dependencies
    OIDC_PROVIDER --> SESSION
    OIDC_PROVIDER --> OIDC_ACR
    OIDC_CLIENT --> SESSION

    classDef coreFca fill:#e1f5fe,stroke:#01579b,stroke-width:2px
    classDef authLib fill:#e8f5e8,stroke:#1b5e20,stroke-width:2px

    class CFCA coreFca
    class OIDC_PROVIDER,OIDC_CLIENT,OIDC_ACR,JWT,CSRF,SESSION authLib
```

## 4. Data Layer Libraries

```mermaid
graph TB
    subgraph "Core-FCA Application"
        CFCA[CoreFcaModule]
    end

    subgraph "Data Layer"
        MONGOOSE[MongooseModule]
        ACCOUNT[AccountModule]
        ACCOUNT_FCA[AccountFcaModule]
        IDP_ADAPTER_MONGO[IdentityProviderAdapterMongoModule]
        SP_ADAPTER_MONGO[ServiceProviderAdapterMongoModule]
        FQDN_TO_IDP[FqdnToIdpAdapterMongoModule]
        DATA_PROVIDER_ADAPTER[DataProviderAdapterMongoModule]
    end

    CFCA --> MONGOOSE
    CFCA --> ACCOUNT
    CFCA --> ACCOUNT_FCA
    CFCA --> IDP_ADAPTER_MONGO
    CFCA --> SP_ADAPTER_MONGO
    CFCA --> FQDN_TO_IDP
    CFCA --> DATA_PROVIDER_ADAPTER

    %% Internal dependencies
    IDP_ADAPTER_MONGO --> MONGOOSE
    SP_ADAPTER_MONGO --> MONGOOSE
    FQDN_TO_IDP --> MONGOOSE
    DATA_PROVIDER_ADAPTER --> MONGOOSE
    ACCOUNT --> MONGOOSE
    ACCOUNT_FCA --> MONGOOSE

    classDef coreFca fill:#e1f5fe,stroke:#01579b,stroke-width:2px
    classDef dataLib fill:#fff3e0,stroke:#e65100,stroke-width:2px

    class CFCA coreFca
    class MONGOOSE,ACCOUNT,ACCOUNT_FCA,IDP_ADAPTER_MONGO,SP_ADAPTER_MONGO,FQDN_TO_IDP,DATA_PROVIDER_ADAPTER dataLib
```

## 5. Infrastructure Libraries

```mermaid
graph TB
    subgraph "Core-FCA Application"
        CFCA[CoreFcaModule]
    end

    subgraph "Infrastructure"
        REDIS[RedisModule]
        CRYPTOGRAPHY[CryptographyModule]
        ASYNC_LOCAL_STORAGE[AsyncLocalStorageModule]
        HTTP_PROXY[HttpProxyModule]
        NOTIFICATIONS[NotificationsModule]
        VIEW_TEMPLATES[ViewTemplatesModule]
    end

    CFCA --> REDIS
    CFCA --> CRYPTOGRAPHY
    CFCA --> ASYNC_LOCAL_STORAGE
    CFCA --> HTTP_PROXY
    CFCA --> NOTIFICATIONS
    CFCA --> VIEW_TEMPLATES

    %% Internal dependencies
    SESSION --> REDIS
    SESSION --> CRYPTOGRAPHY
    SESSION --> ASYNC_LOCAL_STORAGE
    OIDC_PROVIDER --> REDIS

    classDef coreFca fill:#e1f5fe,stroke:#01579b,stroke-width:2px
    classDef infraLib fill:#fce4ec,stroke:#880e4f,stroke-width:2px

    class CFCA coreFca
    class REDIS,CRYPTOGRAPHY,ASYNC_LOCAL_STORAGE,HTTP_PROXY,NOTIFICATIONS,VIEW_TEMPLATES infraLib
```

## 6. Business Logic Libraries

```mermaid
graph TB
    subgraph "Core-FCA Application"
        CFCA[CoreFcaModule]
    end

    subgraph "Business Logic"
        FLOW_STEPS[FlowStepsModule]
        EMAIL_VALIDATOR[EmailValidatorModule]
        TRACKING[TrackingModule]
        TRACKING_CONTEXT[TrackingContextModule]
    end

    CFCA --> FLOW_STEPS
    CFCA --> EMAIL_VALIDATOR
    CFCA --> TRACKING
    CFCA --> TRACKING_CONTEXT

    classDef coreFca fill:#e1f5fe,stroke:#01579b,stroke-width:2px
    classDef businessLib fill:#e0f2f1,stroke:#004d40,stroke-width:2px

    class CFCA coreFca
    class FLOW_STEPS,EMAIL_VALIDATOR,TRACKING,TRACKING_CONTEXT businessLib
```

## 7. NestJS Framework Dependencies

```mermaid
graph TB
    subgraph "Core-FCA Application"
        CFCA[CoreFcaModule]
    end

    subgraph "NestJS Framework"
        NESTJS_COMMON["@nestjs/common"]
        NESTJS_CORE["@nestjs/core"]
        NESTJS_CQRS["@nestjs/cqrs"]
        NESTJS_MICROSERVICES["@nestjs/microservices"]
        NESTJS_MONGOOSE["@nestjs/mongoose"]
        NESTJS_PLATFORM_EXPRESS["@nestjs/platform-express"]
        NESTJS_AXIOS["@nestjs/axios"]
        NESTJS_TESTING["@nestjs/testing"]
    end

    CFCA --> NESTJS_COMMON
    CFCA --> NESTJS_CORE
    CFCA --> NESTJS_CQRS
    CFCA --> NESTJS_MICROSERVICES
    CFCA --> NESTJS_MONGOOSE
    CFCA --> NESTJS_PLATFORM_EXPRESS
    CFCA --> NESTJS_AXIOS
    CFCA --> NESTJS_TESTING

    classDef coreFca fill:#e1f5fe,stroke:#01579b,stroke-width:2px
    classDef nestjs fill:#f1f8e9,stroke:#33691e,stroke-width:2px

    class CFCA coreFca
    class NESTJS_COMMON,NESTJS_CORE,NESTJS_CQRS,NESTJS_MICROSERVICES,NESTJS_MONGOOSE,NESTJS_PLATFORM_EXPRESS,NESTJS_AXIOS,NESTJS_TESTING nestjs
```

## 8. Key Third-party Libraries

```mermaid
graph TB
    subgraph "Core-FCA Application"
        CFCA[CoreFcaModule]
    end

    subgraph "Key Third-party Libraries"
        EXPRESS[express]
        EXPRESS_SESSION[express-session]
        COOKIE_PARSER[cookie-parser]
        BODY_PARSER[body-parser]
        HELMET[helmet]
        OIDC_PROVIDER_LIB[oidc-provider]
        OPENID_CLIENT[openid-client]
        JOSE[jose]
        JOSE_OPENID_CLIENT[jose-openid-client]
        MONGOOSE_LIB[mongoose]
        IOREDIS[ioredis]
        PINO[pino]
        LODASH[lodash]
        UUID[uuid]
        AXIOS[axios]
        RXJS[rxjs]
        CLASS_VALIDATOR[class-validator]
        CLASS_TRANSFORMER[class-transformer]
    end

    CFCA --> EXPRESS
    CFCA --> EXPRESS_SESSION
    CFCA --> COOKIE_PARSER
    CFCA --> BODY_PARSER
    CFCA --> HELMET
    CFCA --> OIDC_PROVIDER_LIB
    CFCA --> OPENID_CLIENT
    CFCA --> JOSE
    CFCA --> JOSE_OPENID_CLIENT
    CFCA --> MONGOOSE_LIB
    CFCA --> IOREDIS
    CFCA --> PINO
    CFCA --> LODASH
    CFCA --> UUID
    CFCA --> AXIOS
    CFCA --> RXJS
    CFCA --> CLASS_VALIDATOR
    CFCA --> CLASS_TRANSFORMER

    %% Internal dependencies
    JWT --> AXIOS
    JWT --> JOSE

    classDef coreFca fill:#e1f5fe,stroke:#01579b,stroke-width:2px
    classDef thirdParty fill:#fafafa,stroke:#424242,stroke-width:1px

    class CFCA coreFca
    class EXPRESS,EXPRESS_SESSION,COOKIE_PARSER,BODY_PARSER,HELMET,OIDC_PROVIDER_LIB,OPENID_CLIENT,JOSE,JOSE_OPENID_CLIENT,MONGOOSE_LIB,IOREDIS,PINO,LODASH,UUID,AXIOS,RXJS,CLASS_VALIDATOR,CLASS_TRANSFORMER thirdParty
```

## 9. Data Flow Architecture

```mermaid
graph LR
    subgraph "HTTP Layer"
        REQUEST[HTTP Request]
        RESPONSE[HTTP Response]
    end

    subgraph "Controller Layer"
        INTERACTION_CTRL[InteractionController]
        OIDC_CLIENT_CTRL[OidcClientController]
        OIDC_PROVIDER_CTRL[OidcProviderController]
        DATA_PROVIDER_CTRL[DataProviderController]
    end

    subgraph "Service Layer"
        CORE_SERVICE[CoreFcaService]
        DATA_PROVIDER_SERVICE[DataProviderService]
        FQDN_SERVICE[CoreFcaFqdnService]
    end

    subgraph "Data Layer"
        SESSION[SessionModule]
        REDIS[RedisModule]
        MONGOOSE[MongooseModule]
    end

    REQUEST --> INTERACTION_CTRL
    REQUEST --> OIDC_CLIENT_CTRL
    REQUEST --> OIDC_PROVIDER_CTRL
    REQUEST --> DATA_PROVIDER_CTRL

    INTERACTION_CTRL --> CORE_SERVICE
    OIDC_CLIENT_CTRL --> CORE_SERVICE
    OIDC_PROVIDER_CTRL --> CORE_SERVICE
    DATA_PROVIDER_CTRL --> DATA_PROVIDER_SERVICE

    CORE_SERVICE --> SESSION
    CORE_SERVICE --> FQDN_SERVICE
    DATA_PROVIDER_SERVICE --> SESSION

    SESSION --> REDIS
    FQDN_SERVICE --> MONGOOSE
    DATA_PROVIDER_SERVICE --> MONGOOSE

    CORE_SERVICE --> RESPONSE
    DATA_PROVIDER_SERVICE --> RESPONSE

    classDef http fill:#e3f2fd,stroke:#1565c0,stroke-width:2px
    classDef controller fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px
    classDef service fill:#e8f5e8,stroke:#388e3c,stroke-width:2px
    classDef data fill:#fff3e0,stroke:#f57c00,stroke-width:2px

    class REQUEST,RESPONSE http
    class INTERACTION_CTRL,OIDC_CLIENT_CTRL,OIDC_PROVIDER_CTRL,DATA_PROVIDER_CTRL controller
    class CORE_SERVICE,DATA_PROVIDER_SERVICE,FQDN_SERVICE service
    class SESSION,REDIS,MONGOOSE data
```

## 10. Authentication Flow

```mermaid
sequenceDiagram
    participant User
    participant CoreFCA as Core-FCA
    participant OIDCProvider as OIDC Provider
    participant OIDCClient as OIDC Client
    participant IDP as Identity Provider
    participant Session as Session Module
    participant Redis as Redis

    User->>CoreFCA: Access protected resource
    CoreFCA->>Session: Check session
    Session->>Redis: Get session data
    
    alt Session valid
        CoreFCA->>User: Return resource
    else Session invalid
        CoreFCA->>OIDCProvider: Start authentication
        OIDCProvider->>OIDCClient: Create authorization request
        OIDCClient->>IDP: Redirect to IDP
        IDP->>User: Show login form
        User->>IDP: Provide credentials
        IDP->>OIDCClient: Return authorization code
        OIDCClient->>OIDCProvider: Exchange code for tokens
        OIDCProvider->>Session: Store user session
        Session->>Redis: Persist session
        CoreFCA->>User: Redirect to original resource
    end
```

## Key Components Description

### Core-FCA Application
- **CoreFcaModule**: Main application module that orchestrates all services
- **Services**: Business logic services for federation operations
- **Controllers**: HTTP endpoints for OIDC interactions

### Core Libraries
- **CoreModule**: Core federation functionality
- **ConfigModule**: Configuration management
- **LoggerModule**: Logging services
- **CommonModule**: Shared utilities and helpers
- **ExceptionsModule**: Exception handling
- **AppModule**: Application-level configuration

### Authentication & Authorization
- **OidcProviderModule**: OIDC provider implementation
- **OidcClientModule**: OIDC client functionality
- **OidcAcrModule**: Authentication Context Class Reference
- **JwtModule**: JWT token handling
- **CsrfModule**: CSRF protection
- **SessionModule**: Session management

### Data Layer
- **MongooseModule**: MongoDB connection and schemas
- **AccountModule**: User account management
- **AccountFcaModule**: FranceConnect specific account features
- **IdentityProviderAdapterMongoModule**: IDP data adapter
- **ServiceProviderAdapterMongoModule**: SP data adapter
- **FqdnToIdpAdapterMongoModule**: FQDN to IDP mapping
- **DataProviderAdapterMongoModule**: Data provider adapter

### Infrastructure
- **RedisModule**: Redis caching and session storage
- **CryptographyModule**: Cryptographic operations
- **AsyncLocalStorageModule**: Async context storage
- **HttpProxyModule**: HTTP proxy functionality
- **NotificationsModule**: Notification services
- **ViewTemplatesModule**: Template rendering

### Business Logic
- **FlowStepsModule**: Step-by-step flow management
- **EmailValidatorModule**: Email validation
- **TrackingModule**: User tracking and analytics
- **TrackingContextModule**: Tracking context management

## Data Flow

1. **Request Flow**: HTTP requests → Controllers → Services → Libraries
2. **Authentication Flow**: OIDC Provider → OIDC Client → Identity Providers
3. **Data Flow**: Services → Data Adapters → MongoDB/Redis
4. **Session Flow**: Session Module → Redis → Async Local Storage
5. **Validation Flow**: DTOs → Class Validator → Class Transformer

## Security Features

- **CSRF Protection**: Cross-site request forgery prevention
- **JWT Tokens**: Secure token-based authentication
- **Session Management**: Secure session handling with Redis
- **Cryptography**: Encryption and signing operations
- **Input Validation**: Comprehensive DTO validation

---

*This document was automatically generated based on the analysis of the core-fca application dependencies and architecture.* 