import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { Class } from "type-fest";
import { AfterGetOidcCallbackSessionDto } from "./after-get-oidc-callback-session.dto";
import { ReviewerSessionDto } from "./reviewer-session.dto";
import { UserSession } from "./user-session.dto";

const validationErrorProperties = async (
  dto: Class<UserSession>,
  data: object,
) =>
  (await validate(plainToInstance(dto, data))).map(({ property }) => property);

describe("ReviewerSessionDto", () => {
  it("should refuse a session obtained through cross-device authentication", async () => {
    const properties = await validationErrorProperties(ReviewerSessionDto, {
      isCrossDeviceAuthenticated: true,
    });

    expect(properties).toContain("isCrossDeviceAuthenticated");
  });

  it("should refuse a session without the properties used to review and to share it", async () => {
    const properties = await validationErrorProperties(ReviewerSessionDto, {});

    expect(properties.sort()).toEqual([
      "browsingSessionId",
      "idpAcr",
      "idpId",
      "idpIdentity",
      "idpLabel",
      "idpName",
      "interactionAcr",
      "spIdentity",
    ]);
  });

  it.each([{}, { isCrossDeviceAuthenticated: false }])(
    "should accept a session not obtained through cross-device authentication (%o)",
    async (data) => {
      const properties = await validationErrorProperties(
        ReviewerSessionDto,
        data,
      );

      expect(properties).not.toContain("isCrossDeviceAuthenticated");
    },
  );
});

describe("AfterGetOidcCallbackSessionDto", () => {
  it("should require the IdP token of a session opened with the IdP", async () => {
    const properties = await validationErrorProperties(
      AfterGetOidcCallbackSessionDto,
      {},
    );

    expect(properties).toContain("idpIdToken");
  });

  it("should not require the IdP token of a cross-device authenticated session", async () => {
    const properties = await validationErrorProperties(
      AfterGetOidcCallbackSessionDto,
      { isCrossDeviceAuthenticated: true },
    );

    expect(properties).not.toContain("idpIdToken");
  });
});
