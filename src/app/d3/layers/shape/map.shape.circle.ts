import {Component, Directive, Input, ElementRef, Output, EventEmitter} from '@angular/core';
import {isPresent} from '@angular/compiler/src/facade/lang';

import {AbstractLayer, AbstractLayerConfiguration} from '../map.layer';
import {ShapeCircleLayer, ShapeCircleLayerStyles} from '../../model/map.model';
import {SHAPE_CIRCLE_DEFAULTS} from '../layers.defaults';
import {getPropertyValue, hasProperty} from '../../util/properties.utils';
import {MapService} from '../../services/map.service';
import {MapUpdateService} from '../../services/map.update.service';
import {ExpressionsService} from '../../../services/expressions/expressions.service';

declare var d3: any;

/**
 * Configuration directive of graticule layer.
 */
@Directive({
  selector: 'shapeCircle',
  providers: [
    { provide: AbstractLayerConfiguration, useExisting: ShapeCircleLayerConfigurationDirective }
  ]
})
export class ShapeCircleLayerConfigurationDirective extends AbstractLayerConfiguration {
  differStylesBorders: any;
  differStylesBackground: any;
  differStylesLines: any;

  @Input()
  styles:ShapeCircleLayerStyles;

  @Output()
  layerLoaded:EventEmitter<boolean> = new EventEmitter<boolean>();
  
  public layerConfiguration: /*ShapeCircleLayer*/any;

  /*constructor(differs: KeyValueDiffers) {
    super();
    this.differStylesBorders = differs.find([]).create(null);
    this.differStylesBackground = differs.find([]).create(null);
    this.differStylesLines = differs.find([]).create(null);
    this.differDisplay = differs.find([]).create(null);
  }*/

  ngOnInit() {
    console.log('>> GeodataLayerConfigurationDirective.init')
    this.layerConfiguration = /*<ShapeCircleLayer>*/{
		  	id: 'shape', type: 'shape',
			data: {
			  url: 'data/meteorites-all.csv',
              type: 'csv',
              id: 'name',
              where: 'd.mass < 50000',
              order: {
                field: 'mass',
                ascending: false
              }
            },
            name: 'Meteorites',
            display: {
              shape: {
                type: 'circle',
                radiusExpr: 'd.mass / 5000000',
                originExpr: '[ d.reclong, d.reclat ]',
                opacity: '0.75',
                /*threshold: {
                  values: [1800, 1900, 1950, 2000, 2015],
                  colors: ['#ffffb2', '#fed976', '#feb24c',
                  '#fd8d3c', '#f03b20', '#bd0026']
                },
                value: 'parseDate(d.year).getFullYear()'*/
              }
            }
    };
    console.log(this.layerConfiguration);
  }

  ngDoCheck() {
    if (!this.layer) {
      return;
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
    /*var changesDisplay = this.differDisplay.diff({
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
    }*/
  }

  registerLayer(layer) {
    this.layer = layer;
    this.layer.layerLoaded.subscribe(() => {
      this.layerLoaded.emit(true);
    });
  }
}

@Component({
  selector: '[shape]',
  template: `
  `
})
export class ShapeCircleLayerComponent extends AbstractLayer {
  @Input()
  layer: ShapeCircleLayer;
  @Input()
  path: any;
  @Input()
  configuration:any;

  data: any;

  constructor(private eltRef: ElementRef,
      private mapService: MapService,
      private updateService: MapUpdateService,
      private expressionService: ExpressionsService) {
    super();
  }

  /**
   * Detect path updates
   */
  ngOnChanges(changes) {
    if (this.initialized && changes.path) {
      var layerElement = d3.select(this.eltRef.nativeElement);
      layerElement.selectAll('path')
        .attr('d', this.path);
    }
  }

  /**
   * Detect layer configuration updates
   */
  ngOnInit() {
    this.updateService.registerOnLayerConfigurationUpdated(this.layer).subscribe(
      (updates) => {
        this.handleUpdates(updates);
      }
    );
  }

  /**
   * Update layer configuration updates
   */
  handleUpdates(updates) {
    this.layer = updates.layer;

    var pathElements = d3.select(this.eltRef.nativeElement).selectAll('path');

    // Fill
    if (this.hasStylesBackgroundColor(updates.diffs)) {
      pathElements.style('fill',
        this.getStylesBackgroundColor(updates.diffs));
    }
    // Opacity
    if (this.hasStylesBackgroundOpacity(updates.diffs)) {
      pathElements.style('opacity',
        this.getStylesBackgroundOpacity(updates.diffs));
    }

    // Lines
    if (this.hasStylesLinesColor(updates.diffs)) {
      pathElements.style('stroke',
        this.getStylesLinesColor(updates.diffs));
    }
    if (this.hasStylesLinesWidth(updates.diffs)) {
      pathElements.style('stroke-width',
        this.getStylesLinesWidth(updates.diffs));
    }
    if (this.hasStylesLinesOpacity(updates.diffs)) {
      pathElements.style('stroke-opacity',
        this.getStylesLinesOpacity(updates.diffs));
    }
  }

