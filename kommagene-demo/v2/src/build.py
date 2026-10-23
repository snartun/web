"""Build the v2 demo: inline the assets as data URIs.

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
    'logo': 'logo.webp',
    'santiye1': 'santiye-1.webp',
    'santiye2': 'santiye-2.webp',
}


def data_uri(name):
    with open(os.path.join(assets, ASSETS[name]), 'rb') as fh:
        return 'data:image/webp;base64,' + base64.b64encode(fh.read()).decode()


page = open(os.path.join(here, 'page.html'), encoding='utf-8').read()
page = re.sub(r'\{\{(\w+)\}\}', lambda m: data_uri(m.group(1)), page)

with open(os.path.join(root, 'artifact.html'), 'w', encoding='utf-8') as fh:
    fh.write(page)

standalone = (
    '<!doctype html>\n<html lang="tr">\n<head>\n<meta charset="utf-8">\n'
    '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n'
    + page.replace('<style>', '<style>\n[hidden]{display:none!important}', 1).replace('</style>', '</style>\n</head>\n<body>', 1)
    + '\n</body>\n</html>\n'
)
with open(os.path.join(root, 'kommagene-demo.html'), 'w', encoding='utf-8') as fh:
    fh.write(standalone)

print('ok', len(standalone) // 1024, 'KB')
