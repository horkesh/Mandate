import {geoAlbers,geoMercator} from 'd3-geo';
/** Central meridian between the eastern and western theatres, shared by bake and play. */
export function mapProjection(schematic:boolean){return schematic?geoMercator().center([-1.4,52]).scale(20000).translate([0,0]):geoAlbers().parallels([29.5,45.5]).rotate([85,0]).center([0,38]).scale(1100).translate([0,0]);}
