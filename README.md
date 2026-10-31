# Trump’s Iran Rhetoric Before, During, and After Conflict Events

**[Read the interactive research poster](https://strokeofluck.github.io/DSA495-trump-iran-rhetoric-analysis/)**

**[Open the complete print-ready poster PDF](https://strokeofluck.github.io/DSA495-trump-iran-rhetoric-analysis/research-poster.pdf)**

The poster uses all available posts in the committed 87-post / 26-date dataset.
It contains the three-column research poster, figures, source links, limitations,
and AI-use statement. The print view uses the same all-data results shown on screen.

Supporting material lives on separate pages, linked here rather than on the poster:

- **[Explore evidence](https://strokeofluck.github.io/DSA495-trump-iran-rhetoric-analysis/evidence.html)** — interactive event/post browser, workbook records, severity checks, coverage table, source-linked model examples, methods, exact means, and data downloads.
- **[Presentation notes](https://strokeofluck.github.io/DSA495-trump-iran-rhetoric-analysis/presentation-notes.html)** — 90-second explanation, rehearsal questions, and remaining rubric work.

The print stylesheet targets a 36 × 24 inch landscape poster; the instructor has
not specified dimensions or confirmed that a web URL alone is a valid submission.
The Print poster control opens the verified one-page PDF, including all columns
and the severity figure. It does not depend on an in-app browser's print dialog.

The typography and palette match Sean's portfolio: locally bundled Source Sans
Pro, the light Quarto/Cosmo colors, blue links, and the portfolio's six rhetorical
frame colors. Edit `scripts/portfolio.css` and rebuild to update this styling.
Font licensing is included in `docs/fonts/OFL.txt`.

### Start here and reproduce the poster

1. Clone this repository and open a terminal in it.
2. With **Python 3.10 or later**, run `python scripts/build_poster.py`.
   No third-party packages, network calls, or model downloads are required.
3. Run `python -m http.server 8000 --directory docs` and open
   `http://localhost:8000/` in a browser.
4. Open `evidence.html` for the source examples, coverage table, exact values, and
   downloads. Open `presentation-notes.html` for the speaking notes. Dates do not
   need posts in all three windows.

The builder validates unique score IDs and post/event pairs, complete score joins,
consistent repeated text, finite 0–1 scores, and saved Eastern Time date offsets.
It writes all three pages, exact means, source checksums, and evidence JSON. It was checked
with Python 3.13. This reproduces aggregation from saved scores; **BART inference
was not rerun, and classifier accuracy has not been established**.

| Path | Role |
| --- | --- |
| `docs/index.html` | Standalone GitHub Pages poster; no CDN dependencies |
| `docs/evidence.html` | Supporting coverage, methods, examples, and exact results |
| `docs/presentation-notes.html` | Speaking notes, rehearsal questions, and completion guidance |
| `docs/research-poster.pdf` | Verified one-page 36 × 24 inch print output |
| `docs/severity-results.json` | Plotted date-level values and Spearman correlations for each window, with the largest-date check |
| `docs/evidence.json` | Counts, coverage, examples, all-data window means, input SHA-256 hashes |
| `docs/frame-means.csv` | Exact six-frame means with contributing-date and post/event-pair counts |
| `scripts/build_poster.py` | Portable, standard-library aggregation and validation |
| `scripts/poster_evidence.py` | Standard-library workbook reader, same-day fatality sums, source-post windows, and tied-rank correlations |
| `scripts/render_poster_pdf.py` | Optional PDF rebuild using a separate headless Chromium process |
| `scripts/*.template.html` | Editable source for the poster, evidence, and presentation pages; rebuild after edits |
| `data/` | Prepared post/event CSV, saved scores, and UCDP-derived event workbook |
| `Trump_Iran_Connected_Timeline_ZeroShot_Colab.ipynb` | Original classification and connected-timeline workflow |
| `references/poster_requirements.md` | Rubric mapping and remaining evaluation work |

### Severity and timeline evidence

The event browser uses the same 87 unique posts and 129 post/date pairs as the
poster, across 26 dates. It includes six saved scores, full post text, source links,
and the workbook records starting on each selected date. Missing windows remain
explicitly empty; they are never converted to zero rhetorical scores.

Severity is the summed `best` fatality estimate for workbook records whose
`date_start == date_end == event_date`. Spanning records are retained in the source
viewer but their cumulative fatalities are excluded from same-day severity.
Each plotted point is a date with positive same-day fatalities and at least one
post in the selected window. The samples are 19 dates before, 20 on the event day,
and 20 after; no requirement to have posts in all three windows is imposed.
Horizontal whiskers show summed low/high source estimates, not confidence intervals.
Spearman correlations use average ranks for ties. The optional sensitivity check
omits February 28, the largest same-day fatality date (162 best; 162–175 low/high).

The 47-row workbook labels its releases `Jan-Jun 2026 v26.01.26.06` and
`July 2026 v26.0.7`. Record 625182 has inconsistent supplied bounds
(low/best 2417, high 2401); the browser flags this without altering the source.
That record spans multiple days and is not included in any severity point.
Every plotted point has internally ordered source bounds. These are provisional
source estimates and descriptive associations, not a causal or predictive test.

The newer portfolio screenshot uses a different refreshed dataset. Its sample
sizes and coefficients are not silently copied into this repository's figures.

To rebuild the PDF after rebuilding the HTML, use an installed Chromium/Chrome
executable supporting headless printing:

```text
python scripts/render_poster_pdf.py --browser /path/to/chrome
```

This optional step needs no extra Python packages. It starts a temporary headless
profile, loads only the local built page, and writes `docs/research-poster.pdf`.
Check that the result has one page and that every section and chart is present
after any content/layout change. The committed output was rendered and visually
checked; PDF text/page-size checks and an independent workbook/rank-correlation
recalculation also passed.

### Original classification workflow

Open the existing notebook in Google Colab, select a T4 GPU when available, and
run cells in order. The notebook installs Transformers, Accelerate, SentencePiece,
Sentence Transformers, OpenPyXL, pandas, NumPy, and scikit-learn. It also uses
PyTorch, tqdm, and the Colab runtime. Its package versions and model revision are
not pinned; an exact inference reproduction is not yet guaranteed.

The notebook expects `MyDrive/Trump_Iran_Project` and asks for the prepared CSV
and workbook if absent. Upload the corresponding files from `data/`. To reuse
saved scores, copy `data/trump_iran_zero_shot_scores_26event_subset.csv` to that
Drive folder as `trump_iran_zero_shot_scores.csv` **before the scoring cell**.
To obtain fresh scores, use an empty cache location; inference downloads
`facebook/bart-large-mnli` and may take time. Keep the six prompts fixed when
comparing cached and regenerated results. This notebook uses Google Drive and
is not a local, headless reproduction script.

The poster work also corrected the original HTML renderer's missing style-map
entries for Blame Allies and Media Criticism and stale references to four frames.
This fixes the six-frame mapping error; it does not claim a fresh full Colab run.

### Readiness and submission

The course site states **poster due November 25, 2026 at 11:59 p.m.**, presentation
**November 30**, and documented repository due **December 6**. Submit through the
designated Canvas links when available; this repository is not a Canvas submission.
The poster submission window was not available during this review.

**Remaining for the full evaluation rubric:** blind human labels, a distinct
held-out evaluation, an evaluated baseline, per-frame precision/recall/F1 and
support, and error analysis. The original archive snapshot, workbook download
provenance, package versions, and model revision also need to be recorded. The page clearly labels
these gaps and does not invent evaluation results. See
[rubric mapping and next steps](references/poster_requirements.md).

**AI-use update (October 31, 2026):** OpenAI Codex read the instructor's rubric,
inspected this repository, created the poster and aggregation script, recomputed
the saved-score means, documented coverage, fixed the six-frame HTML
style mapping, and performed implementation checks. The notebook, corpus, and
cached scores already existed. BART was not rerun. Qualitative model examples
are not human gold labels or a performance estimate. The earlier AI-use history
is retained in section 11 below.

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
