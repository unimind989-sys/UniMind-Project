# Premium product-screen candidate

The approved landing is saved at `569c467` with recovery tag `codex/landing-approved-2026-10-04`. Ahmed also accepted remaining-screen candidate `f0a237f`, containing source implementation `0d2c31c`, and invoked `$finalize`; the [product approval](product-approval.md) records exact scope and identity. Runtime PR [#67](https://github.com/unimind989-sys/UniMind-Project/pull/67) is merged, and source `a74abe5` is verified on [production](https://project-xwrez.vercel.app). The [production evidence](../../../evidence/wp03-product-shell/2026-10-04_premium-product_production_a74abe5.md) records the full technical gate, protected review and release proof.

## Live local review

Start the zero-provider synthetic runtime with `corepack pnpm demo` at `http://127.0.0.1:3101`; the review server is currently stopped. Each link opens the normal sign-in form with invented, prefilled credentials. Continue, accept the sample commitments, and use the working screen. Reload clears synthetic records. These previews grant no real access and send no upload, Auth, provider or protected mutation request.

- [Student Studio](http://127.0.0.1:3101/login?lang=en&email=student%40example.invalid&next=%2Flearn%2Fzagazig-university-human-medicine-year-1-term-1-cohort%2Fzagazig-university-human-medicine-y1-t1-anatomy%2Fstudio): use Materials, Chat, Studio and Quiz; inspect sources and reports; generate each study-aid type and flip a flashcard.
- [Batch Leader intake](http://127.0.0.1:3101/login?lang=en&email=leader%40example.invalid&next=%2Fbatch-leader%2Fcampaigns%2Fsample-campaign): inspect the request, use the supplied reference file, check the queue and History.
- [Admin](http://127.0.0.1:3101/login?lang=en&email=admin%40example.invalid&next=%2Fadmin): inspect the decision queue and resource screens, including exact current/proposed state.
- [Arabic Student Studio](http://127.0.0.1:3101/login?lang=ar&email=student%40example.invalid&next=%2Flearn%2Fzagazig-university-human-medicine-year-1-term-1-cohort%2Fzagazig-university-human-medicine-y1-t1-anatomy%2Fstudio): check RTL navigation with separate study-output language. Account changes the live light/dark theme.

Access, onboarding, shelf, Materials, Chat, Studio, Quiz/review, evidence/report, Account, campaign intake/history, Admin queue and resource pages share the refined system. Existing allowed, unavailable, empty, pending, error and recovery behavior remains explicit.

## Review scope

Review the student journey, leader journey, admin journey and consistency across them as one remaining-screen candidate. The [inline finish review](remaining-screens-review.md) records both capture rounds and their limitations. No shipping raster asset or new dependency was added.

The landing and remaining-screen material checkpoints are accepted separately. The [frontend quality floor](../../../docs/agents/frontend-quality-floor.md) receipt is recorded for the exact accepted candidate. WP03-T10's complete synthetic/real regression, guarded local proof, exact-head CI and production release checks have passed. These local links are restartable review entry points; production retains its real access guards and does not enable synthetic sign-in.
