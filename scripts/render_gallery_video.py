"""Render the saved gallery poster and one complete scrolling cycle."""
import asyncio, json, math, subprocess
from pathlib import Path
from PIL import Image
import imageio_ffmpeg
from playwright.async_api import async_playwright
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/"video-export"
OUT.mkdir(exist_ok=True)
async def main():
 async with async_playwright() as p:
  browser=await p.chromium.launch(headless=True)
  page=await browser.new_page(viewport={"width":1800,"height":1500},device_scale_factor=2, reduced_motion="reduce")
  await page.goto((ROOT/"docs/gallery-poster.html").as_uri(),wait_until="networkidle")
  await page.evaluate("document.fonts.ready")
  await page.add_style_tag(content="""html,body.poster-page{margin:0!important;padding:0!important;background:white!important;width:1800px!important;height:1500px!important;overflow:hidden!important}.toolbar,.skip{display:none!important}main{padding:0!important}.poster-stage{width:1800px!important;height:1500px!important;margin:0!important}.paper{transform:none!important;box-shadow:none!important}.ribbon-track{animation:none!important;transform:none!important}""")
  await page.locator("#poster").screenshot(path=str(OUT/"Trump_Iran_Poster_3600x3000.png"))
  meta=await page.evaluate("""()=>{const w=document.querySelector('.ribbon-window').getBoundingClientRect(),g=document.querySelector('.ribbon-group');return {x:w.x,y:w.y,width:w.width,height:w.height,group:g.offsetWidth,columns:[...document.querySelectorAll('.poster-grid>.column')].map(e=>({height:e.clientHeight,scroll:e.scrollHeight})),cards:g.children.length}}""")
  assert all(c["scroll"]<=c["height"]+2 for c in meta["columns"]),meta
  width=math.ceil(meta["group"])
  await page.set_viewport_size({"width":max(1800,width+100),"height":1500})
  await page.add_style_tag(content="""html,body.poster-page{overflow:visible!important;width:auto!important;height:auto!important}.paper{overflow:visible!important}.ribbon-window{overflow:visible!important}.ribbon-group{flex-shrink:0!important}""")
  await page.locator(".ribbon-group").first.screenshot(path=str(OUT/"strip.png"))
  await browser.close()
 image=Image.open(OUT/"strip.png").convert("RGB")
 doubled=Image.new("RGB",(image.width*2,image.height),"white")
 doubled.paste(image,(0,0));doubled.paste(image,(image.width,0))
 doubled.save(OUT/"strip-double.png")
 # Pixel-aligned crop moves at the same speed as the web poster.
 fps=24;speed=84;cycle=image.width/speed
 x=round(meta["x"]*2);y=round(meta["y"]*2);w=round(meta["width"]*2);h=round(meta["height"]*2)
 # The ribbon window includes vertical padding around the card group.
 base=Image.open(OUT/"Trump_Iran_Poster_3600x3000.png").convert("RGB")
 base.paste("#f7f9fb",(x,y,x+w,y+h));base.save(OUT/"background.png")
 duration=math.ceil(cycle*fps)/fps
 filt=f"[1:v]crop={w}:{image.height}:x='mod(n*{speed}/{fps},{image.width})':y=0[strip];[0:v][strip]overlay={x}:{y+6}:shortest=1,format=yuv420p[out]"
 cmd=[imageio_ffmpeg.get_ffmpeg_exe(),"-y","-loop","1","-framerate",str(fps),"-i",str(OUT/"background.png"),"-loop","1","-framerate",str(fps),"-i",str(OUT/"strip-double.png"),"-filter_complex",filt,"-map","[out]","-t",str(duration),"-an","-c:v","libx264","-preset","fast","-crf","16","-threads","2","-movflags","+faststart",str(OUT/"Trump_Iran_Animated_Poster.mp4")]
 subprocess.run(cmd,check=True)
 subprocess.run([imageio_ffmpeg.get_ffmpeg_exe(),"-y","-ss",str(duration/2),"-i",str(OUT/"Trump_Iran_Animated_Poster.mp4"),"-frames:v","1",str(OUT/"video-midpoint.png")],check=True)
 for name in ["strip.png","strip-double.png","background.png"]:(OUT/name).unlink()
 meta.update({"video_width":3600,"video_height":3000,"fps":fps,"duration_seconds":duration,"loop_cards":meta["cards"],"note":"Silent video; one complete cycle of the existing February 27–March 1 strip. Repeat playback in the display player."})
 (OUT/"render-checks.json").write_text(json.dumps(meta,indent=2))
 print(json.dumps(meta,indent=2))
asyncio.run(main())
