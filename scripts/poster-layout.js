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
  const event=data.event_context.events.find(event=>event.date==='2026-02-28');
  const ribbon=document.querySelector('.post-ribbon'),pause=document.getElementById('ribbon-pause');
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const savedMotion=sessionStorage.getItem('dsa495-event-scroll-autoplay');
  let paused=savedMotion==='paused';
  function updatePause(){ribbon.classList.toggle('is-paused',paused);pause.textContent=paused?'Resume scrolling':'Pause scrolling';pause.setAttribute('aria-pressed',String(paused))}
  pause.addEventListener('click',()=>{paused=!paused;sessionStorage.setItem('dsa495-event-scroll-autoplay',paused?'paused':'running');updatePause()});
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
  dialog.addEventListener('close',()=>ribbon.classList.remove('dialog-paused'));
  document.getElementById('case-estimate').textContent=`${event.fatalities.toFixed(0)} estimated deaths · ${event.same_day_records} selected single-day records · UCDP 26.01.26.09`;
  const windows=[{offset:-1,date:'2026-02-27',label:'Day before'},{offset:0,date:event.date,label:'Event day'},{offset:1,date:'2026-03-01',label:'Day after'}];

  const track=document.getElementById('ribbon-track'),print=document.getElementById('print-excerpts');
  function windowCard(w,post,index,total){
    const item=post?card(post):el('article','ribbon-card empty-ribbon-card');
    const label=el('p',`ribbon-day ribbon-day-${w.offset}`,`${w.label} · ${w.date}${post?` · ${index+1} of ${total}`:''}`);item.prepend(label);
    if(!post)item.append(el('b',null,'No matching post in the saved corpus'),el('p',null,'February 27 has no saved Iran-related text post. No score assigned.'));
    return item;
  }
  function loop(hidden=false){
    const group=el('div','ribbon-group');if(hidden)group.setAttribute('aria-hidden','true');
    windows.forEach(w=>{
      const posts=[...event.windows[String(w.offset)]].sort((a,b)=>a.created_at_et.localeCompare(b.created_at_et));
      if(!posts.length)group.append(windowCard(w,null));else posts.forEach((post,i)=>group.append(windowCard(w,post,i,posts.length)));
      if(!hidden){
        const still=el('article','print-post');still.append(el('b',null,`${w.label} · ${w.date} · ${posts.length} posts`));
        still.append(el('p',null,posts.length?short(posts[0].content_text):'No matching post in the saved Iran-related corpus. No score assigned.'));
        if(posts.length){const source=el('a',null,'Source ↗');source.href=posts[0].source_url;still.append(source)}print.append(still);
      }
    });
    if(hidden)group.querySelectorAll('a,button').forEach(e=>e.tabIndex=-1);
    return group;
  }
  const group=loop();track.append(group,loop(true));
  function speed(){track.style.setProperty('--ribbon-duration',`${group.offsetWidth/42}s`)}
  new ResizeObserver(speed).observe(group);speed();


  // The primary figure retains before/on/after timing for both event cohorts.
  const periods=data.threat_period_windows,NS='http://www.w3.org/2000/svg';
  const svgEl=(name,attrs,text)=>{const e=document.createElementNS(NS,name);for(const[k,v]of Object.entries(attrs))e.setAttribute(k,v);if(text!==undefined)e.textContent=text;return e};
  const svg=svgEl('svg',{viewBox:'0 0 900 245',role:'img','aria-label':'Threat scores before, on, and after selected event starts. Opening two weeks: 0.638, 0.603, 0.485. Later starts: 0.517, 0.555, 0.462. Scale zero to one.'});
  svg.append(svgEl('title',{},'Threat before, on and after event starts: opening two weeks compared with later dates'));
  const xs=[155,450,745],y=v=>192-v*158;
  svg.append(svgEl('rect',{x:392,y:28,width:116,height:166,fill:'#f3f6fa'}));
  svg.append(svgEl('line',{x1:450,x2:450,y1:28,y2:192,stroke:'#8a99a8','stroke-width':1,'stroke-dasharray':'4 4'}));
  [0,.25,.5,.75,1].forEach(v=>{svg.append(svgEl('line',{x1:60,x2:860,y1:y(v),y2:y(v),stroke:'#dce2e7'}));svg.append(svgEl('text',{x:47,y:y(v)+4,'text-anchor':'end','font-size':13,fill:'#64717b'},String(v)))});
  svg.append(svgEl('text',{x:60,y:16,'font-size':13,fill:'#64717b'},'Mean Threat score · 0–1'));
  const anchorLabel=svgEl('text',{x:450,y:16,'text-anchor':'middle','font-size':14,'font-weight':700,fill:'#536473'},'Opening case: Feb 28, 2026');
  anchorLabel.append(svgEl('title',{},'The February 28 case was labeled 162 deaths in the earlier snapshot; the refreshed selected single-day total is 192. The plotted lines average multiple event starts.'));
  svg.append(anchorLabel);
  periods.forEach((period,k)=>{
    const color=k===0?'#9a4949':'#4b719c';
    svg.append(svgEl('polyline',{points:period.means.map((v,i)=>`${xs[i]},${y(v)}`).join(' '),fill:'none',stroke:color,'stroke-width':3,'stroke-dasharray':k===0?'none':'7 5'}));
    period.means.forEach((v,i)=>{
      const label=`${period.label} · ${['Before','Event day','After'][i]} · mean ${v.toFixed(3)} · ${period.coverage[i]} contributing dates · ${period.pairs[i]} post/date pairs`;
      const point=svgEl('circle',{cx:xs[i],cy:y(v),r:k===0?6:5,fill:k===0?color:'#fff',stroke:color,'stroke-width':2,tabindex:0,role:'img','aria-label':label});point.append(svgEl('title',{},label));
      const detail=()=>document.getElementById('trend-detail').textContent=label;point.addEventListener('focus',detail);point.addEventListener('mouseenter',detail);svg.append(point);
      svg.append(svgEl('text',{x:xs[i],y:y(v)+(k===0?-13:23),'text-anchor':'middle','font-size':17,'font-weight':700,fill:color},v.toFixed(3)));
    });
  });
  ['Day before','Event day','Day after'].forEach((label,i)=>{svg.append(svgEl('text',{x:xs[i],y:220,'text-anchor':'middle','font-size':16,'font-weight':700,fill:'#343a40'},label));svg.append(svgEl('text',{x:xs[i],y:238,'text-anchor':'middle','font-size':12,fill:'#64717b'},['−1 calendar day','Recorded start date','+1 calendar day'][i]))});
  document.getElementById('threat-chart').append(svg);
})();
