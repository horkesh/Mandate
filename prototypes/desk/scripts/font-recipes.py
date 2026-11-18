"""Write provenance for sourced font derivatives without downloading them again."""
import pathlib, json, hashlib
base = pathlib.Path(__file__).resolve().parents[1]
folder = base / 'public/fonts'
sha = lambda p: hashlib.sha256(p.read_bytes()).hexdigest()
for entry in json.loads((folder / 'sources.json').read_text()):
    name = entry['file']
    masters = base.parents[1] / 'art-masters/R14/fonts'
    references = [{'sourceUrl': entry['source'], 'sha256': entry.get('sourceSha256')}]
    if name.startswith('im-'):
        prefix = 'IMFeENit28P.ttf' if 'italic' in name else 'IMFeENrm28P.ttf'
        commit = entry['source'].split('/tree/')[1]
        references = [{'sourceUrl': f'https://raw.githubusercontent.com/librefonts/imfellenglish/{commit}/{p.name}', 'sha256': sha(p)} for p in sorted(masters.glob(prefix + '*.ttx'))]
    elif name.startswith('old-'):
        references = [{'sourceUrl': entry['source'], 'sha256': sha(masters/'oldstandard-2.2.ttf.zip'), 'extractedFontSha256': entry['sourceSha256']}]
    licence = 'IM-Fell-OFL.txt' if name.startswith('im-') else 'Libre-Caslon-OFL.txt' if name.startswith('libre-') else 'Old-Standard-OFL.txt'
    recipe = {
        'asset': 'prototypes/desk/public/fonts/' + name,
        'request': 'R14', 'brief': 'CODEX.md R14; ASSETS.md section 5; decision 0035',
        'date': '2026-11-17', 'tool': 'FontTools + Brotli', 'mode': 'sourced font; lossless WOFF2 encoding',
        'model': None, 'plan': 'not applicable; no generation', 'client': 'Codex command line',
        'prompt': None, 'requestedSize': 'WOFF2; original glyph set', 'actualSize': (folder/name).stat().st_size,
        'references': references,
        'licence': 'SIL Open Font License 1.1', 'licenceFile': licence, 'licenceSha256': sha(folder/licence),
        'postProcess': [entry['processing']], 'humanEdits': [],
        'recipeScript': 'scripts/font-recipes.py', 'recipeScriptSha256': sha(pathlib.Path(__file__).resolve()),
        'processingScript': 'scripts/fonts.py', 'processingScriptSha256': sha(base/'scripts/fonts.py'),
        'masters': 'art-masters/R14/fonts/',
        'provenanceMarks': 'No image generation; font metadata retained through FontTools encoding.',
        'sha256': sha(folder/name),
    }
    (folder/(name + '.recipe.json')).write_text(json.dumps(recipe, indent=2) + '\n', encoding='utf-8')
print('Eight sourced-font recipes written.')
