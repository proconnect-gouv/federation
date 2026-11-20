import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { AfterGetOidcCallbackSessionDto } from "./after-get-oidc-callback-session.dto";
import { ReviewerSessionDto } from "./reviewer-session.dto";

const validationErrorProperties = async (
  dto: typeof ReviewerSessionDto | typeof AfterGetOidcCallbackSessionDto,
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

  it("should refuse a session that is not active, even with an interaction acr", async () => {
    const properties = await validationErrorProperties(ReviewerSessionDto, {
      interactionAcr: "eidas1",
    });

    expect(properties).toEqual(
      expect.arrayContaining([
        "browsingSessionId",
        "idpId",
        "idpIdentity",
        "spIdentity",
      ]),
    );
  });

  it("should accept a session not obtained through cross-device authentication", async () => {
    const properties = await validationErrorProperties(ReviewerSessionDto, {});

    expect(properties).not.toContain("isCrossDeviceAuthenticated");
  });
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
