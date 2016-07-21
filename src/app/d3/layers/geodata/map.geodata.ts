import {Component, Directive, Input, ElementRef, EventEmitter, Output} from '@angular/core';

import {AbstractLayer, AbstractLayerConfiguration} from '../map.layer';
import {GeodataLayer} from '../../model/map.model';
import {GEODATA_DEFAULTS} from '../layers.defaults';
import {getPropertyValue, hasProperty} from '../../util/properties.utils';
import {MapUpdateService} from '../../services/map.update.service';
import {ExpressionsService} from '../../../services/expressions/expressions.service';

declare var d3: any;
declare var topojson: any;

/**
 * Configuration directive of graticule layer.
 */
@Directive({
  selector: 'geodata',
  providers: [
    { provide: AbstractLayerConfiguration, useExisting: GeodataLayerConfigurationDirective }
  ]
})
export class GeodataLayerConfigurationDirective extends AbstractLayerConfiguration {
  differStylesBorders: any;
  differStylesBackground: any;
  differStylesLines: any;
  differDisplay: any;

  /*@Input()
  styles:GraticuleLayerStyles;
  @Input()
  displayBackground: boolean;
  @Input()
  displayLines: boolean;
  @Input()
  displayBorders: boolean;*/

  @Output()
  layerLoaded:EventEmitter<boolean> = new EventEmitter<boolean>();
  
  public layerConfiguration: GeodataLayer;

  /*constructor(differs: KeyValueDiffers) {
    super();
    this.differStylesBorders = differs.find([]).create(null);
    this.differStylesBackground = differs.find([]).create(null);
    this.differStylesLines = differs.find([]).create(null);
    this.differDisplay = differs.find([]).create(null);
  }*/

  ngOnInit() {
    console.log('>> GeodataLayerConfigurationDirective.init')
    this.layerConfiguration = <GeodataLayer>{
      id: 'geodata',
      type: 'geodata',
      data: {
        url: 'data/continent.json',
        type: 'topojson'
      },
	    display: {
	 	    fill: {
	        categorical: { distinctNeighbors : true }
	  	  }
	    }
    };
    console.log(this.layerConfiguration);
  }

  /*ngDoCheck() {
    if (!this.layer) {
      return;
    }

    // Detect changes in styles / borders
    var changesStylesBorders = this.differStylesBorders.diff(this.styles.borders);
    if (changesStylesBorders) {
      changesStylesBorders.forEachChangedItem(r => {
        let diffs = {
          styles: { borders: {} }
        };
        diffs.styles.borders[r.key] = r.currentValue;
        this.layer.handleUpdates({
          layer: this.layerConfiguration,
          diffs
        });
      });
    }

    // Detect changes in styles / background
    var changesStylesBackground = this.differStylesBackground.diff(this.styles.background);
    if (changesStylesBackground) {
      changesStylesBackground.forEachChangedItem(r => {
        let diffs = {
          styles: { background: {} }
        };
        diffs.styles.background[r.key] = r.currentValue;
        this.layer.handleUpdates({
          layer: this.layerConfiguration,
          diffs
        });
      });
    }

    // Detect changes in styles / lines
    var changesStylesLines = this.differStylesLines.diff(this.styles.lines);
    if (changesStylesLines) {
      changesStylesLines.forEachChangedItem(r => {
        let diffs = {
          styles: { lines: {} }
        };
        diffs.styles.lines[r.key] = r.currentValue;
        this.layer.handleUpdates({
          layer: this.layerConfiguration,
          diffs
        });
      });
    }

    // Detect changes in display
    var changesDisplay = this.differDisplay.diff({
      displayBackground: this.displayBackground,
      displayBorders: this.displayBorders,
      displayLines: this.displayLines
    });
    if (changesDisplay) {
      changesDisplay.forEachChangedItem(r => {
        let diffs = null;
        if (r.key === 'displayBackground') {
          diffs = { display: { background: r.currentValue } };
        } else if (r.key === 'displayLines') {
          diffs = { display: { lines: r.currentValue } };
        } else if (r.key === 'displayBorders') {
          diffs = { display: { borders: r.currentValue } };
        }
        this.layer.handleUpdates({
          layer: this.layerConfiguration,
          diffs
        });
      });
    }
  }*/

