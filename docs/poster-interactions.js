'use strict';
(() => {
  const element=document.getElementById('evidence-data');
  if(!element)return;
  const data=JSON.parse(element.textContent), context=data.event_context;
  const frames=data.frames, colors=['#9a4949','#4e7657','#4b719c','#7d6594','#b5752e','#2f8f95'];
  const names={'-1':'Day before','0':'Event day','1':'Day after'};
  const make=(tag,cls,text)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(text!==undefined)e.textContent=text;return e};
  const svg=(name,attrs={},text)=>{const e=document.createElementNS('http://www.w3.org/2000/svg',name);Object.entries(attrs).forEach(([k,v])=>e.setAttribute(k,v));if(text!==undefined)e.textContent=text;return e};
  const link=(text,url)=>{const a=make('a','',text);a.href=url;a.rel='noopener';a.target='_blank';return a};
  const fmt=n=>Number(n).toFixed(3);
  const chartHost=document.getElementById('severity-charts');
  if(chartHost){
    const featured=chartHost.dataset.feature==='victory-after';
    const viewSelect=document.getElementById('severity-view');
    const windowSelect=document.getElementById('severity-window');
    const limit=Math.max(200,...Object.values(context.severity).flatMap(s=>s.rows.map(p=>p.high)));
    const xmax=Math.ceil(limit/100)*100;
    const left=featured?55:44,right=featured?610:304,bottom=featured?245:168,top=featured?42:44;
    const x=v=>left+Math.log10(Math.max(1,v))/Math.log10(xmax)*(right-left),y=v=>bottom-v*(bottom-top);
    const reading=document.getElementById('severity-reading');
    if(reading)reading.textContent='Compare event-day death estimates with model scores in the selected post window. The poster highlights the exploratory next-day Victory pattern; the full comparisons remain here.';
    const eventsByDate=new Map(context.events.map(event=>[event.date,event]));
    const popup=make('aside','event-popover');
    popup.id='event-popover';popup.hidden=true;popup.setAttribute('role','dialog');popup.setAttribute('aria-modal','false');popup.setAttribute('aria-labelledby','event-popover-title');
    const popupHeader=make('div','event-popover-header'),popupTitle=make('h3');popupTitle.id='event-popover-title';
    const closePopup=make('button','','×');closePopup.type='button';closePopup.setAttribute('aria-label','Close event details');
    popupHeader.append(popupTitle,closePopup);const popupBody=make('div','event-popover-body');popup.append(popupHeader,popupBody);document.body.append(popup);
    let activeDot=null,pinned=false,closeTimer=null,suppressFocus=false;
    function dismiss(returnFocus=false){
      clearTimeout(closeTimer);const previous=activeDot;
      popup.hidden=true;pinned=false;
      if(activeDot)activeDot.setAttribute('aria-expanded','false');activeDot=null;
      if(returnFocus&&previous&&document.contains(previous)&&document.activeElement!==previous){suppressFocus=true;previous.focus();suppressFocus=false}
    }
    function positionPopup(){
      if(!activeDot||popup.hidden)return;
      const dot=activeDot.getBoundingClientRect(),box=popup.getBoundingClientRect(),gap=12;
      const left=Math.max(8,Math.min(dot.left+gap,window.innerWidth-box.width-8));
      const top=dot.bottom+gap+box.height<=window.innerHeight-8?dot.bottom+gap:dot.top-box.height-gap;
      popup.style.left=left+'px';popup.style.top=Math.max(8,Math.min(top,window.innerHeight-box.height-8))+'px';
    }
    function showPopup(dot,point,panel,pin=false){
      clearTimeout(closeTimer);
      if(activeDot&&activeDot!==dot)activeDot.setAttribute('aria-expanded','false');
      activeDot=dot;pinned=pin;dot.setAttribute('aria-expanded','true');
      const event=eventsByDate.get(point.date);
      const records=event.records.filter(record=>record.date_start===point.date&&record.date_end===point.date);
      const locations=[...new Set(records.map(r=>r.where_coordinates).filter(Boolean))];
      popupTitle.textContent='Event date · '+point.date;popupBody.replaceChildren();
      popupBody.append(make('p','event-popover-location',locations.join(' · ')||'Location unavailable'));
      const stats=make('dl','event-popover-stats');
      const fields=[['Estimated deaths',`${point.fatalities} (low–high ${point.low}–${point.high})`],['Post window',names[panel.offset]],['Posts',String(point.count)],[panel.frame+' score',fmt(point.means[panel.frame])]];
      fields.forEach(([label,value])=>stats.append(make('dt','',label),make('dd','',value)));popupBody.append(stats);
      popupBody.append(make('p','event-popover-source-label',`Source headlines · ${records.length} same-day record${records.length===1?'':'s'}`));
      const list=make('ul','event-popover-headlines');
      const headlines=[...new Set(records.map(r=>r.source_headline.split(';')[0].trim()).filter(Boolean))];
      headlines.slice(0,3).forEach(text=>list.append(make('li','',text.length>230?text.slice(0,230)+'…':text)));popupBody.append(list);
      if(headlines.length>3)popupBody.append(make('p','note',`Plus ${headlines.length-3} additional source headline${headlines.length===4?'':'s'}.`));
      popupBody.append(make('p','event-popover-note','This point groups records by date. Deaths are source estimates; rhetoric is a model score.'));
      popup.hidden=false;positionPopup();
      document.getElementById('severity-detail').textContent=`${point.date} · ${locations.join(' / ')} · ${point.fatalities} deaths · ${names[panel.offset]} ${panel.frame}: ${fmt(point.means[panel.frame])}`;
    }
    function scheduleDismiss(){
      clearTimeout(closeTimer);closeTimer=setTimeout(()=>{
        if(!pinned&&!popup.matches(':hover')&&!popup.contains(document.activeElement)&&activeDot!==document.activeElement)dismiss();
      },160);
    }
    popup.addEventListener('pointerenter',()=>clearTimeout(closeTimer));popup.addEventListener('pointerleave',scheduleDismiss);popup.addEventListener('focusout',scheduleDismiss);
    closePopup.addEventListener('click',()=>dismiss(true));
    document.addEventListener('keydown',event=>{if(event.key==='Escape'&&!popup.hidden){event.preventDefault();dismiss(true)}});
    document.addEventListener('pointerdown',event=>{if(!popup.hidden&&!popup.contains(event.target)&&event.target!==activeDot)dismiss()});
    window.addEventListener('scroll',()=>dismiss(),{passive:true});window.addEventListener('resize',()=>dismiss());
    function attachPopup(dot,point,panel){
      dot.classList.add('event-point');dot.setAttribute('role','button');dot.setAttribute('aria-haspopup','dialog');dot.setAttribute('aria-controls','event-popover');dot.setAttribute('aria-expanded','false');
      dot.addEventListener('pointerenter',event=>{if(event.pointerType!=='touch'&&(!pinned||activeDot===dot))showPopup(dot,point,panel,pinned)});
      dot.addEventListener('pointerleave',scheduleDismiss);
      dot.addEventListener('focus',()=>{if(!suppressFocus)showPopup(dot,point,panel,false)});dot.addEventListener('blur',scheduleDismiss);
      dot.addEventListener('click',()=>{if(activeDot===dot&&pinned)dismiss();else showPopup(dot,point,panel,true)});
      dot.addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();showPopup(dot,point,panel,true);closePopup.focus()}});
    }

    function render(){
      dismiss();
      const threatView=!featured&&viewSelect.value==='threat';
      if(!featured)document.getElementById('single-window-control').hidden=threatView;
      chartHost.classList.toggle('threat-windows',threatView);
      const panels=featured?[{offset:'1',frame:'Victory',color:colors[1],title:'Victory language in next-day posts'}]:threatView?['-1','0','1'].map(offset=>({offset,frame:'Threat',color:colors[0],title:names[offset]})):
        frames.slice(0,4).map((frame,i)=>({offset:windowSelect.value,frame,color:colors[i],title:frame}));
      chartHost.replaceChildren();
      const table=document.querySelector('#severity-values tbody');if(table)table.replaceChildren();
      const sampleLabels=[];
      document.getElementById('severity-detail').textContent='Hover over a circle for event details. Click or tap to keep the pop-up open; keyboard users can focus a circle and press Enter. Press Escape to close.';
      panels.forEach(panel=>{
        const group=context.severity[panel.offset];
        const rows=group.rows;
        const rho=group.spearman[panel.frame];
        if(threatView||sampleLabels.length===0)sampleLabels.push(`${names[panel.offset]}: ${rows.length} dates`);
        const fig=make('figure','severity-small');
        const caption=make('figcaption','',panel.title);
        caption.append(make('span','',`ρ = ${rho===null?'n/a':rho.toFixed(2)} · n = ${rows.length}`));fig.append(caption);
        const plot=svg('svg',{viewBox:featured?'0 0 640 300':'0 0 340 220',role:'group','aria-label':`${panel.frame} versus event-day deaths, ${names[panel.offset]}, ${rows.length} dates; Spearman rho ${rho===null?'unavailable':rho.toFixed(2)}.`});
        (featured?[0,.25,.5,.75,1]:[0,.5,1]).forEach(t=>{plot.append(svg('line',{x1:left,x2:right,y1:y(t),y2:y(t),stroke:'#dee2e6'}));plot.append(svg('text',{x:left-12,y:y(t)+4,'text-anchor':'end'},String(t)))});
        (featured?[1,2,5,10,25,50,100,xmax]:[1,5,25,100,xmax]).filter((v,i,a)=>a.indexOf(v)===i).forEach(t=>plot.append(svg('text',{x:x(t),y:featured?268:188,'text-anchor':'middle'},String(t))));
        plot.append(svg('text',{x:left,y:featured?23:25},featured?'Mean Victory score · day after':threatView?'Mean Threat score':'Mean model score'));
        plot.append(svg('text',{x:(left+right)/2,y:featured?294:211,'text-anchor':'middle'},featured?'Estimated deaths on event date · log scale':'Event-day deaths · log scale'));
        rows.forEach(point=>{
          if(point.bounds_valid)plot.append(svg('line',{x1:x(point.low),x2:x(point.high),y1:y(point.means[panel.frame]),y2:y(point.means[panel.frame]),stroke:panel.color,'stroke-width':2,opacity:.6}));
          const description=`${point.date} event; ${names[panel.offset]} posts: ${point.fatalities} event-day deaths (low-high ${point.low}-${point.high}), ${point.count} posts, ${panel.frame} ${fmt(point.means[panel.frame])}`;
          const dot=svg('circle',{cx:x(point.fatalities),cy:y(point.means[panel.frame]),r:featured?6:4.5,fill:panel.color,stroke:'#fff','stroke-width':1,tabindex:0,'aria-label':description});
          attachPopup(dot,point,panel);plot.append(dot);
          if(featured&&point.date===context.largest_date){
            plot.append(svg('line',{x1:x(point.fatalities)-4,y1:y(point.means[panel.frame])+8,x2:x(point.fatalities)-22,y2:y(point.means[panel.frame])+30,stroke:panel.color}));
            plot.append(svg('text',{x:x(point.fatalities)-27,y:y(point.means[panel.frame])+40,'text-anchor':'end',class:'featured-point-label'},'Feb 28 · 162 deaths'));
          }
        });
        fig.append(plot);chartHost.append(fig);
        if(table&&(threatView||panels.indexOf(panel)===0))rows.forEach(p=>{
          const tr=make('tr');[names[panel.offset],p.date,`${p.fatalities} (${p.low}-${p.high})`,p.count,...frames.slice(0,4).map(f=>fmt(p.means[f]))].forEach(t=>tr.append(make('td','',String(t))));table.append(tr);
        });
      });
      document.getElementById('severity-summary').textContent=featured?'One dot = one event date · Next-day post averages · All 20 eligible dates included':(threatView?'Threat across all three windows · ':'')+sampleLabels.join(' · ')+'. Each panel uses the dates with same-day fatality records and posts in that window.';
      if(featured){
        const group=context.severity['1'];
        const signed=value=>(value>0?'+':'')+value.toFixed(2);
        document.getElementById('victory-rho').textContent=signed(group.spearman.Victory);
        document.getElementById('victory-n').textContent=group.n;
        document.getElementById('victory-rho-without').textContent=`ρ = ${signed(group.without_largest_spearman.Victory)} · ${group.rows.filter(p=>p.date!==context.largest_date).length} dates`;
      }
    }
    if(viewSelect)viewSelect.addEventListener('change',render);if(windowSelect)windowSelect.addEventListener('change',render);
    window.addEventListener('beforeprint',()=>{if(viewSelect)viewSelect.value='threat';render()});
    render();
  }

  const timeline=document.getElementById('event-timeline');
  if(timeline){
    let eventIndex=0;
    const select=document.getElementById('event-date');
    context.events.forEach((event,i)=>{const option=make('option','',event.date);option.value=i;select.append(option)});
    function render(){
      const event=context.events[eventIndex];select.value=eventIndex;
      document.getElementById('event-prev').disabled=eventIndex===0;
      document.getElementById('event-next').disabled=eventIndex===context.events.length-1;
      document.getElementById('event-count').textContent=`${eventIndex+1} of ${context.events.length}`;
      document.getElementById('event-context').textContent=`${event.records.length} workbook records start on this date. ${event.same_day_records} are single-day records, with summed best fatality estimate ${event.fatalities} (low-high ${event.low}-${event.high}). Multi-day totals are not assigned to their start day.`;
      const recordList=document.getElementById('event-records');recordList.replaceChildren();
      event.records.forEach(record=>{const item=make('li');item.append(make('b','',`UCDP ${record.id} · ${record.date_start} to ${record.date_end} · ${record.where_coordinates}`),make('p','',`${record.us_involvement}; best estimate ${record.best}, recorded low-high ${record.low}-${record.high}.${record.bounds_valid?'':' Source bounds are inconsistent; retained as supplied.'} ${record.ucdp_release}`),make('p','',record.source_headline));recordList.append(item)});
      const windows=document.getElementById('event-posts');windows.replaceChildren();
      [-1,0,1].forEach(offset=>{
        const posts=event.windows[String(offset)],group=make('section','post-window');
        group.append(make('h3','',`${names[offset]} · ${posts.length} post${posts.length===1?'':'s'}`));
        if(!posts.length){group.append(make('p','note','No post in this saved window. This is missing evidence, not a zero rhetorical score.'));windows.append(group);return}
        let postIndex=0;
        const controls=make('div','post-controls'),previous=make('button','','←'),next=make('button','','→'),count=make('span');
        previous.type=next.type='button';previous.setAttribute('aria-label',`Previous ${names[offset].toLowerCase()} post`);next.setAttribute('aria-label',`Next ${names[offset].toLowerCase()} post`);
        controls.append(previous,count,next);group.append(controls);
        const card=make('article','post-card');group.append(card);
        function renderPost(){
          const post=posts[postIndex];card.replaceChildren();count.textContent=`${postIndex+1} of ${posts.length}`;previous.disabled=postIndex===0;next.disabled=postIndex===posts.length-1;
          card.append(make('b','','Donald J. Trump'),make('p','note',`@realDonaldTrump · ${post.created_at_et} (saved ET timestamp)`));
          const full=post.content_text;
          card.append(make('p','post-text',full.length>500?full.slice(0,500)+'…':full));
          if(full.length>500){const details=make('details'),summary=make('summary','','Read full text');details.append(summary,make('p','post-text',full));card.append(details)}
          frames.forEach((frame,i)=>{const row=make('div','post-score');row.append(make('span','',frame));const track=make('span','post-track'),fill=make('span');fill.style.width=`${100*post.scores[frame]}%`;fill.style.backgroundColor=colors[i];track.append(fill);row.append(track,make('span','',fmt(post.scores[frame])));card.append(row)});
          const actions=make('div','post-actions');actions.append(link('Read archived source ↗',post.source_url),link('Original Truth Social post ↗',post.truth_url));card.append(actions);
        }
        previous.addEventListener('click',()=>{postIndex--;renderPost()});next.addEventListener('click',()=>{postIndex++;renderPost()});renderPost();windows.append(group);
      });
    }
    document.getElementById('event-prev').addEventListener('click',()=>{eventIndex--;render()});
    document.getElementById('event-next').addEventListener('click',()=>{eventIndex++;render()});
    select.addEventListener('change',()=>{eventIndex=Number(select.value);render()});render();
  }
})();
