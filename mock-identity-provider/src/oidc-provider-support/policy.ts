import { get, isEmpty } from "lodash-es";
import { interactionPolicy } from "oidc-provider";

const { Check, base } = interactionPolicy;
const basePolicy = base();

const loginPrompt = basePolicy.get("login");
if (!loginPrompt) throw new Error("base policy missing login prompt");

loginPrompt.checks.remove("essential_acr");
loginPrompt.checks.add(
  new Check(
    "essential_acr",
    "requested ACR could not be obtained",
    (ctx) => {
      const { oidc } = ctx;
      const request = get(oidc.claims, "id_token.acr", {}) as {
        essential?: boolean;
        value?: string;
      };

      if (!request || !request.essential || !request.value) {
        return Check.NO_NEED_TO_PROMPT;
      }

      // any acr value is ok!
      if (!isEmpty(oidc.acr)) {
        return Check.NO_NEED_TO_PROMPT;
      }

      return Check.REQUEST_PROMPT;
    },
    ({ oidc }) => ({
      acr: oidc.claims?.["id_token"]?.["acr"],
    }),
  ),
);

export default basePolicy;
