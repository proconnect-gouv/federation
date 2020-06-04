interface MailFrom {
  readonly email: string;
  readonly name: string;
}

type MailTo = MailFrom;

export interface MailOptions {
  readonly subject: string;
  readonly body: string;
  readonly from: MailFrom;
  readonly to: MailTo[];
}
