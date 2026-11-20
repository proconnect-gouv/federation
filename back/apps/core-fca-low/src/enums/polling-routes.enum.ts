// Routes polled by the scripts of the pages to follow the cross-device
// authentication requests, not visited by the user
export enum PollingRoutes {
  CROSS_DEVICE_AUTHENTICATION_STATUS = "/cross-device-authentication-status/:requestId",
  CROSS_DEVICE_AUTHENTICATION_NOT_REVIEWED_REQUESTS = "/cross-device-authentication-not-reviewed-requests",
  REVIEW_CROSS_DEVICE_AUTHENTICATION_REQUEST_STATUS = "/cross-device-authentication-requests/:requestId/status",
}
