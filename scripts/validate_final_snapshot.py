"""Validate the frozen source membership, joins, score reuse, and arithmetic.

Optional --archive and --ucdp-source validate exact upstream downloaded bytes
and complete filtered extraction, in addition to the committed-data checks.
"""
import argparse,csv,gzip,hashlib,json,math,re
from collections import defaultdict
from datetime import datetime,date
from pathlib import Path
from statistics import fmean
from zoneinfo import ZoneInfo

ROOT=Path(__file__).resolve().parents[1];DATA=ROOT/'data'
FRAMES=['Threat','Victory','Diplomacy','Ceasefire / Ending','Blame Allies','Media Criticism']
def read(path):
    with path.open(encoding='utf-8-sig',newline='') as f:return list(csv.DictReader(f))
def normalized(text):return re.sub(r'\s+',' ',text).strip()
def main():
    parser=argparse.ArgumentParser();parser.add_argument('--archive',type=Path);parser.add_argument('--ucdp-source',type=Path);args=parser.parse_args()
    manifest=json.loads((DATA/'analysis_manifest.json').read_text(encoding='utf-8'))
    for name,expected in manifest['file_sha256'].items():
        actual=hashlib.sha256((DATA/name).read_text(encoding='utf-8').encode()).hexdigest()
        assert actual==expected,('file changed',name)
    source=read(DATA/manifest['files']['source_events']);selected=read(DATA/manifest['files']['events'])
    assert len(source)==len({r['id'] for r in source})==511
    source_map={r['id']:r for r in source};review=json.loads((DATA/manifest['files']['selection_review']).read_text(encoding='utf-8'))
    assert set(review['decisions'])=={r['id'] for r in source if r['conflict_new_id']=='16905'}
    assert {r['id'] for r in selected}=={id for id,d in review['decisions'].items() if d['included']}
    assert len(selected)==len({r['id'] for r in selected})==75
    for row in selected:
        original=source_map[row['id']]
        for key,value in original.items():
            assert row[key]==(value[:10] if key in ['date_start','date_end'] else value),(row['id'],key)
        assert '2026-01-01'<=row['date_start']<=row['date_end']<=manifest['ucdp_coverage_through']
    posts=read(DATA/manifest['files']['posts']);postmap={r['truth_id']:r for r in posts}
    assert len(posts)==len(postmap)==380
    legacy_ids={r['truth_id'] for r in read(DATA/'trump_iran_event_windows_unique_dates.csv')}
    timezone=ZoneInfo('America/New_York')
    for row in posts:
        assert row['post_type']=='original' and row['content_text'].strip()
        assert row['truth_id'] in legacy_ids or re.search(r'\b(?:iran(?:ian)?|tehran|hormuz|khamenei)\b',row['content_text'],re.I)
        local=datetime.fromisoformat(row['created_at_utc'].replace('Z','+00:00')).astimezone(timezone)
        assert local.year==2026 and local.isoformat()==row['created_at_et'] and local.date().isoformat()==row['post_date_et']
    dates={r['date_start'] for r in selected};assert len(dates)==43
    windows=read(DATA/manifest['files']['windows'])
    actual={(r['truth_id'],r['event_date'],int(r['relative_day'])) for r in windows}
    assert len(actual)==len(windows)==235
    expected={(p['truth_id'],d,(date.fromisoformat(p['post_date_et'])-date.fromisoformat(d)).days) for p in posts for d in dates if abs((date.fromisoformat(p['post_date_et'])-date.fromisoformat(d)).days)<=1}
    assert actual==expected,'Incomplete or extra window membership'
    for row in windows:
        assert all(row[k]==v for k,v in postmap[row['truth_id']].items()),row['truth_id']
    scores=read(DATA/manifest['files']['scores']);scoremap={r['truth_id']:r for r in scores}
    assert len(scores)==len(scoremap)==130 and set(scoremap)=={r['truth_id'] for r in windows}
    for row in scores:assert all(math.isfinite(float(row[f])) and 0<=float(row[f])<=1 for f in FRAMES)
    old_scores={r['truth_id']:r for r in read(DATA/'legacy/august_frame_scores.csv')}
    old_posts={r['truth_id']:r for r in read(DATA/'legacy/august_post_windows.csv')}
    reused=0
    for id,old in old_scores.items():
        if id in scoremap and normalized(old_posts[id]['content_text'])==normalized(postmap[id]['content_text']):
            assert all(float(scoremap[id][f])==float(old[f]) for f in FRAMES),('reused score changed',id)
            reused+=1
    assert reused==90 and len(scoremap)-reused==40
    grouped=defaultdict(list)
    for row in windows:grouped[(row['event_date'],int(row['relative_day']))].append(row['truth_id'])
    evidence=json.loads((ROOT/'docs/evidence.json').read_text(encoding='utf-8'))
    for frame in FRAMES:
        for index,offset in enumerate([-1,0,1]):
            values=[sum(float(scoremap[id][frame]) for id in ids)/len(ids) for (d,w),ids in grouped.items() if w==offset]
            value=sum(values)/len(values)
            assert math.isclose(value,evidence['summaries']['available']['means'][frame][index],rel_tol=0,abs_tol=1e-12)
    assert evidence['summaries']['available']['coverage']==[36,35,35]
    assert evidence['snapshot']['dates']==43 and len(evidence['event_context']['events'])==43
    assert next(r for r in evidence['coverage'] if r['date']=='2026-07-30')['counts']==[0,0,0]
    if args.archive:
        assert hashlib.sha256(args.archive.read_bytes()).hexdigest()==manifest['post_archive']['sha256']
        archive=[json.loads(line) for line in gzip.open(args.archive,'rt',encoding='utf-8')]
        assert len(archive)==len({str(p['truth_id']) for p in archive})==38045
        eligible=[]
        for row in archive:
            if not row.get('created_at_utc') or row['post_type']!='original' or not row.get('content_text','').strip():continue
            if str(row['truth_id']) not in legacy_ids and not re.search(r'\b(?:iran(?:ian)?|tehran|hormuz|khamenei)\b',row['content_text'],re.I):continue
            if datetime.fromisoformat(row['created_at_utc'].replace('Z','+00:00')).astimezone(timezone).year==2026:eligible.append(row)
        assert {str(p['truth_id']) for p in eligible}==set(postmap)
        lf=lambda value:value.replace('\r\n','\n').replace('\r','\n')
        assert all(lf(row['content_text'])==lf(postmap[str(row['truth_id'])]['content_text']) for row in eligible)
    if args.ucdp_source:
        assert hashlib.sha256(args.ucdp_source.read_bytes()).hexdigest()==manifest['ucdp_source']['sha256']
        all_source=read(args.ucdp_source)
        iran=[r for r in all_source if r['country']=='Iran']
        assert len(all_source)==16633 and {r['id'] for r in iran}==set(source_map)
        lf=lambda value:value.replace('\r\n','\n').replace('\r','\n')
        assert all(all(lf(source_map[r['id']][key])==lf(value) for key,value in r.items()) for r in iran)
    print('PASS: complete source extraction, reviewed IDs, 75 events / 43 starts, 380 eligible posts, 130 matched IDs / 235 pairs, 90 reused scores, 40 new scores, all frame means, and empty July 30 coverage. Raw-source byte checks apply when paths are supplied.')

if __name__=='__main__':main()
