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
from poster_evidence import WORKBOOK, build_context, read_records
from threat_timeline import build_timeline

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / 'data'
DOCS = ROOT / 'docs'
FRAMES = ['Threat', 'Victory', 'Diplomacy', 'Ceasefire / Ending', 'Blame Allies', 'Media Criticism']
WINDOWS = [-1, 0, 1]

def read(name):
    with (DATA / name).open(encoding='utf-8-sig', newline='') as handle:
        return list(csv.DictReader(handle))

def main():
    manifest_path=DATA/'analysis_manifest.json'
    manifest=json.loads(manifest_path.read_text(encoding='utf-8')) if manifest_path.exists() else {}
    window_file=manifest.get('files',{}).get('windows','trump_iran_event_windows_unique_dates.csv')
    score_file=manifest.get('files',{}).get('scores','trump_iran_zero_shot_scores_26event_subset.csv')
    event_file=manifest.get('files',{}).get('events',WORKBOOK)
    rows = read(window_file)
    score_rows = read(score_file)
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
    selected_records=read_records(DATA/event_file)
    dates = sorted({r['date_start'] for r in selected_records})
    assert {r['event_date'] for r in rows}<=set(dates), 'Unmatched event dates'
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
    threat_periods=[]
    for key,label,first,last in [('opening','Opening two weeks','2026-02-28','2026-03-13'),('later','Later event dates','2026-03-14',dates[-1])]:
        selected=[d for d in dates if first<=d<=last]
        threat_periods.append({'key':key,'label':label,'first':first,'last':last,'selected_dates':len(selected),
            'coverage':[sum((d,w) in groups for d in selected) for w in WINDOWS],
            'pairs':[sum(len(groups.get((d,w),[])) for d in selected) for w in WINDOWS],
            'means':[mean(event_means[(d,w)]['Threat'] for d in selected if (d,w) in event_means) for w in WINDOWS]})
    context = build_context(DATA/event_file, dates, groups, event_means, scores, FRAMES)
    example_ids = ['116302505060458396', '116366072136989268']
    evidence = {
        'frames': FRAMES, 'windows': WINDOWS,
        'snapshot': {'posts': len(posts), 'pairs': len(pairs), 'dates': len(dates), 'first': dates[0], 'last': dates[-1],
                     'overlapping_posts': sum(n > 1 for n in appearances.values()), 'extra_links': len(rows)-len(posts)},
        'summaries': summaries,
        'event_context': context,
        'provenance': manifest,
        'threat_timeline': build_timeline(DATA),
        'threat_period_windows':threat_periods,
        'coverage': [{'date': d, 'counts': [len(groups.get((d, w), [])) for w in WINDOWS]} for d in dates],
        'examples': [{'id': tid, 'text': posts[tid]['content_text'], 'source': posts[tid]['source_url'],
                      'url': posts[tid]['truth_url'], 'date': posts[tid]['post_date_et'], 'scores': scores[tid]} for tid in example_ids],
        'inputs': [{'path': 'data/'+name, 'sha256': hashlib.sha256((DATA/name).read_text(encoding='utf-8').encode('utf-8') if (DATA/name).suffix in ['.csv','.json'] else (DATA/name).read_bytes()).hexdigest(), 'hash_format':'UTF-8 with LF line endings' if (DATA/name).suffix in ['.csv','.json'] else 'original bytes'} for name in [window_file,score_file,event_file]],
        'limitations': ['No human-labeled evaluation supplied.', 'Non-independent overlapping windows.', '90 retained legacy scores have an unpinned original model revision; 40 new scores use the documented pinned revision.' if manifest else 'Source snapshot and original model revision are not pinned.'],
    }
    DOCS.mkdir(exist_ok=True)
    (DOCS/'portfolio.css').write_text((ROOT/'scripts/portfolio.css').read_text(encoding='utf-8'), encoding='utf-8')
    for asset in ['poster-interactions.js','poster-print.css','poster-layout.css','poster-layout.js']:
        (DOCS/asset).write_text((ROOT/'scripts'/asset).read_text(encoding='utf-8'),encoding='utf-8')
    (DOCS/'evidence.json').write_text(json.dumps(evidence, ensure_ascii=False, indent=2)+'\n', encoding='utf-8')
    (DOCS/'severity-results.json').write_text(json.dumps(context['severity'],ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    with (DOCS/'threat-period-windows.csv').open('w',newline='',encoding='utf-8') as handle:
        writer=csv.writer(handle);writer.writerow(['period','first_event_start','last_event_start','selected_dates','relative_day','contributing_dates','post_event_pairs','mean_Threat'])
        for p in threat_periods:
            for i,w in enumerate(WINDOWS):writer.writerow([p['key'],p['first'],p['last'],p['selected_dates'],w,p['coverage'][i],p['pairs'][i],p['means'][i]])
    with (DOCS/'threat-timeline.csv').open('w',newline='',encoding='utf-8') as handle:
        writer=csv.DictWriter(handle,fieldnames=['first','last','posts','mean','partial'])
        writer.writeheader()
        for b in evidence['threat_timeline']['bins']:writer.writerow({k:b[k] for k in writer.fieldnames})
    with (DOCS/'frame-means.csv').open('w', newline='', encoding='utf-8') as handle:
        writer=csv.writer(handle)
        writer.writerow(['scope', 'frame', 'relative_day', 'mean_entailment_score', 'contributing_dates', 'post_event_pairs'])
        for mode, summary in summaries.items():
            for f in FRAMES:
                for i,w in enumerate(WINDOWS):
                    writer.writerow([mode,f,w,summary['means'][f][i],summary['coverage'][i],summary['rows'][i]])
    inline = json.dumps(evidence, ensure_ascii=False).replace('<','\\u003c')
    summary=summaries['available']
    victory=summary['means']['Victory'];threat=summary['means']['Threat']
    victory_line='Victory scores peak on event days.' if victory[1]>max(victory[0],victory[2]) else 'Victory scores vary across windows.'
    threat_line='Threat scores peak on event days.' if threat[1]>max(threat[0],threat[2]) else 'Threat scores decline across windows.' if threat[0]>=threat[1]>=threat[2] else 'Threat scores vary across windows.'
    replacements={
        '__CORPUS_COUNT__':str(evidence['threat_timeline']['posts']),
        '__OPENING_THREAT__':f"{evidence['threat_timeline']['opening']['mean']:.3f}",
        '__FOLLOWING_THREAT__':f"{evidence['threat_timeline']['following']['mean']:.3f}",
        '__POST_COUNT__':str(len(posts)), '__DATE_COUNT__':str(len(dates)),
        '__PAIR_COUNT__':str(len(pairs)), '__EVENT_COUNT__':str(len(selected_records)),
        '__COVERAGE__':' / '.join(map(str,summary['coverage'])),
        '__VICTORY_VALUES__':' → '.join(f'{v:.3f}' for v in victory),
        '__THREAT_VALUES__':' → '.join(f'{v:.3f}' for v in threat),
        '__VICTORY_DAY__':f'{victory[1]:.3f}',
        '__FINDING_HEADLINE__':'Opening-period Threat scores decline across event windows.',
        '__OPENING_WINDOW_VALUES__':' → '.join(f'{v:.3f}' for v in threat_periods[0]['means']),
        '__FINDING_SPOKEN__':'For event starts in February 28 to March 13, mean Threat scores are 0.638 before, 0.603 on the start date, and 0.485 after. Later dates show 0.517, 0.555, and 0.462. Each point averages event-date/window means; these are selected, overlapping windows, and no causal or accuracy claim is made. Across all dates, '+victory_line+' '+threat_line,
    }
    asset_version = hashlib.sha256(b''.join((DOCS/name).read_bytes() for name in ['portfolio.css','poster-interactions.js','poster-print.css','poster-layout.css','poster-layout.js'])).hexdigest()[:12]
    for source_name, output_name in [
        ('poster.template.html', 'index.html'),
        ('evidence.template.html', 'evidence.html'),
        ('presentation-notes.template.html', 'presentation-notes.html'),
    ]:
        template = (ROOT/'scripts'/source_name).read_text(encoding='utf-8')
        assert template.count('__EVIDENCE_JSON__') == (0 if output_name == 'presentation-notes.html' else 1)
        rendered=template.replace('__EVIDENCE_JSON__', inline)
        for key,value in replacements.items():rendered=rendered.replace(key,value)
        assert not __import__('re').search(r'__[A-Z_]+__',rendered), 'Unfilled template placeholder'
        for asset in ['portfolio.css','poster-interactions.js','poster-print.css','poster-layout.css','poster-layout.js']:
            rendered=rendered.replace('"'+asset+'"','"'+asset+'?v='+asset_version+'"')
        rendered=rendered.replace('href="research-poster.pdf"','href="research-poster.pdf?v='+asset_version+'"')
        (DOCS/output_name).write_text(rendered, encoding='utf-8')
    print(json.dumps({'snapshot':evidence['snapshot'], 'available':summaries['available'], 'checks':'ID joins, finite score range, unique pairs, consistent text, and ET date offsets passed'}, indent=2))

if __name__ == '__main__':
    main()
