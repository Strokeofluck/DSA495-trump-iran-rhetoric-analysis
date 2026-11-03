"""Read the committed workbook and derive inspectable severity/timeline evidence.

The XLSX reader intentionally reads values only; it never evaluates formulas.
Date serials are interpreted using the workbook's declared date system.
"""
from collections import defaultdict
import csv
from datetime import datetime, timedelta
import math
from pathlib import PurePosixPath
from statistics import mean
from xml.etree import ElementTree as ET
from zipfile import ZipFile

WORKBOOK = 'UCDP_Iran_US_or_Joint_US_Involvement_2026_through_July.xlsx'
NS = {'x':'http://schemas.openxmlformats.org/spreadsheetml/2006/main'}

def read_records(path):
    if path.suffix.lower()=='.csv':
        with path.open(encoding='utf-8-sig',newline='') as handle:
            records=list(csv.DictReader(handle))
        for record in records:
            for key in ['date_start','date_end']:record[key]=record[key][:10]
            for key in ['best','low','high']:
                record[key]=float(record[key])
                assert math.isfinite(record[key]) and record[key]>=0
            assert record['date_start']<=record['date_end']
            record['bounds_valid']=record['low']<=record['best']<=record['high']
        assert len(records)==len({r['id'] for r in records})
        return records
    with ZipFile(path) as archive:
        workbook=ET.fromstring(archive.read('xl/workbook.xml'))
        prop=workbook.find('x:workbookPr',NS)
        base=datetime(1904,1,1) if prop is not None and prop.get('date1904') in ('1','true') else datetime(1899,12,30)
        sheet=next(s for s in workbook.findall('x:sheets/x:sheet',NS) if s.get('name')=='US-involved events')
        rid=sheet.get('{http://schemas.openxmlformats.org/officeDocument/2006/relationships}id')
        links=ET.fromstring(archive.read('xl/_rels/workbook.xml.rels'))
        target=next(r.get('Target') for r in links if r.get('Id')==rid)
        target=target.lstrip('/') if target.startswith('/') else str(PurePosixPath('xl')/target)
        strings=[]
        if 'xl/sharedStrings.xml' in archive.namelist():
            strings=[''.join(n.itertext()) for n in ET.fromstring(archive.read('xl/sharedStrings.xml'))]
        values=[]
        for row in ET.fromstring(archive.read(target)).findall('x:sheetData/x:row',NS):
            data={}
            for cell in row.findall('x:c',NS):
                if cell.find('x:f',NS) is not None:
                    raise ValueError('Workbook contains formulas; use documented saved values.')
                letters=''.join(c for c in cell.get('r') if c.isalpha())
                index=0
                for char in letters:index=index*26+ord(char)-64
                node=cell.find('x:v',NS)
                value=node.text if node is not None else ''
                if cell.get('t')=='s':value=strings[int(value)]
                elif cell.get('t')=='inlineStr':value=''.join(cell.find('x:is',NS).itertext())
                data[index-1]=value or ''
            values.append(data)
    headers=values[0]
    records=[]
    for row in values[1:]:
        record={name:row.get(i,'') for i,name in headers.items()}
        if not record.get('id'):continue
        for key in ['date_start','date_end']:
            raw=record[key]
            try:record[key]=(base+timedelta(days=float(raw))).date().isoformat()
            except ValueError:record[key]=datetime.fromisoformat(raw).date().isoformat()
        for key in ['best','low','high']:
            record[key]=float(record[key])
            assert math.isfinite(record[key]) and record[key]>=0
        record['bounds_valid']=record['low']<=record['best']<=record['high']
        assert record['date_start']<=record['date_end']
        records.append({key:record[key] for key in ['id','date_start','date_end','best','low','high','bounds_valid','us_involvement','source_headline','where_coordinates','ucdp_release']})
    assert len({r['id'] for r in records})==len(records)
    return records

def ranks(values):
    return [1+sum(other<v for other in values)+(values.count(v)-1)/2 for v in values]

def spearman(rows,frame):
    if len(rows)<3:return None
    x=ranks([r['fatalities'] for r in rows]);y=ranks([r['means'][frame] for r in rows])
    dx=[v-mean(x) for v in x];dy=[v-mean(y) for v in y]
    denom=math.sqrt(sum(v*v for v in dx)*sum(v*v for v in dy))
    return sum(a*b for a,b in zip(dx,dy))/denom if denom else None

def build_context(path,dates,groups,event_means,scores,frames):
    records=read_records(path)
    by_date=defaultdict(list)
    for record in records:by_date[record['date_start']].append(record)
    context=[]
    for day in dates:
        starting=by_date[day]
        same=[r for r in starting if r['date_end']==day]
        windows={}
        for offset in [-1,0,1]:
            windows[str(offset)]=[
                {**{key:p[key] for key in ['truth_id','content_text','source_url','truth_url','created_at_et','post_date_et']},'scores':scores[p['truth_id']]}
                for p in sorted(groups.get((day,offset),[]),key=lambda p:p['created_at_et'])
            ]
        context.append({'date':day,'records':starting,'same_day_records':len(same),'bounds_valid':all(r['bounds_valid'] for r in same),
                        'fatalities':sum(r['best'] for r in same),'low':sum(r['low'] for r in same),
                        'high':sum(r['high'] for r in same),'windows':windows})
    largest=max(context,key=lambda r:r['fatalities'])
    severity={}
    for offset in [-1,0,1]:
        points=[{key:c[key] for key in ['date','fatalities','low','high','bounds_valid']}|
                {'count':len(c['windows'][str(offset)]),'means':event_means[(c['date'],offset)]}
                for c in context if c['same_day_records'] and c['fatalities']>0 and (c['date'],offset) in event_means]
        excluded=[p for p in points if p['date']!=largest['date']]
        severity[str(offset)]={'rows':points,'n':len(points),
            'spearman':{f:spearman(points,f) for f in frames[:4]},
            'without_largest_spearman':{f:spearman(excluded,f) for f in frames[:4]}}
    return {'events':context,'record_count':len(records),'releases':sorted({r['ucdp_release'] for r in records}),
            'inconsistent_bound_record_ids':[r['id'] for r in records if not r['bounds_valid']],
            'largest_date':largest['date'],'largest_fatalities':largest['fatalities'],'severity':severity}
