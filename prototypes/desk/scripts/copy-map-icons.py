import hashlib,json,shutil
from pathlib import Path
ROOT=Path(__file__).resolve().parents[3]
OUT=ROOT/'prototypes/desk/web/map/icons';OUT.mkdir(parents=True,exist_ok=True)
for name in ['hq-army','enemy-point','entrenchment','battle','pocket-ring','support-request','key-point','edit-number']:
    source=ROOT/f'prototypes/map-icons/icons/rough/{name}.svg'
    target=OUT/source.name
    shutil.copyfile(source,target)
    digest=hashlib.sha256(target.read_bytes()).hexdigest()
    recipe={'asset':target.relative_to(ROOT).as_posix(),'request':'R18','brief':'ASSETS.md#1','date':'2026-11-17','plan':'owner previously recorded ChatGPT Pro 100','client':'Codex command-line session','model':'not exposed by this tool','apiKeyUnset':'not required; no image model',
            'tool':'Python file copy','mode':'byte-for-byte reuse of R16 rough SVG','prompt':None,'references':[{'path':source.relative_to(ROOT).as_posix(),'sha256':digest,'sourceRecipe':source.relative_to(ROOT).as_posix()+'.recipe.json'}],
            'requestedSize':'24-unit vector','actualSize':'24-unit vector','variantsMade':1,'variantChosen':1,'humanEdits':[],'postProcess':[],'provenanceMarks':'procedural SVG; no embedded image-model marks','sha256':digest}
    Path(str(target)+'.recipe.json').write_text(json.dumps(recipe,indent=2)+'\n',encoding='utf8')
print('Copied 8 unchanged R16 icons and wrote their consumption recipes')
