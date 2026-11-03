'use strict';
(() => {
  const paper=document.querySelector('.poster-page .paper');
  if(!paper)return;
  const stage=document.querySelector('.poster-stage'),fit=document.getElementById('fit-toggle');
  let fitMode=true;
  function resize(){
    if(innerWidth<1000){paper.style.transform='';stage.style.width='';stage.style.height='';return}
    const scale=fitMode?Math.min(1,(innerWidth-40)/1800):1;
    paper.style.transform=`scale(${scale})`;
    stage.style.width=`${1800*scale}px`;stage.style.height=`${paper.offsetHeight*scale}px`;
  }
  fit.addEventListener('click',()=>{fitMode=!fitMode;fit.textContent=fitMode?'Read at full size':'Fit poster to width';fit.setAttribute('aria-pressed',String(fitMode));resize()});
  window.addEventListener('resize',resize);
  new ResizeObserver(resize).observe(paper);
  document.fonts.ready.then(resize);resize();

  const data=JSON.parse(document.getElementById('evidence-data').textContent);
  const unique=new Map();
  for(const event of data.event_context.events)for(const posts of Object.values(event.windows))for(const post of posts)unique.set(post.truth_id,post);
  const posts=[...unique.values()].sort((a,b)=>a.created_at_et.localeCompare(b.created_at_et)||a.truth_id.localeCompare(b.truth_id));
  const ribbon=document.querySelector('.post-ribbon'),track=document.getElementById('ribbon-track'),pause=document.getElementById('ribbon-pause');
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const savedMotion=sessionStorage.getItem('dsa495-post-strip');
  let paused=savedMotion==='running'?false:savedMotion==='paused'?true:reduced.matches;
  function updatePause(){ribbon.classList.toggle('is-paused',paused);pause.textContent=paused?'Resume scrolling':'Pause scrolling';pause.setAttribute('aria-pressed',String(paused))}
  pause.addEventListener('click',()=>{paused=!paused;sessionStorage.setItem('dsa495-post-strip',paused?'paused':'running');updatePause()});
  reduced.addEventListener('change',event=>{if(event.matches)paused=true;updatePause()});updatePause();
  const dialog=document.getElementById('post-dialog');
  document.getElementById('post-close').addEventListener('click',()=>dialog.close());

  const colors={'Threat':'#9a4949','Victory':'#4e7657','Diplomacy':'#4b719c','Ceasefire / Ending':'#7d6594','Blame Allies':'#b5752e','Media Criticism':'#2f8f95'};
  const el=(tag,cls,text)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(text!==undefined)e.textContent=text;return e};
  const short=text=>{const clean=text.replace(/\s+/g,' ').trim();return clean.length>270?clean.slice(0,270).replace(/\s+\S*$/,'')+'…':clean};
  function bars(post){
    const grid=el('div','post-score-grid');
    for(const frame of ['Threat','Diplomacy','Blame Allies','Victory','Ceasefire / Ending','Media Criticism']){
      const value=post.scores[frame],row=el('div','post-score');
      row.append(el('span','frame-name',frame==='Ceasefire / Ending'?'Ceasefire':frame));
      const rail=el('span','score-rail'),fill=el('span');fill.style.width=`${value*100}%`;fill.style.background=colors[frame];rail.append(fill);
      row.append(rail,el('b','score-value',value.toFixed(2)));grid.append(row);
    }return grid;
  }
  function open(post){
    document.getElementById('post-date').textContent=`Donald J. Trump · @realDonaldTrump · ${post.created_at_et} (Eastern Time)`;
    document.getElementById('post-full-text').textContent=post.content_text;
    document.getElementById('post-scores').replaceChildren(bars(post));
    document.getElementById('post-source').href=post.source_url;
    ribbon.classList.add('dialog-paused');dialog.showModal();
  }
  function card(post){
    const item=el('article','ribbon-card');
    const head=el('header','post-author'),avatar=el('span','post-avatar','DJT'),identity=el('div');avatar.setAttribute('aria-hidden','true');
    identity.append(el('b',null,'Donald J. Trump'),el('span',null,'@realDonaldTrump'));head.append(avatar,identity);
    const dominant=data.frames.reduce((best,f)=>post.scores[f]>post.scores[best]?f:best,data.frames[0]);
    const badge=el('span','frame-badge',dominant);badge.style.background=colors[dominant];head.append(badge);
    item.append(head,el('p','post-excerpt',short(post.content_text)),bars(post));
    const foot=el('footer','post-card-footer'),date=el('time',null,post.created_at_et.slice(0,16).replace('T',' ')+' ET');date.dateTime=post.created_at_et;
    const read=el('button','post-read','Read full post');read.type='button';read.addEventListener('click',()=>open(post));read.setAttribute('aria-label',`Read full post from ${post.created_at_et}`);
    const source=el('a',null,'Truth Social ↗');source.href=post.truth_url;source.target='_blank';source.rel='noopener';
    foot.append(date,read,source);item.append(foot);return item;
  }
  const group=el('div','ribbon-group');posts.forEach(post=>group.append(card(post)));track.append(group);
  dialog.addEventListener('close',()=>ribbon.classList.remove('dialog-paused'));
  // Same post cards form a seamless second loop; only the first loop has keyboard stops.
  const copy=el('div','ribbon-group');copy.setAttribute('aria-hidden','true');posts.forEach(post=>copy.append(card(post)));copy.querySelectorAll('button,a').forEach(e=>e.tabIndex=-1);track.append(copy);
  function speed(){track.style.setProperty('--ribbon-duration',`${group.offsetWidth/42}s`)}
  new ResizeObserver(speed).observe(group);speed();
  const print=document.getElementById('print-excerpts');
  posts.filter(post=>post.content_text.length>200).slice(0,2).forEach(post=>{const item=el('article','print-post');item.append(el('time',null,post.post_date_et+' · @realDonaldTrump · excerpt'),el('p',null,short(post.content_text)));print.append(item)});

  // Calendar-time means keep all later rebounds visible; empty periods remain gaps.
  const trend=data.threat_timeline,NS='http://www.w3.org/2000/svg';
  const svgEl=(name,attrs,text)=>{const e=document.createElementNS(NS,name);for(const[k,v]of Object.entries(attrs))e.setAttribute(k,v);if(text!==undefined)e.textContent=text;return e};
  const svg=svgEl('svg',{viewBox:'0 0 900 235',role:'img','aria-label':'Mean Threat by 14-day period, January 1 to November 3, 2026. February 28 to March 13 is 0.691, followed by 0.478. Later periods fluctuate.'});
  svg.append(svgEl('title',{},'Threat over time in all 380 archived Iran-related text posts'));
  const start=Date.parse('2026-01-01'),end=Date.parse('2026-11-04'),x=d=>50+(Date.parse(d)-start)/(end-start)*825,y=v=>190-v*157;
  svg.append(svgEl('rect',{x:x('2026-02-28'),y:28,width:x('2026-03-14')-x('2026-02-28'),height:162,fill:'#f7e8e8'}));
  [0,.25,.5,.75,1].forEach(v=>{svg.append(svgEl('line',{x1:50,x2:875,y1:y(v),y2:y(v),stroke:'#dce2e7'}));svg.append(svgEl('text',{x:40,y:y(v)+4,'text-anchor':'end','font-size':13,fill:'#64717b'},String(v)))});
  svg.append(svgEl('text',{x:50,y:17,'font-size':13,fill:'#64717b'},'Mean Threat score · 0–1'));
  let previous=null;
  trend.bins.forEach(b=>{
    if(b.mean===null){previous=null;return}
    if(previous)svg.append(svgEl('line',{x1:x(previous.midpoint),y1:y(previous.mean),x2:x(b.midpoint),y2:y(b.mean),stroke:'#9a4949','stroke-width':2}));
    const label=`${b.first} to ${b.last}${b.partial?' (partial)':''} · ${b.posts} posts · mean Threat ${b.mean.toFixed(3)}`;
    const point=svgEl('circle',{cx:x(b.midpoint),cy:y(b.mean),r:b.index===0?6:4,fill:b.index===0?'#813838':'#fff',stroke:'#9a4949','stroke-width':2,tabindex:0,role:'img','aria-label':label});point.append(svgEl('title',{},label));
    if(b.posts===1)svg.append(svgEl('text',{x:x(b.midpoint)+8,y:y(b.mean)+17,'font-size':12,fill:'#64717b'},'n=1'));
    const detail=()=>document.getElementById('trend-detail').textContent=label;point.addEventListener('focus',detail);point.addEventListener('mouseenter',detail);svg.append(point);previous=b;
  });
  for(let month=1;month<=11;month++){
    const d=`2026-${String(month).padStart(2,'0')}-01`;
    svg.append(svgEl('text',{x:x(d),y:214,'text-anchor':'middle','font-size':13,fill:'#64717b'},['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov'][month-1]));
  }
  const focus=trend.opening,next=trend.following;
  svg.append(svgEl('text',{x:x(focus.midpoint)-10,y:y(focus.mean)-13,'text-anchor':'end','font-size':15,'font-weight':700,fill:'#813838'},'Opening 0.691'));
  svg.append(svgEl('text',{x:x(next.midpoint)+10,y:y(next.mean)+20,'font-size':14,'font-weight':700,fill:'#813838'},'Next 0.478'));
  document.getElementById('threat-chart').append(svg);
})();
