// Type definitions for node-mailjet 3.3
// Project: https://github.com/mailjet/mailjet-apiv3-nodejs
// Definitions by: Nikola Andreev <https://github.com/Nikola-Andreev>
// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped
// TypeScript Version: 2.2

export function connect(
  apiKey: string,
  apiSecret: string,
  options?: ConnectOptions,
): Email.Client;

export function connect(apiToken: string, options?: ConnectOptions);

export interface ConnectOptions {
  readonly proxyUrl?: string;
  readonly timeout?: number;
  readonly url?: string;
  readonly version?: string;
  readonly perform_api_call?: boolean;
}

export interface ConfigOptions {
  readonly host?: string;
  readonly port?: number;
  readonly secure?: boolean;
}

// *** Email API interfaces *** //
// tslint:disable-next-line: no-namespace
export namespace Email {
  interface Client {
    get(action: string): GetResource;

    put(action: string): PutResource;

    post(action: string, options?: ConfigOptions): PostResource;
  }

  // resources
  interface PostResource {
    id(value: string): PostResource;

    action(action: string): PostResource;

    request(params: SendParams): Promise<PostResponse>;

    request(
      params: object,
      callback?: (error: Error, res: Response) => void,
    ): Promise<Response>;
  }

  interface GetResource {
    id(value: string): GetResource;

    action(action: string): GetResource;

    request(
      params?: object,
      callback?: (error: Error, res: GetResponse) => void,
    ): Promise<GetResponse>;
  }

  interface PutResource {
    id(value: string): PutResource;

    request(
      params: object,
      callback?: (error: Error, res: PutResponse) => void,
    ): Promise<PutResponse>;
  }

  // responses
  interface Response {
    readonly body: object;
  }

  interface GetResponse {
    readonly body: GetResponseData;
  }

  interface PostResponse {
    readonly body: PostResponseData;
  }

  interface PutResponse {
    readonly body: PutResponseData;
  }

  // request params
  interface SendParams {
    Messages: SendParamsMessage[];
    SandboxMode?: boolean;
  }

  // other types
  interface SendParamsRecipient {
    Email: string;
    Name: string;
  }

  interface SendParamsMessage {
    From: {
      Email: string;
      Name: string;
    };
    To: SendParamsRecipient[];
    Cc?: SendParamsRecipient[];
    Bcc?: SendParamsRecipient[];
    Variables?: object;
    TemplateID?: number;
    TemplateLanguage?: boolean;
    Subject: string;
    TextPart?: string;
    HTMLPart?: string;
    MonitoringCategory?: string;
    URLTags?: string;
    CustomCampaign?: string;
    DeduplicateCampaign?: boolean;
    EventPayload?: string;
    CustomID?: string;
    Headers?: object;
    Attachments?: [
      {
        ContentType: string;
        Filename: string;
        Base64Content: string;
      },
    ];
    InlinedAttachments?: [
      {
        ContentType: string;
        Filename: string;
        ContentID: string;
        Base64Content: string;
      },
    ];
  }

  interface PostResponseDataMessage {
    readonly Status: string;
    readonly CustomID: string;
    readonly To: ReadonlyArray<PostResponseDataTo>;
    readonly Cc: ReadonlyArray<PostResponseDataTo>;
    readonly Bcc: ReadonlyArray<PostResponseDataTo>;
  }

  interface PostResponseDataTo {
    readonly Email: string;
    readonly MessageUUID: string;
    readonly MessageID: number;
    readonly MessageHref: string;
  }

  interface GetResponseData {
    readonly Count: number;
    readonly Data: ReadonlyArray<object>;
    readonly Total: number;
  }

  interface PostResponseData {
    readonly Messages: ReadonlyArray<PostResponseDataMessage>;
  }

  interface PutResponseData {
    readonly Count: number;
    readonly Data: ReadonlyArray<object>;
    readonly Total: number;
  }
}
