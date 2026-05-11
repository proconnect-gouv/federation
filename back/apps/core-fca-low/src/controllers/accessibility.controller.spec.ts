import { Test, TestingModule } from "@nestjs/testing";
import { Response } from "express";
import { AccessibilityController } from "./accessibility.controller";

describe("AccessibilityController", () => {
  let controller: AccessibilityController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AccessibilityController],
    }).compile();

    controller = module.get<AccessibilityController>(AccessibilityController);
  });

  describe("getAccessibilityStatement()", () => {
    it("should render the accessibility page", async () => {
      const res = { render: jest.fn() } as unknown as Response;

      await controller.getAccessibilityStatement(res);

      expect(res.render).toHaveBeenCalledWith("accessibility");
    });
  });
});
