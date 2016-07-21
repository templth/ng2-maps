import {MapComponent} from './d3/map';
import {GraticuleLayerConfigurationDirective} from './d3/layers/graticule/map.graticule';
import {GeodataLayerConfigurationDirective} from './d3/layers/geodata/map.geodata';
import {ShapeCircleLayerConfigurationDirective} from './d3/layers/shape/map.shape.circle';

export const SVG_MAP_DIRECTIVES = [
  MapComponent, GraticuleLayerConfigurationDirective,
  GeodataLayerConfigurationDirective,
  ShapeCircleLayerConfigurationDirective
];