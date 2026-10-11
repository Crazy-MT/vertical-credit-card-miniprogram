#!/usr/bin/env python3
"""Pack Flutter export as JPEG/PNG within the combined 200 KB media budget."""
from pathlib import Path
import json, re, subprocess, sys
root = Path(__file__).resolve().parent.parent / 'miniprogram/modules/vertical-credit-card'
source = Path(sys.argv[1]) / 'example/lib/src/data/preset_catalog.dart'
catalog = {ident: (name, family) for name, family, ident in re.findall(r"'name': '([^']+)'\s*,\s*'family': '([^']+)'\s*,\s*'theme': CardPresets\.(\w+)", source.read_text())}
items = json.loads((root / 'presets.json').read_text())
for item in items:
    item['name'], item['family'] = catalog.get(item['id'], (re.sub(r'([A-Z])', r' \1', item['id']).title(), 'Cyber'))
    image = root / 'assets' / (item['id'] + '.png')
    if item['type'] != 'glass':
        converted = image.with_suffix('.jpg')
        subprocess.run(['sips', '-s', 'format', 'jpeg', '-s', 'formatOptions', '78', str(image), '--out', str(converted)], check=True, stdout=subprocess.DEVNULL)
        image.unlink()
        image = converted
    item['backgroundImage'] = '/modules/vertical-credit-card/assets/' + image.name
(root / 'presets.ts').write_text("import { CardTheme } from './model'\n\nexport const cardPresets: CardTheme[] = " + json.dumps(items, ensure_ascii=False, indent=2) + "\n\nexport const getCardPreset = (id: string): CardTheme => cardPresets.find(item => item.id === id) || cardPresets[0]\n")
(root / 'presets.json').unlink()
particles = json.loads((root / 'glitter.json').read_text())
(root / 'glitter.ts').write_text('// Original Dart Random(1337) particles.\nexport const glitterParticles = ' + json.dumps(particles) + '\n')
(root / 'glitter.json').unlink()
subprocess.run(['sips', '--resampleWidth', '240', str(root / 'assets/frost.png'), '--out', str(root / 'assets/frost.png')], check=True, stdout=subprocess.DEVNULL)
for image in (root / 'assets').iterdir():
    if image.suffix.lower() not in {'.png', '.jpg', '.jpeg'}:
        continue
    options = ['-sampling-factor', '4:2:0', '-quality', '38'] if image.suffix.lower() in {'.jpg', '.jpeg'} else ['-dither', 'None', '-colors', '64', '-define', 'png:compression-level=9']
    subprocess.run(['magick', str(image), '-strip', '-resize', '320x>', *options, str(image)], check=True)
media_size = sum(image.stat().st_size for image in (root / 'assets').iterdir() if image.is_file())
if media_size >= 200000:
    raise SystemExit(f'Combined media budget exceeded: {media_size} bytes (must be below 200000)')
print(f'{len(items)} presets packed')
