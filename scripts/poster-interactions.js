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
    const windowSelect=document.getElementById('severity-window'),exclude=document.getElementById('severity-exclude');
    const limit=Math.max(200,...Object.values(context.severity).flatMap(s=>s.rows.map(p=>p.high)));
    const xmax=Math.ceil(limit/100)*100;
    const x=v=>44+Math.log10(Math.max(1,v))/Math.log10(xmax)*260,y=v=>168-v*124;
    document.getElementById('severity-exclude-label').textContent=`Exclude ${context.largest_date} (${context.largest_fatalities} deaths)`;
    function render(){
      const group=context.severity[windowSelect.value];
      const rows=group.rows.filter(p=>!exclude.checked||p.date!==context.largest_date);
      const correlations=exclude.checked?group.without_largest_spearman:group.spearman;
      chartHost.replaceChildren();
      document.getElementById('severity-summary').textContent=`${names[windowSelect.value]} · ${rows.length} dates with same-day fatality records and posts in this window.`;
      document.getElementById('severity-detail').textContent='Hover over or focus a point to inspect its date, fatality estimate, post count, and score.';
      frames.slice(0,4).forEach((frame,i)=>{
        const fig=make('figure','severity-small');
        const caption=make('figcaption','',frame);const rho=correlations[frame];
        caption.append(make('span','',`ρ = ${rho===null?'n/a':rho.toFixed(2)} · n = ${rows.length}`));fig.append(caption);
        const plot=svg('svg',{viewBox:'0 0 340 220',role:'img','aria-label':`${frame} versus same-day deaths, ${names[windowSelect.value]}, ${rows.length} dates; Spearman rho ${rho===null?'unavailable':rho.toFixed(2)}.`});
        [0,.5,1].forEach(t=>{plot.append(svg('line',{x1:44,x2:304,y1:y(t),y2:y(t),stroke:'#dee2e6'}));plot.append(svg('text',{x:34,y:y(t)+4,'text-anchor':'end'},String(t)))});
        [1,5,25,100,xmax].filter((v,i,a)=>a.indexOf(v)===i).forEach(t=>{plot.append(svg('text',{x:x(t),y:188,'text-anchor':'middle'},String(t)))});
        plot.append(svg('text',{x:44,y:25},'Mean model score'));
        plot.append(svg('text',{x:174,y:211,'text-anchor':'middle'},'Same-day deaths · log scale'));
        rows.forEach(point=>{
          if(point.bounds_valid)plot.append(svg('line',{x1:x(point.low),x2:x(point.high),y1:y(point.means[frame]),y2:y(point.means[frame]),stroke:colors[i],'stroke-width':2,opacity:.6}));
          const description=`${point.date}: ${point.fatalities} deaths (low-high ${point.low}-${point.high}), ${point.count} posts, ${frame} ${fmt(point.means[frame])}`;
          const dot=svg('circle',{cx:x(point.fatalities),cy:y(point.means[frame]),r:4.5,fill:colors[i],stroke:'#fff','stroke-width':1,tabindex:0,'aria-label':description});
          dot.append(svg('title',{},description));
          const show=()=>{document.getElementById('severity-detail').textContent=description};
          dot.addEventListener('focus',show);dot.addEventListener('mouseenter',show);dot.addEventListener('click',show);
          plot.append(dot);
        });fig.append(plot);chartHost.append(fig);
      });
      const table=document.querySelector('#severity-values tbody');
      if(table){table.replaceChildren();rows.forEach(p=>{const tr=make('tr');[p.date,`${p.fatalities} (${p.low}-${p.high})`,p.count,...frames.slice(0,4).map(f=>fmt(p.means[f]))].forEach(t=>tr.append(make('td','',String(t))));table.append(tr)})}
    }
    windowSelect.addEventListener('change',render);exclude.addEventListener('change',render);
    window.addEventListener('beforeprint',()=>{windowSelect.value='0';exclude.checked=false;render()});
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
