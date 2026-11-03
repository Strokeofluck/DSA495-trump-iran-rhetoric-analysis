"""Optional offline rerun: --model-dir PATH --output-dir PATH.

Requires the documented Torch/Transformers versions and pinned cached model.
Outputs are separate from committed data; compare before replacing them.
"""
import argparse,csv,hashlib,json,os,re
from pathlib import Path

def main():
    parser=argparse.ArgumentParser()
    parser.add_argument('--model-dir',type=Path,required=True)
    parser.add_argument('--output-dir',type=Path,required=True)
    args=parser.parse_args()
    os.environ['HF_HUB_OFFLINE']='1'
    os.environ['TOKENIZERS_PARALLELISM']='false'
    import torch,transformers
    from transformers import pipeline
    root=Path(__file__).resolve().parents[1]
    provenance=json.loads((root/'data/threat_timeline_provenance.json').read_text())
    assert args.model_dir.name==provenance['revision'],'Use the exact pinned snapshot directory'
    torch.set_num_threads(4)
    classifier=pipeline('zero-shot-classification',model=str(args.model_dir),tokenizer=str(args.model_dir),device=-1,local_files_only=True)
    with (root/'data/iran_original_posts_snapshot_2026-11-03.csv').open(encoding='utf-8-sig',newline='') as handle:posts=list(csv.DictReader(handle))
    posts=[p for p in posts if re.search(r'\b(?:iran(?:ian)?|tehran|hormuz|khamenei)\b',p['content_text'],re.I)]
    assert len(posts)==380
    args.output_dir.mkdir(parents=True,exist_ok=True)
    rows=[]
    for post in posts:
        result=classifier(post['content_text'],candidate_labels=provenance['candidate_labels'],multi_label=True,hypothesis_template=provenance['hypothesis_template'],truncation=True)
        rows.append({'truth_id':post['truth_id'],'post_date_et':post['post_date_et'],'Threat':float(result['scores'][0]),'text_sha256_lf':hashlib.sha256(post['content_text'].replace('\r\n','\n').replace('\r','\n').encode()).hexdigest()})
        if len(rows)%20==0:print(f'{len(rows)}/380',flush=True)
    with (args.output_dir/'threat_timeline_scores.csv').open('w',encoding='utf-8',newline='') as handle:
        writer=csv.DictWriter(handle,fieldnames=list(rows[0]),lineterminator='\n');writer.writeheader();writer.writerows(rows)
    provenance.update(torch=torch.__version__,transformers=transformers.__version__)
    (args.output_dir/'threat_timeline_provenance.json').write_text(json.dumps(provenance,indent=2)+'\n',encoding='utf-8')

if __name__=='__main__':main()
