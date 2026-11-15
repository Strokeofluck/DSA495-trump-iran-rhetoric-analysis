"""Export every matched post, using bounded strips to avoid image-width limits."""
import asyncio, json, math, subprocess
from pathlib import Path
from PIL import Image
import imageio_ffmpeg
from playwright.async_api import async_playwright
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'video-export'
OUT.mkdir(exist_ok=True)
FF=imageio_ffmpeg.get_ffmpeg_exe()
FPS=12
SPEED=168
async def main():
 async with async_playwright() as p:
  browser=await p.chromium.launch(headless=True)
  page=await browser.new_page(viewport={'width':1800,'height':1500},device_scale_factor=2,reduced_motion='reduce')
  await page.goto((ROOT/'docs/gallery-poster.html').as_uri(),wait_until='networkidle')
  await page.evaluate('document.fonts.ready')
  await page.add_style_tag(content='html,body.poster-page{margin:0!important;padding:0!important;background:white!important;width:1800px!important;height:1500px!important;overflow:hidden!important}.toolbar,.skip{display:none!important}main{padding:0!important}.poster-stage{width:1800px!important;height:1500px!important;margin:0!important}.paper{transform:none!important;box-shadow:none!important}.ribbon-track{animation:none!important;transform:none!important}')
  await page.locator('#poster').screenshot(path=str(OUT/'Trump_Iran_Poster_3600x3000.png'))
  meta=await page.evaluate('''()=>{const w=document.querySelector('.ribbon-window').getBoundingClientRect(),g=document.querySelector('.ribbon-group'),cards=[...g.children];return {x:w.x,y:w.y,width:w.width,height:w.height,stride:cards[1].offsetLeft-cards[0].offsetLeft,columns:[...document.querySelectorAll('.poster-grid>.column')].map(e=>({height:e.clientHeight,scroll:e.scrollHeight})),post_ids:cards.map(e=>e.dataset.truthId),cards:cards.length}}''')
  assert meta['cards']==130 and len(set(meta['post_ids']))==130,meta
  assert all(c['scroll']<=c['height']+2 for c in meta['columns']),meta
  x=round(meta['x']*2);y=round(meta['y']*2);w=round(meta['width']*2);h=round(meta['height']*2)
  base=Image.open(OUT/'Trump_Iran_Poster_3600x3000.png').convert('RGB')
  base.paste('#f7f9fb',(x,y,x+w,y+h));base.save(OUT/'background.png')
  await page.set_viewport_size({'width':9000,'height':1500})
  await page.add_style_tag(content='html,body.poster-page{overflow:visible!important;width:auto!important;height:auto!important}')
  # Each strip contains ten new cards plus enough following cards to fill the viewport.
  for start in range(0,meta['cards'],10):
   count=min(10,meta['cards']-start)
   await page.evaluate('''({start,count})=>{document.getElementById('video-strip')?.remove();const cards=[...document.querySelector('.ribbon-group').children],g=document.createElement('div');g.id='video-strip';g.className='ribbon-group';g.style.cssText='position:absolute;left:0;top:0;width:max-content;display:flex;flex-shrink:0;background:#f7f9fb';for(let j=0;j<count+4;j++)g.append(cards[(start+j)%cards.length].cloneNode(true));document.body.append(g)}''',{'start':start,'count':count})
   strip=OUT/f'strip-{start:03d}.png'
   await page.locator('#video-strip').screenshot(path=str(strip))
   frames=round(count*meta['stride']*2/SPEED*FPS)
   duration=frames/FPS
   filt=f"[1:v]crop={w}:ih:x='n*{SPEED}/{FPS}':y=0[strip];[0:v][strip]overlay={x}:{y+6}:shortest=1,format=yuv420p[out]"
   cmd=[FF,'-y','-loglevel','error','-loop','1','-framerate',str(FPS),'-i',str(OUT/'background.png'),'-loop','1','-framerate',str(FPS),'-i',str(strip),'-filter_complex',filt,'-map','[out]','-frames:v',str(frames),'-an','-c:v','libx264','-preset','ultrafast','-crf','18','-threads','2',str(OUT/f'part-{start:03d}.mp4')]
   subprocess.run(cmd,check=True)
   strip.unlink()
   print(f'Encoded posts {start+1}-{start+count} of {meta["cards"]}',flush=True)
  await browser.close()
 parts=sorted(OUT.glob('part-*.mp4'))
 listing=OUT/'parts.txt';listing.write_text(''.join(f"file '{p.name}'\n" for p in parts))
 video=OUT/'Trump_Iran_Animated_Poster_All_130_Posts.mp4'
 subprocess.run([FF,'-y','-loglevel','error','-f','concat','-safe','0','-i',str(listing),'-c','copy','-movflags','+faststart',str(video)],check=True)
 for n,part in enumerate([parts[0],parts[len(parts)//2],parts[-1]]):
  subprocess.run([FF,'-y','-loglevel','error','-ss','8','-i',str(part),'-frames:v','1',str(OUT/f'check-{n}.png')],check=True)
 for part in parts:part.unlink()
 listing.unlink();(OUT/'background.png').unlink()
 meta.update({'video_width':3600,'video_height':3000,'fps':FPS,'all_unique_posts_included':True,'video_bytes':video.stat().st_size,'note':'All 130 unique matched posts once in chronological order. Cards show excerpts; the interactive poster opens complete post text.'})
 (OUT/'render-checks.json').write_text(json.dumps(meta,indent=2))
 print(json.dumps(meta,indent=2),flush=True)
asyncio.run(main())

