import { getModelToken } from "@nestjs/mongoose";
import { Test, TestingModule } from "@nestjs/testing";
import { EmailVerificationTokenRepository } from "./email-verification-token.repository";

describe(EmailVerificationTokenRepository.name, () => {
  let repository: EmailVerificationTokenRepository;

  const modelMock = {
    findOne: jest.fn(),
    findOneAndUpdate: jest.fn(),
    deleteOne: jest.fn(),
  };

  beforeEach(async () => {
    jest.resetAllMocks();
    jest.restoreAllMocks();

    const app: TestingModule = await Test.createTestingModule({
      providers: [
        EmailVerificationTokenRepository,
        {
          provide: getModelToken("EmailVerificationToken"),
          useValue: modelMock,
        },
      ],
    }).compile();

    repository = app.get<EmailVerificationTokenRepository>(
      EmailVerificationTokenRepository,
    );
  });

  describe("findOne", () => {
    it("should call findOne with the given email", async () => {
      const email = "user@example.com";

      await repository.findOne(email);

      expect(modelMock.findOne).toHaveBeenCalledWith({ email });
    });
  });

  describe("upsert", () => {
    it("should call findOneAndUpdate with the given email and token", async () => {
      const email = "user@example.com";
      const token = "1234567890";

      await repository.upsert({ email, token });

      expect(modelMock.findOneAndUpdate).toHaveBeenCalledWith(
        { email },
        { email, token, sentAt: expect.any(Date) },
        { upsert: true },
      );
    });
  });

  describe("deleteOne", () => {
    it("should call deleteOne with the given email", async () => {
      const email = "user@example.com";

      await repository.deleteOne(email);

      expect(modelMock.deleteOne).toHaveBeenCalledWith({ email });
    });
  });
});
