import { roughen, hashSeed } from './roughen.mjs';

const path = (points, closed = false, fill = false) => ({ points, closed, fill });
const line = (...points) => path(points);
const polygon = (...points) => path(points, true);
const box = (x,y,w,h) => polygon([x,y],[x+w,y],[x+w,y+h],[x,y+h]);
const ellipse = (x,y,rx,ry=rx,start=0,end=2*Math.PI) => path(Array.from({length:33},(_,i)=>[x+rx*Math.cos(start+(end-start)*i/32),y+ry*Math.sin(start+(end-start)*i/32)]), end-start===2*Math.PI);
const dot = (x,y,r) => ({ ...ellipse(x,y,r), fill:true });
const icon = (id,group,shapes,extra={}) => ({id,group,shapes,...extra});

// Shapes are new abstract conventions, not historical insignia or flag designs.
// Each closed outline has an explicit body; open marks keep their stroke envelope.
export const icons = [
  icon('hq-army','headquarters',[line([4,9],[12,3],[20,9]),line([4,14],[12,8],[20,14]),line([4,19],[12,13],[20,19]),line([8,21],[16,21])]),
  icon('hq-department','headquarters',[line([3,19],[3,5],[21,5],[21,19]),line([7,9],[17,9]),line([7,13],[17,13]),line([7,17],[17,17])]),
  icon('hq-corps','headquarters',[polygon([3,7],[7,3],[12,8],[17,3],[21,7],[12,19]),line([8,21],[16,21])]),
  icon('hq-temporary','headquarters',[polygon([4,17],[8,5],[16,5],[20,17]),line([8,20],[16,20]),line([12,17],[12,22])]),
  icon('hq-detachment','headquarters',[line([4,5],[12,12],[20,5]),line([4,12],[12,19],[20,12]),dot(12,21,0.35)]),
  icon('squadron','naval',[polygon([3,13],[21,13],[17,19],[7,19]),line([7,13],[7,6],[11,6]),line([16,13],[16,3]),line([5,21],[19,21])]),
  icon('flotilla','naval',[polygon([3,8],[11,8],[9,13],[5,13]),polygon([13,14],[21,14],[19,19],[15,19]),line([5,4],[9,4]),line([15,10],[19,10]),line([3,21],[9,21])]),
  icon('fort','works',[polygon([3,3],[9,5],[15,5],[21,3],[19,9],[19,15],[21,21],[15,19],[9,19],[3,21],[5,15],[5,9]),box(9,9,6,6)]),
  icon('depot','places',[box(3,9,18,9),line([3,9],[21,18]),line([3,18],[21,9]),line([7,6],[17,6])]),
  icon('port','places',[line([3,4],[3,19],[8,19],[8,10]),line([21,4],[21,19],[16,19],[16,10]),line([8,6],[12,3],[16,6]),line([10,21],[14,21])]),
  icon('arsenal-yard','places',[polygon([3,21],[3,10],[8,6],[8,11],[13,6],[13,11],[18,6],[18,3],[21,3],[21,21]),line([7,16],[9,16]),line([13,16],[15,16])]),
  icon('town-small','places',[dot(12,12,3)]),
  icon('town-medium','places',[polygon([4,17],[4,10],[8,6],[12,10],[12,17]),polygon([13,19],[13,13],[17,9],[21,13],[21,19])]),
  icon('town-large','places',[polygon([3,20],[3,13],[6,10],[9,13],[9,20]),polygon([10,20],[10,7],[13,3],[16,7],[16,20]),box(18,13,3,7)]),
  icon('key-point','places',[polygon([12,3],[21,12],[12,21],[3,12]),dot(12,12,1.5)]),
  icon('rail-junction','infrastructure',[line([5,21],[12,13],[12,3]),line([19,21],[12,13]),line([7,5],[17,5]),line([7,9],[17,9]),line([4,16],[9,20]),line([15,20],[20,16])]),
  icon('rail-cut','infrastructure',[line([4,3],[4,10]),line([9,3],[9,8]),line([15,16],[15,21]),line([20,14],[20,21]),line([3,18],[21,6]),line([5,21],[19,3])]),
  icon('bridge-out','infrastructure',[line([3,4],[3,20]),line([21,4],[21,20]),line([3,9],[8,9],[10,12]),line([14,12],[16,9],[21,9]),line([3,15],[7,15]),line([17,15],[21,15]),line([10,4],[14,20])]),
  icon('ford','infrastructure',[line([3,7],[7,5],[11,7],[15,5],[21,7]),line([3,18],[7,16],[11,18],[15,16],[21,18]),dot(6,12,0.9),dot(12,12,0.9),dot(18,12,0.9)]),
  icon('enemy-area','estimates',[line([3,10],[5,5],[10,3]),line([15,3],[20,6],[21,11]),line([21,16],[17,20],[12,21]),line([7,20],[3,17],[3,15]),line([7,13],[10,9]),line([12,16],[16,10])],{semantic:'estimate'}),
  icon('enemy-point','estimates',[line([5,8],[5,4],[9,4]),line([15,4],[19,4],[19,8]),line([19,16],[19,20],[15,20]),line([9,20],[5,20],[5,16]),dot(12,12,1.6)],{semantic:'estimate'}),
  icon('observer','communications',[ellipse(12,12,9,4),ellipse(12,12,2),line([7,4],[7,6]),line([17,18],[17,20])]),
  icon('courier','communications',[polygon([3,6],[16,6],[16,10],[22,10],[22,15],[16,15],[16,19],[3,19]),line([3,6],[10,12],[16,6]),line([3,19],[8,14])],{availability:'reserved-no-transit-view'}),
  icon('wire-in-transit','communications',[line([3,7],[7,7],[7,3]),line([4,7],[4,21]),line([17,3],[17,7],[21,7]),line([20,7],[20,21]),line([7,7],[10,10],[14,8],[17,7]),line([9,17],[15,17]),line([13,14],[16,17],[13,20])],{availability:'reserved-no-transit-view'}),
  icon('telegraph-office','communications',[polygon([3,21],[3,12],[8,8],[13,12],[13,21]),line([18,21],[18,3]),line([15,6],[21,6]),line([3,16],[8,16])]),
  icon('battle','works',[polygon([12,2],[14,8],[21,5],[17,11],[22,16],[15,16],[13,22],[10,16],[3,19],[7,12],[2,8],[9,8])]),
  icon('siege','works',[ellipse(12,12,9,9,0.25*Math.PI,1.75*Math.PI),line([19,6],[21,3]),line([19,18],[21,21]),box(9,8,6,8),line([3,12],[6,12])]),
  icon('entrenchment','works',[line([3,15],[3,11],[6,11],[6,7],[10,7],[10,11],[14,11],[14,7],[18,7],[18,11],[21,11],[21,15]),line([3,18],[21,18])]),
  icon('pocket-ring','works',[ellipse(12,12,6,9),line([5,5],[9,8]),line([19,5],[15,8]),line([5,19],[9,16]),line([19,19],[15,16]),line([10,12],[14,12])]),
  icon('support-request','annotations',[polygon([3,4],[21,4],[21,13],[13,13],[8,20],[8,13],[3,13]),line([7,8],[17,8])]),
  icon('axis-number','annotations',[polygon([3,9],[15,9],[15,4],[21,12],[15,20],[15,15],[3,15])],{slot:[5,10,8,4]}),
  icon('edit-number','annotations',[ellipse(12,12,7),line([17,6],[20,3]),line([17,3],[20,6])],{slot:[8,8,8,8],semantic:'president-mark'}),
  icon('correction-initials','annotations',[line([3,4],[3,12],[14,12],[14,4]),line([4,17],[20,17]),line([8,21],[20,10])],{slot:[5,4,7,6],semantic:'correction'}),
  icon('spare-lozenge','spares',[polygon([3,8],[17,8],[21,16],[7,16]),line([6,4],[16,4])],{availability:'unassigned'}),
  icon('spare-bracket','spares',[line([6,3],[3,3],[3,21],[6,21]),line([18,3],[21,3],[21,21],[18,21]),polygon([12,7],[16,12],[12,17],[8,12])],{availability:'unassigned'}),
  icon('spare-fan','spares',[polygon([3,19],[7,4],[12,19],[17,4],[21,19]),line([7,21],[17,21])],{availability:'unassigned'}),
];

const n = x => Number(x.toFixed(3));
export function renderSVG(icon, { rough = false, seed = 4816 } = {}) {
  const paths = icon.shapes.map((shape, i) => {
    const s = rough ? roughen(shape, hashSeed(`${seed}:${icon.id}:${i}`)) : shape;
    const d = s.points.map((p,j)=>`${j?'L':'M'}${n(p[0])} ${n(p[1])}`).join(' ') + (s.closed?' Z':'');
    return `  <path d="${d}" fill="${s.fill?'currentColor':'none'}"/>`;
  }).join('\n');
  // Text belongs beside the SVG in the consuming renderer. Slots remain empty.
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="var(--icon-stroke, 1.65)" stroke-linecap="round" stroke-linejoin="round">\n${paths}\n</svg>\n`;
}
