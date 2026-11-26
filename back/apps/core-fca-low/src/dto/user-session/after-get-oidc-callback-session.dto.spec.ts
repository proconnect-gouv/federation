import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { Class } from "type-fest";
import { AfterGetOidcCallbackSessionDto } from "./after-get-oidc-callback-session.dto";
import { UserSession } from "./user-session.dto";

const validationErrorProperties = async (
  dto: Class<UserSession>,
  data: object,
) =>
  (await validate(plainToInstance(dto, data))).map(({ property }) => property);

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
