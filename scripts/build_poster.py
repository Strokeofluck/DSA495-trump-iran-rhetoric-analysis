"""Rebuild the poster evidence from committed scores; Python standard library only.

This does not rerun BART or establish classification accuracy. Run from any folder:
    python scripts/build_poster.py
"""
from pathlib import Path
import csv
import hashlib
import json
import math
from collections import defaultdict, Counter
from datetime import date
from statistics import mean
from poster_evidence import WORKBOOK, build_context

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / 'data'
DOCS = ROOT / 'docs'
FRAMES = ['Threat', 'Victory', 'Diplomacy', 'Ceasefire / Ending', 'Blame Allies', 'Media Criticism']
WINDOWS = [-1, 0, 1]

def read(name):
    with (DATA / name).open(encoding='utf-8-sig', newline='') as handle:
        return list(csv.DictReader(handle))

def main():
    rows = read('trump_iran_event_windows_unique_dates.csv')
    score_rows = read('trump_iran_zero_shot_scores_26event_subset.csv')
    scores = {r['truth_id']: {f: float(r[f]) for f in FRAMES} for r in score_rows}
    assert len(scores) == len(score_rows), 'Duplicate score IDs'
    assert set(scores) == {r['truth_id'] for r in rows}, 'Unmatched score IDs'
    assert all(math.isfinite(v) and 0 <= v <= 1 for s in scores.values() for v in s.values())
    groups, posts, pairs = defaultdict(list), {}, set()
    for row in rows:
        tid = row['truth_id']
        assert row['content_text'].strip(), 'Missing post text'
        if tid in posts:
            assert posts[tid]['content_text'] == row['content_text'], 'Conflicting text'
        posts[tid] = row
        pair = (row['event_date'], tid)
        assert pair not in pairs, 'Duplicate post / event pair'
        pairs.add(pair)
        window = int(row['relative_day'])
        assert window in WINDOWS
        assert (date.fromisoformat(row['post_date_et']) - date.fromisoformat(row['event_date'])).days == window
        groups[(row['event_date'], window)].append(row)
    dates = sorted({r['event_date'] for r in rows})
    event_means = {k: {f: mean(scores[r['truth_id']][f] for r in rs) for f in FRAMES} for k, rs in groups.items()}
    summaries = {}
    for mode in ['available']:
        selected = dates
        summaries[mode] = {
            'dates': len(selected),
            'coverage': [sum((d, w) in groups for d in selected) for w in WINDOWS],
            'rows': [sum(len(groups.get((d, w), [])) for d in selected) for w in WINDOWS],
            'means': {f: [mean(event_means[(d, w)][f] for d in selected if (d, w) in event_means) for w in WINDOWS] for f in FRAMES},
        }
    appearances = Counter(r['truth_id'] for r in rows)
    context = build_context(DATA/WORKBOOK, dates, groups, event_means, scores, FRAMES)
    example_ids = ['116302505060458396', '116366072136989268']
    evidence = {
        'frames': FRAMES, 'windows': WINDOWS,
        'snapshot': {'posts': len(posts), 'pairs': len(pairs), 'dates': len(dates), 'first': dates[0], 'last': dates[-1],
                     'overlapping_posts': sum(n > 1 for n in appearances.values()), 'extra_links': len(rows)-len(posts)},
        'summaries': summaries,
        'event_context': context,
        'coverage': [{'date': d, 'counts': [len(groups.get((d, w), [])) for w in WINDOWS]} for d in dates],
        'examples': [{'id': tid, 'text': posts[tid]['content_text'], 'source': posts[tid]['source_url'],
                      'url': posts[tid]['truth_url'], 'date': posts[tid]['post_date_et'], 'scores': scores[tid]} for tid in example_ids],
        'inputs': [{'path': 'data/'+name, 'sha256': hashlib.sha256((DATA/name).read_bytes()).hexdigest()} for name in ['trump_iran_event_windows_unique_dates.csv', 'trump_iran_zero_shot_scores_26event_subset.csv',WORKBOOK]],
        'limitations': ['Saved model scores, not a fresh inference run.', 'No human-labeled evaluation supplied.', 'Non-independent overlapping windows.', 'Source snapshot and model revision are not pinned.'],
    }
    DOCS.mkdir(exist_ok=True)
    (DOCS/'portfolio.css').write_text((ROOT/'scripts/portfolio.css').read_text(encoding='utf-8'), encoding='utf-8')
    for asset in ['poster-interactions.js','poster-print.css']:
        (DOCS/asset).write_text((ROOT/'scripts'/asset).read_text(encoding='utf-8'),encoding='utf-8')
    (DOCS/'evidence.json').write_text(json.dumps(evidence, ensure_ascii=False, indent=2)+'\n', encoding='utf-8')
    (DOCS/'severity-results.json').write_text(json.dumps(context['severity'],ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    with (DOCS/'frame-means.csv').open('w', newline='', encoding='utf-8') as handle:
        writer=csv.writer(handle)
        writer.writerow(['scope', 'frame', 'relative_day', 'mean_entailment_score', 'contributing_dates', 'post_event_pairs'])
        for mode, summary in summaries.items():
            for f in FRAMES:
                for i,w in enumerate(WINDOWS):
                    writer.writerow([mode,f,w,summary['means'][f][i],summary['coverage'][i],summary['rows'][i]])
    inline = json.dumps(evidence, ensure_ascii=False).replace('<','\\u003c')
    asset_version = hashlib.sha256(b''.join((DOCS/name).read_bytes() for name in ['portfolio.css','poster-interactions.js','poster-print.css'])).hexdigest()[:12]
    for source_name, output_name in [
        ('poster.template.html', 'index.html'),
        ('evidence.template.html', 'evidence.html'),
        ('presentation-notes.template.html', 'presentation-notes.html'),
    ]:
        template = (ROOT/'scripts'/source_name).read_text(encoding='utf-8')
        assert template.count('__EVIDENCE_JSON__') == (0 if output_name == 'presentation-notes.html' else 1)
        rendered=template.replace('__EVIDENCE_JSON__', inline)
        for asset in ['portfolio.css','poster-interactions.js','poster-print.css']:
            rendered=rendered.replace('"'+asset+'"','"'+asset+'?v='+asset_version+'"')
        (DOCS/output_name).write_text(rendered, encoding='utf-8')
    print(json.dumps({'snapshot':evidence['snapshot'], 'available':summaries['available'], 'checks':'ID joins, finite score range, unique pairs, consistent text, and ET date offsets passed'}, indent=2))

if __name__ == '__main__':
    main()
