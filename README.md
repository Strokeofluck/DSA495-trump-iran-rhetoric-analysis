# Trump Truth Social Rhetoric Around UCDP Iran Events

A computational text analysis asking: **how does Donald Trump's Iran-related Truth Social rhetoric change in the day before, day of, and day after UCDP-recorded U.S. or joint U.S.–Israel conflict events, and is threat language elevated beforehand?**

The finished, interactive visualization lives on my portfolio site:
**[strokeofluck.github.io/sean-data-portfolio/projects/assets/political-text-analysis/trump-iran-connected-timeline.html](https://strokeofluck.github.io/sean-data-portfolio/projects/assets/political-text-analysis/trump-iran-connected-timeline.html)**

with the full write-up (methodology, limitations, findings) at
**[strokeofluck.github.io/sean-data-portfolio/projects/political-text-analysis.html](https://strokeofluck.github.io/sean-data-portfolio/projects/political-text-analysis.html)**

## What's in this repo

- `Trump_Iran_Connected_Timeline_ZeroShot_Colab.ipynb` — the Colab notebook that loads the event-window data, runs a Hugging Face multi-label zero-shot classifier (`facebook/bart-large-mnli`) over Trump's Truth Social posts, aggregates event-balanced day-before/day-of/day-after means, and builds a connected interactive HTML timeline.
- `data/trump_iran_event_windows_unique_dates.csv` — Trump's Iran-related Truth Social posts (Hugging Face archive, 2026 calendar year) already windowed against UCDP event dates (day before / day of / day after).
- `data/UCDP_Iran_US_or_Joint_US_Involvement_2026_through_July.xlsx` — the UCDP Georeferenced Event Dataset, filtered to US or joint US-Israel involvement in the Iran conflict.
- `data/trump_iran_zero_shot_scores_26event_subset.csv` — the zero-shot scores actually used in the 26-event curated timeline shown on the site (87 unique posts). **This is a subset**, not the full scored corpus (the underlying event-window data covers 393 unique event-dates / 543 UCDP records; only a curated 26 of those events are shown in the connected timeline). The notebook's cache-check will correctly detect this as incomplete and re-run the classifier over the full post set if you run it from scratch.

## Rhetorical frames

Six multi-label zero-shot categories, scored independently (a post can score high on more than one):

- **Threat** - military threats, escalation, retaliation, ultimatums, strikes
- **Victory** - claims of success, Iranian weakness, defeat, decimation
- **Diplomacy** - negotiations, talks, deals, communication
- **Ceasefire / Ending** - stopping operations, ending the conflict
- **Blame Allies** - criticizing NATO/European allies for not helping
- **Media Criticism** - attacking press coverage as biased or fake

A seventh label, **Self-Credit** (the speaker personally taking credit for outcomes), was tried and dropped - it scored near-ceiling on almost every post regardless of timing, making it a constant feature of the voice rather than a useful signal.

## Key finding

Average Threat language is *higher the day before* a UCDP event (0.55) than on the event day itself (0.52) or the day after (0.48) - visible in individual posts too, e.g. a day-before post naming "Power Plant Day, and Bridge Day" ahead of further strikes. See the full write-up for limitations, including the lack of a counterfactual baseline (this doesn't compare against day-before language on dates where no strike occurred).

## Colab notebook vs. live page

Here, **the notebook means the Colab file** `Trump_Iran_Connected_Timeline_ZeroShot_Colab.ipynb`.

The Colab does the actual analysis: it loads the event-window data, runs the zero-shot model, calculates the scores and event-balanced comparisons, and generates the base connected timeline.

The live portfolio page starts from that output and then adds presentation-only changes such as spacing, alignment, navigation controls, badges, and headline text. Those edits change how the visualization looks and behaves, not the underlying scores or event-window calculations.

So rerunning the Colab reproduces the analysis and base visualization, but it may not look pixel-for-pixel identical to the version on the portfolio site.

## Data sources

- Trump's Truth Social posts: a public Hugging Face archive of his original posts (not reblogs), filtered to calendar-year 2026 and posts mentioning Iran.
- UCDP conflict events: the [Uppsala Conflict Data Program](https://ucdp.uu.se/)'s Georeferenced Event Dataset, filtered to events with US or joint US-Israel involvement in the Iran conflict.

## Methodology references

- [DSA 495 Module 4: Zero-Shot and Few-Shot Classification](references/DSA495_M04_class_reference.md) — class material covering zero-shot and few-shot classification, development vs. held-out evaluation, precision, recall, F1/macro-F1, confusion matrices, and the NLI connection relevant to `facebook/bart-large-mnli`.

## Part of

[sean-data-portfolio](https://github.com/StrokeOfLuck/sean-data-portfolio) - Sean Ryan's data journalism portfolio.
