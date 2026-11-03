# Poster requirements and readiness

Reviewed November 3, 2026 against the instructor's
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
- The linked Drive folder was accessible after switching to Sean's NC State
  account. The PDF example, `SerenaKimRMCWiC.pdf`, uses one landscape sheet,
  three columns, clear section headers, and a large central results area. The
  folder also includes a PowerPoint copy. The written guidance suggests four
  stages, not an exact mandatory visual template or an animation requirement.
- The revised poster follows those four stages across three columns. The online
  version adds a chronological 130-post scrolling strip with explicit pause,
  hover/focus pause, reduced-motion support, and full-text/source dialogs. The
  one-page PDF shows two still excerpts. No Canvas submission was made.

## Rubric mapping

| Criterion | Weight | Evidence in the poster and supporting pages | Remaining limit |
| --- | ---: | --- | --- |
| Problem & Technical Workflow | 25% | Concrete task, pinned final sources, reviewed selection, timezone joins, unique-post scoring, six frame descriptions, BART-MNLI settings, two-stage mean | Original model revision for 90 retained legacy scores remains unknown |
| Experimental Evidence & Evaluation Validity | 30% | Real saved-score figures, exact values, coverage table, all-data window coverage, source-linked qualitative cases, explicit dependence and interpretation limits | No human gold labels, held-out performance, or evaluated baseline; cannot claim exemplary evaluation |
| Poster Design & Technical Communication | 25% | Three-column poster, readable small multiples on a common scale, numeric labels, compact takeaway, print view, mobile layout, accessible controls | Final upload format and dimensions must follow any later Canvas instructions |
| Oral Defense & Team Command | 20% | Separate presentation-notes page with a 90-second explanation and rehearsal questions; code links and AI-use statement | Sean must personally understand and defend the code and choices |

The frozen snapshot uses 36 / 35 / 35 nonempty date groups in the
three windows, with 76 / 77 / 82 post/event pairs. It includes 130 unique posts,
75 selected UCDP records, and 43 distinct selected start dates. July 30 has no
matching posts and remains in the coverage table.
Dates contribute wherever a window contains posts; there is no requirement to
have posts in every window. These are descriptive comparisons,
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
a complete saved-score poster rebuild. The final November 3 freeze pins UCDP
Candidate 26.01.26.09 and the public post archive through November 3. Ninety
legacy scores are retained after text matching; 40 new texts were scored using
the same prompts and a pinned BART revision and package versions. The original
notebook remains a Colab/Drive reference; the original model revision for the
legacy scores is unknown. Independent source, membership, join, score-reuse,
and arithmetic checks are in `scripts/validate_final_snapshot.py`.

Supporting evidence and presentation notes are separate pages linked from the repository README. The main poster does not link to those pages.

The poster and its downloadable PDF focus on six larger frame comparison charts.
The exploratory next-day Victory severity section was removed to simplify the
presentation at Sean's request.
The evidence page retains all four-frame/window comparisons and the three-window
Threat view. The evidence page contains an interactive event/post browser,
individual current-release records, full post text, exact severity values, and
the documented source-bound inconsistency. These use the frozen final snapshot;
the earlier portfolio snapshot is retained only for the score-reuse audit.
The Print poster link opens a verified one-page
36 × 24 inch PDF; the native print CSS is also constrained to avoid the original
grid page-break defect.