  /**
    * Trigger the layer initialization where data are there
    */
  ngAfterViewInit() {
    this.updateService.registerOnLayerDataLoaded(this.layer.data.url).subscribe(data => {
      this.initializeLayer(data.data);
    });
  }

  /** 
    * Initialize the layer based on data
    */
  initializeLayer(data: any) {
    var layerElement = d3.select(this.eltRef.nativeElement);

    var circle = d3.geo.circle();

    var originExpression = this.getShapeOriginExpression(this.layer);
    var radius = this.getShapeRadius(this.layer);
    var radiusExpression = this.getShapeRadiusExpression(this.layer);

    var backgroundColor = this.getStylesBackgroundColor(this.layer);
    var backgroundOpacity = this.getStylesBackgroundOpacity(this.layer);
    var linesColor = this.getStylesLinesColor(this.layer);
    var linesWidth = this.getStylesLinesWidth(this.layer);
    var linesOpacity = this.getStylesLinesOpacity(this.layer);

    var pathElements = layerElement.selectAll('path')
          .data(data)
          .enter()
          .append('path')
          .datum((d, i) => {
            var orig = this.expressionService.evaluate(originExpression,
              { d, i/*, additionalContext*/ });
            orig[0] = parseFloat(orig[0]);
            orig[1] = parseFloat(orig[1]);
            var rad = radiusExpression ?
                this.expressionService.evaluate(radiusExpression,
                   { d, i/*, additionalContext*/ }) :
                radius;
            var c = circle
              .origin(orig)
              .angle(rad)({d,i});
            c.d = d;
            return c;
          })
          .attr('id', function(d) {
            return d.d.name;
          })
          .attr('class', 'point')
          .attr('d', this.path)
          .style('opacity', backgroundOpacity)
          .style('stroke', linesColor)
          .style('stroke-width', linesWidth)
          .style('stroke-opacity', linesOpacity)
          .style('fill', backgroundColor);

    this.initialized = true;
    this.layerLoaded.next(true);
  }

  // Direct getters for property values

  getShapeConfiguration(obj) {
    return getPropertyValue(obj, ['display', 'shape'], {});
  }

  getShapeOriginExpression(obj) {
    return getPropertyValue(obj,
      ['display', 'shape', 'originExpr'],
      '');
  }

  getShapeRadius(obj) {
    return getPropertyValue(obj,
      ['display', 'shape', 'radius'],
      '');
  }

  getShapeRadiusExpression(obj) {
    return getPropertyValue(obj,
      ['display', 'shape', 'radiusExpr'],
      '');
  }

  hasStylesBackgroundColor(obj: any) {
    return hasProperty(obj,
      ['styles', 'background', 'color']);
  }

  getStylesBackgroundColor(obj: any) {
    return getPropertyValue(obj,
      ['styles', 'background', 'color'],
      SHAPE_CIRCLE_DEFAULTS.BACKGROUND_COLOR);
  }

  hasStylesBackgroundOpacity(obj: any) {
    return hasProperty(obj,
      ['styles', 'background', 'opacity']);
  }

  getStylesBackgroundOpacity(obj: any) {
    return getPropertyValue(obj,
      ['styles', 'background', 'opacity'],
      SHAPE_CIRCLE_DEFAULTS.BACKGROUND_OPACITY);
  }

  hasStylesLinesColor(obj: any) {
    return hasProperty(obj,
      ['styles', 'lines', 'color']);
  }

  getStylesLinesColor(obj: any) {
    return getPropertyValue(obj,
      ['styles', 'lines', 'color'],
      SHAPE_CIRCLE_DEFAULTS.LINES_COLOR);
  }

  hasStylesLinesWidth(obj: any) {
    return hasProperty(obj,
      ['styles', 'lines', 'width']);
  }

  getStylesLinesWidth(obj: any) {
    return getPropertyValue(obj,
      ['styles', 'lines', 'width'],
      SHAPE_CIRCLE_DEFAULTS.LINES_WIDTH);
  }

  hasStylesLinesOpacity(obj: any) {
    return hasProperty(obj,
      ['styles', 'lines', 'opacity']);
  }

  getStylesLinesOpacity(obj: any) {
    return getPropertyValue(obj,
      ['styles', 'lines', 'opacity'],
      SHAPE_CIRCLE_DEFAULTS.LINES_OPACITY);
  }
}