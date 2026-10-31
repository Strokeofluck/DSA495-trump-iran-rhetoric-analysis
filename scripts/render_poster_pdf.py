"""Render the poster with a separate, temporary headless Chromium profile.

Usage: python scripts/render_poster_pdf.py --browser /path/to/chrome
Run build_poster.py first. No third-party Python packages are needed. The browser
must support --headless and --print-to-pdf. This does not use personal browser tabs.
"""
import argparse
from pathlib import Path
import subprocess
import tempfile

ROOT=Path(__file__).resolve().parents[1]

def main():
    parser=argparse.ArgumentParser()
    parser.add_argument('--browser',type=Path,required=True,help='Chromium/Chrome/headless-shell executable')
    parser.add_argument('--output',type=Path,default=ROOT/'docs/research-poster.pdf')
    args=parser.parse_args()
    source=ROOT/'docs/index.html'
    assert source.is_file() and args.browser.is_file()
    args.output.parent.mkdir(parents=True,exist_ok=True)
    with tempfile.TemporaryDirectory(prefix='poster-pdf-') as profile:
        subprocess.run([str(args.browser),'--headless','--no-pdf-header-footer','--virtual-time-budget=5000',
                        '--user-data-dir='+profile,'--print-to-pdf='+str(args.output.resolve()),source.as_uri()],check=True)
    assert args.output.is_file() and args.output.read_bytes().startswith(b'%PDF-')
    print('Created '+str(args.output.resolve()))

if __name__=='__main__':main()
