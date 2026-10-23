"""Build the v3 demo: inline the assets as data URIs.

Writes two files:
  ../kommagene-demo.html  standalone page (opens directly in a browser)
  ../artifact.html        body-only version for publishing as an Artifact
"""
import base64
import os
import re

here = os.path.dirname(os.path.abspath(__file__))
root = os.path.dirname(here)
assets = os.path.join(root, 'assets')

ASSETS = {
    'mark': 'mark.png',
    'santiye1': 'santiye-1.webp', 'hero': 'hero.webp', 'kartal': 'kartal.webp', 'endustri': 'endustri.webp', 'imalat': 'imalat.webp', 'hafif': 'hafif.webp',
    'santiye2': 'santiye-2.webp',
}


def data_uri(name):
    fn = ASSETS[name]
    mime = 'image/png' if fn.endswith('.png') else 'image/webp'
    with open(os.path.join(assets, fn), 'rb') as fh:
        return 'data:' + mime + ';base64,' + base64.b64encode(fh.read()).decode()


page = open(os.path.join(here, 'page.html'), encoding='utf-8').read()
page = re.sub(r'\{\{(\w+)\}\}', lambda m: data_uri(m.group(1)), page)

with open(os.path.join(root, 'artifact.html'), 'w', encoding='utf-8') as fh:
    fh.write(page)

standalone = (
    '<!doctype html>\n<html lang="tr" style="background:#0d0c0b">\n<head>\n<meta charset="utf-8">\n'
    '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n'
    + page.replace('<style>', '<style>\n[hidden]{display:none!important}', 1).replace('</style>', '</style>\n</head>\n<body>', 1)
    + '\n</body>\n</html>\n'
)
with open(os.path.join(root, 'kommagene-demo.html'), 'w', encoding='utf-8') as fh:
    fh.write(standalone)

print('ok', len(standalone) // 1024, 'KB')