  registerLayer(layer) {
    this.layer = layer;
    this.layer.layerLoaded.subscribe(() => {
      this.layerLoaded.emit(true);
    });
  }
}

/*
 * A geodata layer can be configured using the following content:
 *
 * {
 *   id: 'worldLayer',
 *   type: 'geodata',
 *   rank: 2,
 *   data: {
 *     layer: {
 *       url: 'http://localhost:9000/scripts/json/continent.json',
 *       rootObject: 'countries',
 *       type: 'topojson'
 *     },
 *     threshold: {
 *       url: 'http://localhost:9000/scripts/json/continent.json',
 *       type: 'csv'
 *     }
 *   },
 *   display: {
 *     fill: {
 *       categorical: {
 *         name: 'category20b',
 *         value: 'i'
 *         }//,
 *              //value: 'd.id === 840 || d.id === 250 ? "#ff0000" : "#000000"'
 *       },
 *       threshold: {
 *         values: [ 0.02, 0.04, 0.06, 0.08, 0.10 ],
 *         colors: [ '#f2f0f7', '#dadaeb', '#bcbddc',
 *                '#9e9ac8', '#756bb1', '#54278f' ]
 *         value: 'd.rate'
 *       }
 *     }
 *   }
 *   styles: {
 *     background: {
 *       fill: '#ff0000'
 *     },
 *     lines: {
 *       stroke: '#fff',
 *       strokeWidth: '1px',
 *       strokeOpacity: '1'
 *     }
 *   }
 * }
 */

@Component({
  selector: '[geodata]',
  template: ''
})
export class GeodataLayerComponent extends AbstractLayer {
  @Input()
  layer: GeodataLayer;
  @Input()
  path: any;
  @Input()
  configuration:any;

  constructor(private eltRef: ElementRef,
      private updateService: MapUpdateService,
      private expressionService: ExpressionsService) {
    super();
  }

  ngOnChanges(changes) {
    if (this.initialized && changes.path) {
      var layerElement = d3.select(this.eltRef.nativeElement);
      layerElement.selectAll('path').attr('d', this.path);
    }
  }

  ngOnInit() {
    console.log('>> ngOnInit - this.layer = '+this.layer);
  }

  ngAfterViewInit() {
    console.log('>> ngAfterViewInit - this.layer = '+this.layer);
    console.log('this.layer.data.url = '+this.layer.data.url);
    this.updateService.registerOnLayerDataLoaded(this.layer.data.url).subscribe(data => {
      console.log('data received');
      this.initializeLayer(data.data);
    });
  }

  initializeLayer(data: any) {
    let layerElement = d3.select(this.eltRef.nativeElement);

    // TODO
    let features = topojson.feature(data,
      data.objects['countries']).features;

    var backgroundFill = this.getStylesBackgroundFill(this.layer);
    var linesStroke = this.getStylesLinesStroke(this.layer);
    var linesStrokeWidth = this.getStylesLinesStrokeWidth(this.layer);
    var linesStrokeOpacity = this.getStylesLinesStrokeOpacity(this.layer);
    var fillProperty = this.initializeFill(data, features, backgroundFill);

    layerElement.selectAll('path')
        .data(features)
        .enter()
        .append('path')
        .attr('id', function(d) { return d.id; })
        .attr('d', this.path)
        .style('fill', fillProperty)
        .style('stroke', linesStroke)
        .style('stroke-width', linesStrokeWidth)
        .style('stroke-opacity', linesStrokeOpacity)
        .on('hover', () => console.log('hover'))
        .on('blur', () => console.log('blur'));

    this.initialized = true;
    this.layerLoaded.next(true);
  }

  /**
   *
   */
  initializeFill(data: any, features: any, backgroundFill: string): any {
    if (this.hasDisplayFillCategorical(this.layer)) {
      // Categorical
      return this.initializeCategoricalFill(data, features);
    } else if (this.hasDisplayFillThreshold(this.layer)) {
      // Threshold
      return this.initializeThresholdFill(data, features);
    } else if (this.hasDisplayFillChoropleth(this.layer)) {
      // Choropleth
      return this.initializeChoroplethFill(data, features);
    } else {
      // Default
      return backgroundFill;
    }
  }

