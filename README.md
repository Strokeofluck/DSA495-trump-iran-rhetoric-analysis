# Trump’s Iran Rhetoric Before, During, and After Conflict Events

**[Research poster](https://strokeofluck.github.io/DSA495-trump-iran-rhetoric-analysis/)** · **[One-page PDF](https://strokeofluck.github.io/DSA495-trump-iran-rhetoric-analysis/research-poster.pdf)** · **[Evidence and source viewer](https://strokeofluck.github.io/DSA495-trump-iran-rhetoric-analysis/evidence.html)** · **[Presentation notes](https://strokeofluck.github.io/DSA495-trump-iran-rhetoric-analysis/presentation-notes.html)**

## Final presentation snapshot: frozen November 3, 2026

This is the current analysis snapshot. The original topic brief below is retained
as historical planning, including its older counts and outstanding questions.
No automatic refresh is scheduled. Further changes should be documented
corrections or a deliberately requested new snapshot.

| Quantity | Earlier poster | Frozen snapshot |
| --- | ---: | ---: |
| Unique matched posts | 87 | 130 |
| Selected event start dates | 26 | 43 |
| Post / start-date pairs | 129 | 235 |

The refreshed selection has **75 UCDP records**, grouped into 43 start dates.
There are **36 / 35 / 35** contributing dates and **76 / 77 / 82** post/date pairs
before / on / after starts. July 30 has no matched posts and remains visible as
missing coverage, never a numeric zero.

**Coverage and versions.** The [official UCDP Candidate release](https://ucdp.uu.se/downloads/)
is **26.01.26.09**, covering January–September 2026; September 30 is the event-data
cutoff. Selected starts range from February 28 to September 2; the final matching
window ends September 3. The [public post archive](https://huggingface.co/datasets/Cameronk199/donald-trump-truth-social-posts)
is pinned to `db7fed9bc7f495398e29ffa6e3423e21d720cc6b`, with source coverage through
November 3 at 06:12 UTC. Later archived posts outside selected event windows are
not added to event comparisons. All raw-source URLs, exact downloaded checksums,
filtered-file checksums, counts, and the freeze policy are in
[analysis_manifest.json](data/analysis_manifest.json).

**What changed.** The quarterly release revises historical records as well as
adding September events. It contains 511 Iran records and 409 records in the
Iran–Israel/U.S. conflict pool. The final selection retains 47 of the 49 prior
portfolio inclusions that remain in the current release and adds 28 reviewed
records with event-specific U.S./joint evidence, including a marked rescue-operation
context exception. Prior selected IDs 629301 and 637532 are absent from the current
release and are not carried forward; no official merge crosswalk is inferred.
Record 640760 reports the rescue-operation context under a different ID and revised
date span. Revised start dates, including 637743 moving to July 23, are rematched.

**Selection meaning.** Inclusion is a project review, not an official UCDP
classification of U.S. participation. Reviewed event-specific U.S. or joint
U.S.–Israel attribution is required. Joint dyad membership, a general report title
such as “US-Israeli Military Operations in Iran,” commentary, or sanctions alone
do not establish U.S. participation in an individual incident. Unverified records
are withheld, not proven Israel-only. Every pool ID has an explicit inclusion or
withholding decision in [selection_review_final.json](data/selection_review_final.json).
The headline-based review is conservative and is not an exhaustive review of all
underlying articles.

**Post matching.** Original, nonempty 2026 text posts are selected using
Iran/Iranian, Tehran, Hormuz, or Khamenei, while preserving legacy reviewed IDs.
The keyword rule is applied uniformly, including newly backfilled historical
event dates. Quotes/reblogs are excluded. UTC timestamps are converted with
`America/New_York`; one pair is retained per post and selected start date at −1,
0, or +1 calendar day. Posts can match multiple nearby dates; timing does not
prove that a post discusses that particular incident.

**Scoring.** Ninety existing scores are retained only where normalized source
text matches the prior snapshot. Forty new texts were scored locally with the
original six descriptions, `multi_label=True`, hypothesis template
`This text expresses {}.`, and truncation enabled. The new-score model is
`facebook/bart-large-mnli` revision `d7645e127eaf1aefc7862fd59a17a5aa8558b8ce`,
using Transformers 4.57.6 and Torch 2.12.0+cpu. The original revision for the 90
legacy scores remains unknown. [Scoring provenance](data/scoring-provenance.json)
records the exact prompts. No human accuracy evaluation is claimed.

**Updated findings.** Victory means are **0.752 → 0.767 → 0.713**; Threat means
are **0.547 → 0.567 → 0.468**. Both are highest on event days in this selected
sample. The earlier claim of a steady Threat decline no longer applies and has
been removed. Scores are uncalibrated entailment outputs, not percentages of
posts. Windows contain different contributing dates; no uncertainty intervals
or causal/predictive conclusions are asserted.

## Reproduce and inspect

1. Run `python scripts/build_poster.py` (Python 3.10+, standard library only).
2. Run `python scripts/validate_final_snapshot.py` to check source membership,
   selection decisions, unique IDs/pairs, timezone offsets, text joins, score
   reuse, and independently recomputed means.
3. Serve `docs/` with `python -m http.server 8000 --directory docs`.
4. The optional `scripts/render_poster_pdf.py --browser /path/to/chromium` exports
   the same one-page 36 × 24-inch poster using a separate headless profile.

| File | Purpose |
| --- | --- |
| `data/analysis_manifest.json` | Frozen inputs, versions, checksums, counts, and qualifications |
| `data/ucdp_iran_2026_through_september.csv` | All 511 official Iran rows, with source-release label |
| `data/selection_review_final.json` | Decisions for all 409 conflict-pool records |
| `data/ucdp_selected_events_2026_through_september.csv` | Current 75-record selection with involvement evidence |
| `data/iran_original_posts_snapshot_2026-11-03.csv` | 380 eligible 2026 posts from the pinned archive |
| `data/trump_iran_event_windows_final.csv` | 235 reconstructed post/date pairs |
| `data/trump_iran_frame_scores_final.csv` | Six saved frame scores for 130 matched IDs |
| `data/legacy/` | Prior August text windows and scores retained for reuse audit |
| `docs/frame-means.csv`, `docs/evidence.json` | Rebuilt exact values, coverage, context, and provenance |
| `scripts/*.template.html`, `scripts/poster-layout.*` | Poster, evidence page, notes, and scrolling strip |
| `Trump_Iran_Connected_Timeline_ZeroShot_Colab.ipynb` | Original classification workflow, retained as a legacy reference |

The older July-named input files remain as historical evidence; the active
builder reads the final files named in `analysis_manifest.json`.

## Presentation and limitations

The poster follows the course's four suggested sections in three landscape
columns. The removed severity comparison stays off the poster and PDF; supporting
severity exploration remains on the evidence page. The bottom strip scrolls the
130 matched posts in chronological order. **Posts ↓** jumps to it; click a card
for full saved text and source. Hover/focus or Pause stops motion. Reduced-motion
preferences start it paused; an explicit Resume choice is remembered for the tab
session. The PDF shows two still excerpts. Phone columns and charts stack.

No human gold labels, held-out precision/recall/F1, or evaluated baseline have
been produced. Overlapping windows reuse posts, source headlines/media can affect
attribution, truncation can lose context, and selected date groups are not a
non-event control. Source record 625182 still has inconsistent low/best/high
bounds; values are retained as supplied and its multi-day totals do not enter
same-day fatality comparisons. The original legacy model revision is not pinned.

Poster due **November 25, 2026, 11:59 p.m.**; presentation **November 30**; final
repository **December 6**, according to the [course project page](https://courseweb.site/dsa495-2026/project.html).
This update does not submit work through Canvas.

**AI-use update, November 3.** Sean directed the project and final data freeze.
Codex retrieved the official release and a size-bounded, checksum-verified public
text archive, reconciled IDs and prior review decisions, rebuilt windows, scored
40 new texts with BART using the existing prompts, updated the figures and notes,
and performed source, numerical, browser, and PDF checks. BART supplied analytical
scores; these checks do not establish rhetorical accuracy. Sean remains
responsible for reviewing decisions and defending the work.

**Attribution.** UCDP data are CC BY 4.0. Cite Hegre, Croicu, Eck, and Högbladh
(2020), “Introducing the UCDP Candidate Events Dataset,” Research & Politics,
[doi:10.1177/2053168020935257](https://doi.org/10.1177/2053168020935257), and Högbladh
(2026), UCDP Candidate Events Dataset Codebook v1.5. Underlying post/media rights
remain with their owners; public access does not imply unrestricted reuse.

---

# Original topic brief — historical planning

The sections below preserve the earlier submission and its then-current counts.
Use the frozen snapshot above for the final poster and repository results.

## 1. Working project title

**Trump’s Iran Rhetoric Before, During, and After Conflict Events: A Truth Social Text Analysis**

## 2. Team members

- Sean Ryan

## 3. One-sentence task

Given Donald Trump’s Iran-related Truth Social posts and dated conflict records attributed to the Uppsala Conflict Data Program (UCDP), we will classify rhetorical frames and compare their scores on the day before, day of, and day after selected events.

## 4. Illustrative input and desired output

**Representative input:** A public Truth Social post dated March 1, 2026, warning of retaliation against Iran, paired with a conflict-event date.

- [Archived post](https://trumpstruth.org/statuses/36999)
- [Original Truth Social link](https://truthsocial.com/@realDonaldTrump/116152241303132753)

**Desired output:** A record containing the post ID, timestamp, linked event date, relative day, and separate scores for Threat, Victory, Diplomacy, Ceasefire / Ending, Blame Allies, and Media Criticism.

For this example, we would expect the Threat frame to be relevant because the post warns of military retaliation. This is an illustrative expectation rather than a manually verified model result. Its relative-day category depends on the event date to which the post is matched.

The visualization will let readers inspect the post and its source alongside event information and compare rhetorical scores across the three time windows.

## 5. Background and starting point

This project examines how political language changes around military conflict. The central question is whether Trump’s Iran-related posts contain different rhetorical frames before an event than during or after it, with particular attention to threat language.

The project already includes a Google Colab notebook, prepared event-window data, an event workbook, saved model scores, and a portfolio visualization. Later portfolio work refreshed the data and revised the presentation in response to instructor feedback.

The next stage will focus on reconciling the repository and portfolio versions, documenting sources, evaluating classification against human judgments, and interpreting the timing comparisons carefully.

## 6. Intended output and success

The project will produce:

- A reproducible notebook that loads the data, scores unique posts, and calculates event-window comparisons.
- Post-level rhetorical scores and event-window summaries.
- An interactive timeline connecting events to posts published before, during, and after them.
- A methods explanation covering findings, source selection, evaluation, and limitations.

The intended audience includes students, researchers, journalists, and readers interested in political communication.

**Success statement:** The project will be useful if readers can trace each comparison to its source posts and event records and understand which patterns the analysis supports and which remain uncertain.

The project describes associations in the selected data. It does not establish that rhetoric caused conflict events or that model scores can predict military action.

## 7. Preferred data

### A. Truth Social text corpus

**Original material:** Public posts from Donald Trump’s `@realDonaldTrump` Truth Social account.

**Collection and access:** The existing project README identifies a public Hugging Face archive as the source. The prepared CSV preserves original Truth Social URLs and Trump’s Truth archive URLs. Its source field identifies Trump’s Truth status-detail pages.

A matching public archive is available at:
[Donald Trump Truth Social Posts Archive on Hugging Face](https://huggingface.co/datasets/Cameronk199/donald-trump-truth-social-posts).

The exact dataset snapshot originally used still needs to be recorded.

**Current working file:**
[data/trump_iran_event_windows_unique_dates.csv](data/trump_iran_event_windows_unique_dates.csv)

**Size and coverage:** The committed CSV contains 87 unique posts and 129 post/event-window rows across 26 distinct event dates, from February 28 through July 24, 2026. These counts describe the repository snapshot inspected on October 25, 2026.

**Version distinction:** Earlier project chats document a later portfolio refresh with 90 matched posts and 49 selected UCDP records grouped into 28 start dates. Those counts belong to the portfolio revision, not the older files currently committed in this analysis repository. Reconciling the versions is an immediate next step.

**Unit of analysis:** Each unique post is classified once. For event-window comparisons, an observation is a unique post ID/event-date pair. A post may appear in multiple windows when events occur close together.

**Relevant fields:** `truth_id`, `content_text`, `truth_url`, `source_url`, `created_at_utc`, `created_at_et`, `post_date_et`, `event_date`, `relative_day`, and `window_label`.

**Representative public examples:**

- [Retaliation warning](https://trumpstruth.org/statuses/36999)
- [Statement about Khamenei](https://trumpstruth.org/statuses/36996)
- [Post linking an article about Iran](https://trumpstruth.org/statuses/36993)

These examples include direct statements, claims about conflict outcomes, and shared article text. That variety makes authorship and post-type checks important.

### B. Conflict-event data

**Source:** UCDP event data, filtered for documented U.S. or joint U.S.–Israel involvement.

**Official access point:**
[UCDP Dataset Download Center](https://ucdp.uu.se/downloads/)

**Repository working file:**
[data/UCDP_Iran_US_or_Joint_US_Involvement_2026_through_July.xlsx](data/UCDP_Iran_US_or_Joint_US_Involvement_2026_through_July.xlsx)

**Relevant fields:** Event start and end dates, fatality estimates, civilian deaths, involvement categories, locations, and source headlines.

The workbook supplies event dates and context for the three-day windows. Earlier portfolio work also incorporated updated UCDP Candidate releases through August 2026 and documented inclusion and exclusion decisions.

We will record the exact source products, release versions, download dates, filtering rules, and record counts alongside the reconciled files.

### Access, rights, and backup plan

The working files are already in the repository, so initial analysis does not depend on collecting a new corpus.

UCDP’s download center states that its datasets use CC BY 4.0 and require attribution and relevant dataset citations. The matching Hugging Face archive lists its license as “other”; public availability does not establish unrestricted redistribution rights for underlying posts or linked media.

The analysis focuses on public post text and necessary metadata, preserves attribution and source links, and avoids collecting private user information.

If upstream access becomes unavailable, the minimum project can use the existing documented subset, subject to source-use terms. Public archive pages can support spot checks. Conclusions will remain limited to the available coverage.

## 8. Feasibility and immediate next steps

**Minimum viable project:** Analyze the repository’s existing 87 unique posts across 26 event dates, compare the three windows, and produce an inspectable timeline with a small human-reviewed evaluation sample.

**Access status:** The repository contains prepared data, the event workbook, notebook, and subset scores. Earlier chats document running and checking the later portfolio pipeline. A fresh run of the reconciled repository version remains to be documented.

**Largest current risk:** Selected event windows may give an incomplete picture of broader rhetoric. Overlapping windows, missing posts, uncertain event dates, and classification errors can affect comparisons.

**Backup plan:** Keep the analysis descriptive, report coverage for each window, manually review a manageable sample, and reduce the number of frames if some cannot be distinguished reliably. Add comparable non-event dates if feasible.

**Next two actions — proposed dates:**

1. **Sean Ryan — October 27, 2026:** Reconcile the repository and portfolio versions, confirm source snapshots and UCDP releases, and document filtering and timezone rules.
2. **Sean Ryan — October 29, 2026:** Run the reconciled notebook from a clean session, create a manually labeled evaluation sample, and check exported summaries and the timeline.

The repository is now named `DSA495-trump-iran-rhetoric-analysis`.

## 9. Possible method and evaluation

The notebook uses `facebook/bart-large-mnli` through Hugging Face Transformers for multi-label zero-shot classification. It supplies only post text to the classifier, excluding event headlines, fatalities, and event significance.

The six frames are Threat, Victory, Diplomacy, Ceasefire / Ending, Blame Allies, and Media Criticism. Scores are model entailment scores rather than calibrated probabilities.

The notebook averages post scores within each event-date/window group, then averages those group means. We will report how many dates contribute to each window because missing groups can change the population being compared.

For evaluation, we propose manually labeling approximately 30 posts. A development portion will support refining frame definitions and any thresholds; a separate held-out portion will assess agreement without further tuning. Repeated appearances of the same post will remain in the same partition.

If binary labels are used, we will report per-frame precision, recall, and F1 alongside examples of errors. The small sample will limit performance claims.

We will also check duplicate handling, overlapping windows, timezone alignment, long-post truncation, and direct statements versus shared article text. Same-day matching alone cannot establish whether a post preceded an event within that day.

## 10. Questions for the instructor

1. Is developing and evaluating this existing project appropriate for the course project?
2. Is a descriptive analysis of selected events sufficient, or should non-event comparison dates be required?
3. Is a small human-labeled evaluation suitable for the zero-shot approach?
4. Should the project retain all six frames or prioritize a smaller set with clearer distinctions?

## 11. AI-use statement

**Tools and their roles:** OpenAI Codex assisted with project development, data-refresh code, documentation, analysis presentation, and preparation of this brief. Earlier chats titled “Update UCDP events and review” (October 11, 2026) and “Apply Iran timeline feedback” (October 13, 2026) document that assistance. The analysis also uses Hugging Face Transformers with `facebook/bart-large-mnli` to assign multi-label rhetorical scores to post text. That classifier produces analytical scores; Codex provided coding, writing, and review assistance.

**Work that preceded the assistance:** Before the October refresh and revision chats, the project already had an Iran-rhetoric research question, a Colab notebook, prepared post/event data, saved classifier scores, and a portfolio timeline. Git history shows the notebook and data were committed on September 7, 2026, and course-method references were added on September 14. This chronology describes what existed before those October sessions; it does not establish whether earlier development involved other AI assistance.

**Contributions incorporated:** During the October sessions, Codex helped retrieve and process updated UCDP releases, score newly matched posts, revise the event-window pipeline, correct timestamp presentation, and document inclusion and exclusion decisions. It also helped build source viewers, CSV downloads, comparison workbooks, connected-dot charts, exploratory severity plots, and timeline navigation. Sean directed the scope and revisions, including retaining documented U.S. involvement, reviewing the pilot-rescue record, and choosing the final navigation and layout. This brief incorporates advice to distinguish event records from date groups, document incomplete coverage, reconcile versions, and avoid treating descriptive patterns as proven advance-warning signals.

**Verification and limits:** The earlier chats record programmatic checks of record IDs and counts, source-to-output consistency, workbook preservation, JavaScript syntax, site builds, and desktop/mobile interaction. Those are data and implementation checks, not a human-labeled validation of rhetorical accuracy. For this brief, Codex reviewed Git history, the notebook, reference files, and earlier chats and checked that the committed 87-post score file matches the 87 unique post IDs in the 129-row event-window CSV, with six score columns in the expected 0–1 range. The classifier was not rerun during this brief review. Manual evaluation of frame accuracy and confirmation of the exact original source snapshots remain next steps.

The reviewed chats establish Codex’s contributions described above. They do not establish a complete history of AI use before those sessions, so this statement does not attribute unverified work to another assistant or claim that no earlier AI assistance occurred.
