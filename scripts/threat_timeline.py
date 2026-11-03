"""Calendar-time Threat summaries from the same frozen full text corpus."""
import csv,json,math
from collections import defaultdict
from datetime import date,timedelta
from pathlib import Path
from statistics import mean

ANCHOR=date(2026,2,28)
def build_timeline(data):
    with (data/'threat_timeline_scores.csv').open(encoding='utf-8-sig',newline='') as f:rows=list(csv.DictReader(f))
    assert len(rows)==len({r['truth_id'] for r in rows})==380
    for r in rows:r['Threat']=float(r['Threat']);assert math.isfinite(r['Threat']) and 0<=r['Threat']<=1
    groups=defaultdict(list);monthly=defaultdict(list)
    for r in rows:
        d=date.fromisoformat(r['post_date_et']);groups[(d-ANCHOR).days//14].append(r);monthly[d.strftime('%Y-%m')].append(r)
    source_start=date(2026,1,1);source_end=date(2026,11,3)
    bins=[]
    for index in range((source_start-ANCHOR).days//14,(source_end-ANCHOR).days//14+1):
        first=ANCHOR+timedelta(days=14*index);last=first+timedelta(days=13)
        clip_first=max(first,source_start);clip_last=min(last,source_end);members=groups[index]
        bins.append({'index':index,'first':str(clip_first),'last':str(clip_last),'full_period_first':str(first),'full_period_last':str(last),'midpoint':str(clip_first+(clip_last-clip_first)//2),'partial':first<source_start or last>source_end,'posts':len(members),'mean':mean(r['Threat'] for r in members) if members else None,'post_ids':[r['truth_id'] for r in members]})
    focus=next(b for b in bins if b['index']==0);following=next(b for b in bins if b['index']==1)
    return {'provenance':json.loads((data/'threat_timeline_provenance.json').read_text(encoding='utf-8')),'posts':len(rows),'period':'2026-01-01 to 2026-11-03','bins':bins,'opening':focus,'following':following,'monthly':[{'month':m,'posts':len(rs),'mean':mean(r['Threat'] for r in rs),'partial':m=='2026-11'} for m,rs in sorted(monthly.items())],'scope':'All 380 original Iran-related text posts in the frozen corpus. Calendar-time post means; independent of UCDP event-window matching. Scores are uncalibrated; no uncertainty intervals estimated.'}
