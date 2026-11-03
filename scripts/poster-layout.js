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
  let paused=reduced.matches;
  function updatePause(){ribbon.classList.toggle('is-paused',paused);pause.textContent=paused?'Resume scrolling':'Pause scrolling';pause.setAttribute('aria-pressed',String(paused))}
  pause.addEventListener('click',()=>{paused=!paused;updatePause()});
  reduced.addEventListener('change',event=>{if(event.matches)paused=true;updatePause()});updatePause();
  const dialog=document.getElementById('post-dialog');
  document.getElementById('post-close').addEventListener('click',()=>dialog.close());
  const excerpt=text=>{const clean=text.replace(/\s+/g,' ').trim();return clean.length>165?clean.slice(0,165).replace(/\s+\S*$/,'')+'…':clean};
  function card(post,interactive){
    const item=document.createElement(interactive?'button':'article');item.className='ribbon-card';
    const date=document.createElement('time');date.dateTime=post.post_date_et;date.textContent=`${post.post_date_et} · @realDonaldTrump · excerpt`;
    const text=document.createElement('p');text.textContent=excerpt(post.content_text);item.append(date,text);
    if(interactive){item.type='button';item.setAttribute('aria-label',`Read full post from ${post.post_date_et}: ${excerpt(post.content_text)}`);item.addEventListener('click',()=>{
      document.getElementById('post-date').textContent=`Donald J. Trump · Truth Social · ${post.created_at_et} (saved ET timestamp)`;
      document.getElementById('post-full-text').textContent=post.content_text;
      document.getElementById('post-source').href=post.source_url;
      ribbon.classList.add('dialog-paused');dialog.showModal();
    })}return item;
  }
  const group=document.createElement('div');group.className='ribbon-group';posts.forEach(post=>group.append(card(post,true)));track.append(group);
  dialog.addEventListener('close',()=>ribbon.classList.remove('dialog-paused'));
  const copy=group.cloneNode(true);copy.setAttribute('aria-hidden','true');copy.inert=true;copy.querySelectorAll('button').forEach(button=>button.tabIndex=-1);track.append(copy);
  // Duplicate visible cards remain clickable without duplicate keyboard stops.
  copy.querySelectorAll('button').forEach((button,index)=>button.addEventListener('click',()=>group.children[index].click()));
  copy.inert=false;
  function speed(){track.style.setProperty('--ribbon-duration',`${group.offsetWidth/38}s`)}
  new ResizeObserver(speed).observe(group);speed();
  // First two substantial text posts provide a deterministic print still.
  const print=document.getElementById('print-excerpts');posts.filter(post=>post.content_text.length>200).slice(0,2).forEach(post=>print.append(card(post,false)));
})();
