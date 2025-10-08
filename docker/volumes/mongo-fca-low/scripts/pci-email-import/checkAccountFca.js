let targetIdpUid = "71144ab3-ee1a-4401-b7b3-79b44f7daeeb";

const expectedIdpIdentityKeys = {
    [targetIdpUid]: {
        "sub-A": [
            { idpUid: targetIdpUid, idpSub: "sub-A", idpMail: "alice+new@example.com" }
        ],
        "sub-B": [
            { idpUid: targetIdpUid, idpSub: "sub-B", idpMail: "bob@example.com" },
            { idpUid: "0e7c099f-fe86-49a0-b7d1-19df45397212", idpSub: "sub-Z", idpMail: "zeta@example.com" }
        ],
        "sub-C": [
            { idpUid: targetIdpUid, idpSub: "sub-C" }
        ],
        "sub-C": [
            { idpUid: targetIdpUid, idpSub: "sub-C" }
        ],
        "sub-new-1": [
            {
                idpUid: targetIdpUid,
                idpSub: "sub-new-1",
                idpMail: 'new1@example.com',
            },
        ]
    },
    "0e7c099f-fe86-49a0-b7d1-19df45397212": {
        "sub-A": [
            { idpUid: "0e7c099f-fe86-49a0-b7d1-19df45397212", idpSub: "sub-A", idpMail: "dora@old.example" }
        ],
    }
}

function assertEqual(a, b) {
    if (JSON.stringify(a) !== JSON.stringify(b)) {
        throw new Error(`Assertion failed: (${a} !== ${b})`);
    }
}

function assertDeepEqual(a, b) {
    const aStr = JSON.stringify(a, Object.keys(a).sort());
    const bStr = JSON.stringify(b, Object.keys(b).sort());
    if (aStr !== bStr) {
        throw new Error(`Assertion failed: (${aStr} !== ${bStr})`);
    }
}

function assertDeepEqualArray(a, b) {
    if (a.length !== b.length) {
        throw new Error(`Assertion failed: array length differs (${a.length} !== ${b.length})`);
    }
    for (let i = 0; i < a.length; i++) {
        assertDeepEqual(a[i], b[i]);
    }
}

let failed = false;
for (const [idpUid, subs] of Object.entries(expectedIdpIdentityKeys)) {
    print("Checking IdP:", idpUid);
    for (const [idpSub, expectedKeys] of Object.entries(subs)) {
        print(" Checking sub:", idpSub);
        try {
            assertDeepEqualArray(
                db.accountFca.findOne({ idpIdentityKeys: { $elemMatch: { idpUid, idpSub } } }).idpIdentityKeys,
                expectedKeys
            );
            print("  OK");
        } catch (e) {
            print("  " + e.message);
            failed = true;
        }
    }
}

if (failed) {
    throw new Error("Some assertions failed.");
}

assertEqual(
    db.accountFca.findOne({ idpIdentityKeys: { $elemMatch: { idpUid: targetIdpUid, idpSub: "sub-D" } } }).updatedAt,
    new Date("2024-11-28T23:59:00Z")
);

print("All assertions passed.");
