import { describe, expect, it } from "vitest";

import {
  deriveAvailability,
  type AvailabilityFacts,
} from "../../src/lib/availability/derive-availability.domain";

const allowedFacts: AvailabilityFacts = {
  hasActiveMembership: true,
  cohortReleased: true,
  unitPublished: true,
  hasActiveReadySource: true,
  rightsValid: true,
  curriculumEditionMatches: true,
};

const securityCases = [
  {
    actor: "student-a in the authorized cohort",
    operation: "read curriculum unit",
    facts: allowedFacts,
    expected: { available: true, reasons: [] },
  },
  {
    actor: "student-b from another cohort",
    operation: "read curriculum unit",
    facts: { ...allowedFacts, hasActiveMembership: false },
    expected: { available: false, reasons: ["membership_missing"] },
  },
  {
    actor: "batch leader without student membership",
    operation: "read curriculum unit",
    facts: { ...allowedFacts, hasActiveMembership: false },
    expected: { available: false, reasons: ["membership_missing"] },
  },
  {
    actor: "student-a before cohort release",
    operation: "read curriculum unit",
    facts: { ...allowedFacts, cohortReleased: false },
    expected: { available: false, reasons: ["cohort_locked"] },
  },
  {
    actor: "student-a with a non-READY source",
    operation: "read curriculum unit",
    facts: { ...allowedFacts, hasActiveReadySource: false },
    expected: { available: false, reasons: ["ready_source_missing"] },
  },
] as const;

describe("synthetic curriculum-unit authorization matrix", () => {
  it.each(securityCases)(
    "$actor can or cannot $operation only from authorized facts",
    ({ facts, expected }) => {
      expect(deriveAvailability(facts)).toEqual(expected);
    },
  );
});
