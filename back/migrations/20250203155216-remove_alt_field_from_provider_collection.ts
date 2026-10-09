//

import type { IdentityProvider } from "#libs/identity-provider-adapter-mongo/schemas/index";
import type { Db } from "mongodb";

//

export async function up(db: Db) {
  await db
    .collection<IdentityProvider>("provider")
    .updateMany({ alt: { $exists: true } }, { $unset: { alt: "" } });
}
