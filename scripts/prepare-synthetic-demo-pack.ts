import { mkdirSync, writeFileSync } from "node:fs";
import { syntheticFiles } from "../src/app/_components/synthetic-files";
import {
  promptExamples,
  artifactTypes,
  actionFixtures,
  scopeChoices,
  reviewCatalogRows,
} from "../src/app/_components/synthetic-fixtures";

const directory = "public/demo-files";
mkdirSync(directory, { recursive: true });
for (const [name, file] of Object.entries(syntheticFiles))
  writeFileSync(`${directory}/${name}`, file.bytes());
writeFileSync(
  `${directory}/synthetic-rejected.txt`,
  "SYNTHETIC ONLY: this unsupported text file must be rejected.\n",
);
writeFileSync(
  `${directory}/accounts.csv`,
  "email,password,role\n" +
    ["student", "leader", "admin", "second-admin"]
      .map((role) => `${role}@example.invalid,Synthetic-study-2026!,${role}`)
      .join("\n") +
    "\n",
);
writeFileSync(
  `${directory}/test-data.json`,
  JSON.stringify(
    {
      simulated: true,
      credentials: "accounts.csv",
      sourceTitle: "Synthetic study source",
      sourceDescription:
        "Invented source for the UniMind synthetic product flow.",
      adminReasonEn: "Synthetic readiness review.",
      adminReasonAr: "مراجعة جاهزية تجريبية.",
      verificationLink: "/auth/callback?code=sample-verification&type=signup",
      recoveryLink:
        "/auth/callback?code=sample-recovery&next=%2Freset-password",
      invitationLink: "/batch-leader/invitation",
      chatPrompts: promptExamples,
      catalog: reviewCatalogRows,
      rawHoldExpiryExample: "2026-10-03T16:00",
      note: "All dates, source rows, clocks and statuses are illustrative fixtures, not approved production limits or execution results.",
      studioArtifacts: artifactTypes,
      unitScopes: scopeChoices.map((choice) => ({
        path: choice.path,
        programEn: choice.scope.programNameEn,
        programAr: choice.scope.programNameAr,
        unitEn: choice.scope.unitTitleEn,
        unitAr: choice.scope.unitTitleAr,
      })),
      governedActions: actionFixtures,
      quiz: {
        illustrative: true,
        timedSeconds: 60,
        correctAnswers: ["Identify labels", "No duration is supplied"],
        wrongAnswers: ["Compare diagrams", "An exact duration"],
      },
      uploadFiles: Object.keys(syntheticFiles),
      failureFixtures: [
        "loading",
        "empty",
        "error",
        "offline",
        "stale",
        "forbidden",
        "quota",
        "capacity",
        "no-membership",
        "locked",
        "unpublished",
        "no-ready-source",
        "wrong-scope",
        "expired",
        "replayed",
        "unverified",
        "outdated-consent",
        "suspended",
        "blocked",
        "pending",
        "error-page",
        "checksum",
        "duplicate",
        "oversize",
        "rights",
      ],
    },
    null,
    2,
  ) + "\n",
);
