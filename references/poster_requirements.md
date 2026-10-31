# Poster requirements and readiness

Reviewed October 31, 2026 against the instructor's
[End-to-End Text-Analysis Project page](https://courseweb.site/dsa495-2026/project.html).
The text analysis class uses [Canvas](https://ncsu.instructure.com/courses/385),
not the Moodle instance used by Sean's other classes. Canvas did not yet expose
a poster submission assignment during this review.

## Dates and format

- Poster: November 25, 2026, 11:59 p.m.; presentation: November 30.
- Final documented repository: December 6, 2026.
- The course requests a concise poster, verbal explanation, and Canvas submission.
- The guidance does not specify poster dimensions or explicitly accept a Pages
  URL as the entire poster submission. The page supplies a 36 × 24 inch print
  layout as a practical default, not an instructor-mandated size.
- The course's linked Drive example was access-restricted to the browser account.
  No access request was sent. The published written rubric was available in full.

## Rubric mapping

| Criterion | Weight | Evidence on the page | Remaining limit |
| --- | ---: | --- | --- |
| Problem & Technical Workflow | 25% | Concrete input/output task, corpus, unique-post scoring, tokenizer/representation, six frame descriptions, BART-MNLI settings, two-stage mean | Original upstream acquisition, source/model revisions and environment are not fully reconstructable yet |
| Experimental Evidence & Evaluation Validity | 30% | Real saved-score figures, exact values, coverage table, same-date sensitivity, source-linked qualitative cases, explicit dependence and interpretation limits | No human gold labels, held-out performance, or evaluated baseline; cannot claim exemplary evaluation |
| Poster Design & Technical Communication | 25% | Three-column poster, readable small multiples on a common scale, numeric labels, compact takeaway, print view, mobile layout, accessible controls | Final upload format and dimensions must follow any later Canvas instructions |
| Oral Defense & Team Command | 20% | 90-second explanation, rehearseable questions, code links, AI-use statement | Sean must personally understand and defend the code and choices |

The original repository estimator uses 20 / 21 / 21 nonempty date groups in the
three windows. The poster's primary estimator uses the same 14 dates in each
window, with 26 / 25 / 26 post/event pairs. These are descriptive comparisons,
not experimental treatment effects. Reusing posts across dates creates dependence.

## Evaluation plan — proposed, not performed

1. Write annotation instructions defining each frame, including boundaries between
   success claims, hypothetical threats, and conflict-ending language. Decide how
   to handle media-only captions, article headlines, and mixed authorship.
2. Select about 30 unique posts using a documented random seed. Hide model scores
   during annotation; keep the qualitative examples shown on the poster in
   development rather than presenting them as untouched held-out cases.
3. Separate development and held-out IDs before adjusting prompts or thresholds.
   All copies of the same ID must stay in the same partition. A second annotator
   and adjudication would provide evidence about label ambiguity.
4. Specify a simple frame-keyword baseline on development data only. Compare it
   with BART using identical held-out IDs and the same annotation definitions.
5. Report per-frame precision, recall, F1, positive support, and confusion counts.
   Explain undefined metrics or zero-positive frames; do not silently replace
   missing evidence with perfect or zero performance. Thirty posts give limited
   support for six frames, so qualify estimates accordingly.
6. Analyze errors, URL/headline attribution, missing media context, and tokenizer
   truncation. Keep post-level evaluation separate from event-window comparisons.

Do not invent labels, assume model scores are calibrated, split repeated rows,
report a favorable prompt result as an untouched test, or claim causality from
event proximity. A broader predictive claim would require non-event dates,
time-aligned inputs, and an appropriate prospective/temporal evaluation design.

## Repository component

The course also asks for a clear README/project map, environment and data-access
instructions, text preparation, modeling/application, evaluation and interpretation,
portable structure, version control, and an AI-use statement. This update provides
a complete saved-score poster rebuild. The original notebook still depends on
Colab/Drive and unpinned packages; exact upstream collection and inference are
explicitly unfinished. Saved scores were used unchanged.
