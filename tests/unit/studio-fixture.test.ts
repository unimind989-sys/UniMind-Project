import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import {
  buildStudioFixture,
  studioFixtureManifest,
  studioFixtureSegments,
  studioFixtureTypes,
  type StudioFixtureContent,
  type StudioFixtureOptions,
  type StudioFixtureText,
} from "../../src/lib/studio/studio-fixture.application";

const combinations: StudioFixtureOptions[] = studioFixtureTypes.flatMap(
  (type) =>
    (["en", "ar", "mixed"] as const).flatMap((language) =>
      (["sequence", "comparison"] as const).flatMap((topic) =>
        (["concise", "detailed"] as const).flatMap((depth) =>
          (["short", "extended"] as const).map((size) => ({
            type,
            language,
            topic,
            depth,
            size,
          })),
        ),
      ),
    ),
);
const defaults: StudioFixtureOptions = {
  type: "summary",
  language: "en",
  topic: "sequence",
  depth: "concise",
  size: "short",
};
function texts(model: StudioFixtureContent): StudioFixtureText[] {
  return [
    model.intro,
    ...model.paragraphs,
    ...model.steps.flatMap((step) =>
      step.explanation[0] ? [step.text, step.explanation] : [step.text],
    ),
    ...model.questions.flatMap((question) => [
      question.prompt,
      ...question.explanations,
    ]),
    ...(model.card ? [...model.card.front, ...model.card.back] : []),
  ];
}
const body = (model: StudioFixtureContent) =>
  texts(model)
    .flatMap((text) =>
      studioFixtureSegments(text, model.options.language).map(
        (segment) => segment.text,
      ),
    )
    .join("\n");

describe("fixed Studio examples", () => {
  it("supports every type/topic/depth/size/language deterministically", () => {
    expect(combinations).toHaveLength(studioFixtureTypes.length * 24);
    for (const options of combinations) {
      const label = `${options.type}/${options.topic}/${options.depth}/${options.size}/${options.language}`;
      const input = { ...options };
      const before = structuredClone(input);
      const model = buildStudioFixture(input)!;
      expect(model, label).not.toBeNull();
      expect(model.options, label).toEqual(input);
      expect(input, label).toEqual(before);
      expect(model, label).toEqual(buildStudioFixture(input));
      expect(body(model).length, label).toBeGreaterThan(60);
      for (const text of texts(model)) {
        expect(text[0].length, label).toBeGreaterThan(10);
        expect(text[1], label).toMatch(/[\u0600-\u06ff]/u);
        const segments = studioFixtureSegments(text, options.language);
        expect(
          segments.map((segment) => segment.language),
          label,
        ).toEqual(
          options.language === "mixed" ? ["ar", "en"] : [options.language],
        );
      }
    }
  });
  it.each(studioFixtureTypes)(
    "all 24 choices for %s have distinct content without metadata labels",
    (type) => {
      const rendered = combinations
        .filter((options) => options.type === type)
        .map((options) => body(buildStudioFixture(options)!));
      expect(rendered).toHaveLength(24);
      expect(new Set(rendered).size).toBe(24);
    },
  );
  it.each(studioFixtureTypes)(
    "%s size adds coverage and depth adds explanation",
    (type) => {
      for (const language of ["en", "ar", "mixed"] as const)
        for (const topic of ["sequence", "comparison"] as const) {
          const short = buildStudioFixture({
            ...defaults,
            type,
            topic,
            language,
          })!;
          const extended = buildStudioFixture({
            ...defaults,
            type,
            topic,
            language,
            size: "extended",
          })!;
          const detailed = buildStudioFixture({
            ...defaults,
            type,
            topic,
            language,
            depth: "detailed",
          })!;
          expect(body(extended).length).toBeGreaterThan(body(short).length);
          expect(texts(extended).length).toBeGreaterThan(texts(short).length);
          expect(body(detailed).length).toBeGreaterThan(body(short).length);
          expect(
            body(
              buildStudioFixture({
                ...defaults,
                type,
                topic,
                language,
                depth: "detailed",
                size: "extended",
              })!,
            ).length,
          ).toBeGreaterThan(body(extended).length);
        }
    },
  );
  it("keeps the original one-card default front and back in both languages", () => {
    const model = buildStudioFixture({ ...defaults, type: "flashcards" })!;
    expect(model.card).toEqual({
      front: [
        [
          "What sequence does the sample handout use?",
          "ما ترتيب الملزمة التجريبية؟",
        ],
      ],
      back: [
        [
          "Identify labels, then compare diagrams.",
          "حدد الأسماء ثم قارن الرسوم.",
        ],
      ],
    });
    expect(model.questions).toHaveLength(0);
  });
  it("comparison questions expose missing labels and conflict rather than inventing diagram facts", () => {
    const model = buildStudioFixture({
      ...defaults,
      type: "practice",
      topic: "comparison",
      depth: "detailed",
      size: "extended",
      language: "mixed",
    })!;
    expect(model.questions).toHaveLength(3);
    expect(body(model)).toContain("No specific label identities are supplied");
    expect(body(model)).toContain("لا ترد أسماء محددة");
    expect(body(model)).not.toContain("Which step comes first");
    expect(body(model)).toContain("retain the conflict without deciding");
  });
  it("quiz is a fixed preview whose size does not configure an attempt", () => {
    const short = buildStudioFixture({ ...defaults, type: "quiz" })!;
    const extended = buildStudioFixture({
      ...defaults,
      type: "quiz",
      size: "extended",
    })!;
    expect(short.questions).toHaveLength(2);
    expect(extended.questions).toHaveLength(4);
    expect(short.intro[0]).toContain("does not set its count or difficulty");
    expect(studioFixtureManifest().quizPreviewOnly).toBe(true);
    expect(studioFixtureManifest().combinations).toBe(combinations.length);
  });
  it("the downloadable pack describes exactly the current Studio examples", () => {
    const pack = JSON.parse(
      readFileSync("public/demo-files/test-data.json", "utf8"),
    ) as { studioExamples: unknown };
    expect(pack.studioExamples).toEqual(studioFixtureManifest());
  });
  it.each(["type", "language", "topic", "depth", "size"] as const)(
    "rejects unsupported %s rather than generating a fallback",
    (key) => {
      expect(
        buildStudioFixture({ ...defaults, [key]: "unsupported" }),
      ).toBeNull();
    },
  );
});
