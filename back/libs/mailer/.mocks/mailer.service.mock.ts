export function getMailerServiceMock() {
  return {
    sendMail: jest.fn(),
  };
}
