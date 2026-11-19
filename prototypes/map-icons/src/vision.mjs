// Machado, Oliveira, Fernandes, TVCG 15(6), 2009, pp.1291–1298.
// Author's Table 1, severity 1.0 (dichromacy), accessed 2026-11-17:
// https://www.inf.ufrgs.br/~oliveira/pubs_files/CVD_Simulation/CVD_Simulation.html
export const matrices = {
  protanopia: [[0.152286,1.052583,-0.204868],[0.114503,0.786281,0.099216],[-0.003882,-0.048116,1.051998]],
  deuteranopia: [[0.367322,0.860646,-0.227968],[0.280085,0.672501,0.047413],[-0.011820,0.042940,0.968881]],
  tritanopia: [[1.255528,-0.076749,-0.178779],[-0.078411,0.930809,0.147602],[0.004733,0.691367,0.303900]],
};
export const linear = c => c<=0.04045?c/12.92:((c+0.055)/1.055)**2.4;
const encoded = c => c<=0.0031308?12.92*c:1.055*c**(1/2.4)-0.055;
export function simulate(rgb, type='normal') {
  if(type==='normal')return [...rgb];
  const v=rgb.map(c=>linear(c/255));
  return matrices[type].map(row=>encoded(Math.min(1,Math.max(0,row.reduce((s,n,i)=>s+n*v[i],0))))*255);
}
export function contrast(a,b) {
  const luminance = v=>v.map(c=>linear(c/255)).reduce((s,n,i)=>s+n*[0.2126,0.7152,0.0722][i],0);
  const x=luminance(a),y=luminance(b);
  return (Math.max(x,y)+0.05)/(Math.min(x,y)+0.05);
}
export function filterMatrix(type) {
  return matrices[type].map(row=>[...row,0,0].join(' ')).join(' ')+' 0 0 0 1 0';
}