  initializeCategoricalFill(data: any, features: any) {
    let categoricalConfig = this.getDisplayFillCategorical(this.layer);
    let color = d3.scale.category20b();
    let colorRangeSize = 20;

    if (!categoricalConfig.distinctNeighbors) {
      // category background
      return (d, i) => {
        return color(i);
      };
    } else {
      // category background with neighbors support
      var neighbors = topojson.neighbors(data.objects.countries.geometries);
      return (d, i) => {
        d.color = d3.max(neighbors[i], function(n) {
          return features[n].color || 0;
        }) + 1;
        d.color = d.color * colorRangeSize;
        return color(d.color);
      };
    }
  }

  initializeThresholdFill(data: any, features: any) {
    let thresholdConfig = this.getDisplayFillThreshold(this.layer);
    
    var valueExpr = thresholdConfig.value;
    var values = {};
    data.forEach(data, function(d, i) {
      values[d.id] = this.expressionService.evaluate(
        valueExpr, { d, i }/*, additionalContext*/);
    });

    var color = d3.scale.threshold()
      .domain(thresholdConfig.values)
      .range(thresholdConfig.colors);

    return (d) => {
      return color(values[d.id]);
    };
  }

  handleUpdates(diff) {

  }

  initializeChoroplethFill(data: any, features: any) {
    let choroplethConfig = this.getDisplayFillChoropleth(this.layer);

    var valueExpr = choroplethConfig.value;
    var values = {};
    data.forEach(data, function(d, i) {
      values[d.id] = this.expressionService.evaluate(
        valueExpr, { d, i }/*, additionalContext*/);
    });

    var color = d3.scale.quantize()
      .domain(choroplethConfig.values)
      .range(choroplethConfig.colors);

    return (d) => {
      return color(values[d.id]);
    };
  }

  // Direct getters for property values

  hasStylesBackgroundFill(obj: any) {
    return hasProperty(obj,
      ['styles', 'background', 'color']);
  }

  getStylesBackgroundFill(obj: any) {
    return getPropertyValue(obj,
      ['styles', 'background', 'color'],
      GEODATA_DEFAULTS.BACKGROUND_COLOR);
  }

  hasDisplayFillCategorical(obj: any) {
    return hasProperty(obj,
      ['display', 'fill', 'categorical']);
  }

  getDisplayFillCategorical(obj: any) {
    return getPropertyValue(obj,
      ['display', 'fill', 'categorical'],
      {});
  }

  hasDisplayFillThreshold(obj: any) {
    return hasProperty(obj,
      ['display', 'fill', 'threshold']);
  }

  getDisplayFillThreshold(obj: any) {
    return getPropertyValue(obj,
      ['display', 'fill', 'threshold'],
      {});
  }

  hasDisplayFillChoropleth(obj: any) {
    return hasProperty(obj,
      ['display', 'fill', 'choropleth']);
  }

  getDisplayFillChoropleth(obj: any) {
    return getPropertyValue(obj,
      ['display', 'fill', 'choropleth'],
      {});
  }

  hasStylesLinesStroke(obj: any) {
    return hasProperty(obj,
      ['styles', 'lines', 'color']);
  }

  getStylesLinesStroke(obj: any) {
    return getPropertyValue(obj,
      ['styles', 'lines', 'stroke'],
      GEODATA_DEFAULTS.LINES_COLOR);
  }

  hasStylesLinesStrokeWidth(obj: any) {
    return hasProperty(obj,
      ['styles', 'lines', 'width']);
  }

  getStylesLinesStrokeWidth(obj: any) {
    return getPropertyValue(obj,
      ['styles', 'lines', 'width'],
      GEODATA_DEFAULTS.LINES_WIDTH);
  }

  hasStylesLinesStrokeOpacity(obj: any) {
    return hasProperty(obj,
      ['styles', 'lines', 'opacity']);
  }

  getStylesLinesStrokeOpacity(obj: any) {
    return getPropertyValue(obj,
      ['styles', 'lines', 'opacity'],
      GEODATA_DEFAULTS.LINES_OPACITY);
  }
}