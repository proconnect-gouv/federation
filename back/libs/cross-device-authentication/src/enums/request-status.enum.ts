export enum RequestStatus {
  CREATED = "created",
  VERIFICATION_STARTED = "verification_started",
  EMOJIS_DISPLAYED = "emojis_displayed",
  APPROVED = "approved",
  CONSUMED = "consumed",
  REJECTED = "rejected",
}

export const NOT_REVIEWED_STATUSES = [
  RequestStatus.CREATED,
  RequestStatus.VERIFICATION_STARTED,
  RequestStatus.EMOJIS_DISPLAYED,
];
