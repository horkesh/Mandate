import {expect,it} from 'vitest';
import {spawnSync} from 'node:child_process';
it('plans missing geometry in dependency order and rejects a missing pack before fetching',()=>{
 const code=`import runpy,tempfile,pathlib,json
m=runpy.run_path('scripts/map-setup.py',run_name='setup_test')
with tempfile.TemporaryDirectory(dir='node_modules') as tmp:
 root=pathlib.Path(tmp).resolve(); proto=root/'prototypes/desk';proto.mkdir(parents=True)
 try:m['geography_plan'](proto);raise AssertionError('missing pack was accepted')
 except RuntimeError as e:assert 'Missing pack input' in str(e)
 for pack in ['union-1861','testbed']:
  f=root/f'packs/{pack}/source/world/regions.csv';f.parent.mkdir(parents=True);f.write_text('id\\nplace\\n')
 assert m['geography_plan'](proto)==['base','rail','rivers','detail','relief']
 print('missing input and dependency order pass')`;
 const result=spawnSync('python',['-B','-c',code],{encoding:'utf8'});
 expect(result.stderr).toBe('');expect(result.status,result.stdout).toBe(0);
});
