import {Component, Directive, Input, Output, EventEmitter, ElementRef, KeyValueDiffers} from '@angular/core';
import {isPresent} from '@angular/compiler/src/facade/lang';

import {AbstractLayer, AbstractLayerConfiguration} from '../map.layer';
import {GraticuleLayer, GraticuleLayerStyles} from '../../model/map.model';
import {GRATICULE_DEFAULTS} from '../layers.defaults';
import {getPropertyValue, hasProperty} from '../../util/properties.utils';
import {MapUpdateService} from '../../services/map.update.service';

declare var d3: any;

/**
 * Configuration directive of graticule layer.
 */
@Directive({
  selector: 'graticule',
  providers: [
    { provide: AbstractLayerConfiguration, useExisting: GraticuleLayerConfigurationDirective }
  ]
})
export class GraticuleLayerConfigurationDirective extends AbstractLayerConfiguration {
  differStylesBorders: any;
  differStylesBackground: any;
  differStylesLines: any;
  differDisplay: any;

  @Input()
  styles:GraticuleLayerStyles;
  @Input()
  displayBackground: boolean;
  @Input()
  displayLines: boolean;
  @Input()
  displayBorders: boolean;

  @Output()
  layerLoaded:EventEmitter<boolean> = new EventEmitter<boolean>();
  
  public layerConfiguration: GraticuleLayer;

  constructor(differs: KeyValueDiffers) {
    super();
    this.differStylesBorders = differs.find([]).create(null);
    this.differStylesBackground = differs.find([]).create(null);
    this.differStylesLines = differs.find([]).create(null);
    this.differDisplay = differs.find([]).create(null);
  }

  ngOnInit() {
    console.log('>> GraticuleLayerConfigurationDirective.init')
    this.layerConfiguration = <GraticuleLayer>{
      type: 'graticule',
      styles: this.styles,
      display: {
        background: this.displayBackground,
        lines: this.displayLines,
        borders: this.displayBorders
      }
    };
    console.log(this.layerConfiguration);
  }

  ngDoCheck() {
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
  }

  registerLayer(layer) {
    this.layer = layer;
    this.layer.layerLoaded.subscribe(() => {
      this.layerLoaded.emit(true);
    });
  }
}

/**
 * A graticule layer can be configured using the following content:
 *
 * {
 *   id: 'graticule',
 *   type: 'graticule',
 *   styles: {
 *     borders: {
 *       color: '',
 *       width: ''
 *     },
 *     background: {
 *       color: ''
 *     },
 *     lines: {
 *       color: '',
 *       width: '',
 *       opacity: '',
 *     }
 *   }
 * }
 */

@Component({
	selector: '[graticule]',
  template: ''
})
export class GraticuleLayerComponent extends AbstractLayer {
  @Input()
  layer: GraticuleLayer;
  @Input()
  path: any;
  @Input()
  configuration:any;

  layerElement:any;
  graticuleData:any;

  constructor(private eltRef: ElementRef,
      private updateService: MapUpdateService) {
    super();
  }

  /**
   * Detect path updates
   */
  ngOnChanges(changes) {
    if (this.initialized && changes.path) {
      var layerElement = d3.select(this.eltRef.nativeElement);
      layerElement.selectAll('path').attr('d', this.path);
    }
  }

  /**
   * Detect layer configuration updates
   */
  ngOnInit() {
    console.log('>> ngOnInit - this.layer = '+this.layer);
    if (this.configuration) {
      this.configuration.registerLayer(this);
    }
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

    // Display background or not
    if (this.hasDisplayBackground(updates.diffs)) {
      if (this.isDisplayBackground(updates.diffs)) {
        this.createBackground();
      } else {
        this.destroyBackground();
      }
    }

    // Display borders or not
    if (this.hasDisplayBorders(updates.diffs)) {
      if (this.isDisplayBorders(updates.diffs)) {
        this.createBorders();
      } else {
        this.destroyBorders();
      }
    }

    // Display lines or not
    if (this.hasDisplayLines(updates.diffs)) {
      if (this.isDisplayLines(updates.diffs)) {
        this.createLines();
      } else {
        this.destroyLines();
      }
    }

    // Styles for borders
    if (this.hasStylesBordersColor(updates.diffs)) {
      d3.select('#borders').style('stroke', 
        this.getStylesBordersColor(updates.diffs));
    }
    if (this.hasStylesBordersWidth(updates.diffs)) {
      d3.select('#borders').style('stroke-width',
        this.getStylesBordersWidth(updates.diffs));
    }

    // Styles for background
    if (this.hasStylesBackgroundColor(updates.diffs)) {
      d3.select('#fill').style('fill',
        this.getStylesBackgroundColor(updates.diffs));
    }

    // Styles for lines
    if (this.hasStylesLinesColor(updates.diffs)) {
      d3.select('#lines').style('stroke',
        this.getStylesLinesColor(updates.diffs));
    }
    if (this.hasStylesLinesWidth(updates.diffs)) {
      d3.select('#lines').style('stroke-width',
        this.getStylesLinesWidth(updates.diffs));
    }
    if (this.hasStylesLinesOpacity(updates.diffs)) {
      d3.select('#lines').style('stroke-opacity',
        this.getStylesLinesOpacity(updates.diffs));
    }
  }

  /**
    * Trigger the graticule layer initialization
    */
  ngAfterViewInit() {
    this.initializeLayer();
  }

  /** 
    * Initialize the graticule layer
    */
  initializeLayer() {
    this.layerElement = d3.select(this.eltRef.nativeElement);
    this.graticuleData = d3.geo.graticule()
      /*.extent([[-180, 27], [180 + 1e-6, 57 + 1e-6]])
      .step([3, 3])*/;

    this.layerElement.append('defs').append('path')
      .datum({ type: 'Sphere' })
      .attr('id', 'sphere')
      .attr('d', this.path);

    // Use element for borders
    if (this.isDisplayBorders(this.layer)) {
      this.createBorders();
    }

    // Use element for background
    if (this.isDisplayBackground(this.layer)) {
      this.createBackground();
    }

    // Path element for lines
    if (this.isDisplayLines(this.layer)) {
      this.createLines();
    }

    this.initialized = true;
    this.layerLoaded.next(true);
  }

  private createBorders() {
    var borderColor = this.getStylesBordersColor(this.layer);
    var borderWidth = this.getStylesBordersWidth(this.layer);
    var bordersElement = null;
    if (this.layerElement.select('#lines')) {
      bordersElement = this.layerElement.insert('use', '#lines');
    } else {
      bordersElement = this.layerElement.append('use');
    }
    bordersElement
        .attr('id', 'borders')
        .style('stroke', borderColor)
        .style('stroke-width', borderWidth)
        .style('fill', 'none')
        .attr('xlink:href', '#sphere');
  }

  private destroyBorders() {
    this.layerElement.select('#borders').remove();
  }

  private createBackground() {
    var backgroundColor = this.getStylesBackgroundColor(this.layer);
    var backgroundElement = null;
    if (this.layerElement.select('#lines')) {
      backgroundElement = this.layerElement.insert('use', '#lines');
    } else {
      backgroundElement = this.layerElement.append('use');
    }
    backgroundElement
      .attr('id', 'fill')
      .style('fill', backgroundColor)
      .attr('xlink:href', '#sphere');
  }

  private destroyBackground() {
    this.layerElement.select('#fill').remove();
  }

  private createLines() {
      var linesColor = this.getStylesLinesColor(this.layer);
      var linesWidth = this.getStylesLinesWidth(this.layer);
      var linesOpacity = this.getStylesLinesOpacity(this.layer);
      this.layerElement.append('path')
        .attr('id', 'lines')
        .datum(this.graticuleData)
        .style('fill', 'none')
        .style('stroke', linesColor)
        .style('stroke-width', linesWidth)
        .style('stroke-opacity', linesOpacity)
        .attr('d', this.path);
  }

  private destroyLines() {
    this.layerElement.select('#lines').remove();
  }

  // Direct getters for property values

  hasDisplayBackground(obj: any) {
    return hasProperty(obj,
      ['display', 'background']);
  }

  isDisplayBackground(obj: any) {
    return getPropertyValue(obj,
      ['display', 'background'],
        GRATICULE_DEFAULTS.DISPLAY_BACKGROUND);
  }

  hasDisplayLines(obj: any) {
    return hasProperty(obj,
      ['display', 'lines']);
  }

  isDisplayLines(obj: any) {
    return getPropertyValue(obj,
      ['display', 'lines'],
        GRATICULE_DEFAULTS.DISPLAY_LINES);
  }

  hasDisplayBorders(obj: any) {
    return hasProperty(obj,
      ['display', 'borders']);
  }

  isDisplayBorders(obj: any) {
    return getPropertyValue(obj,
      ['display', 'borders'],
        GRATICULE_DEFAULTS.DISPLAY_BORDERS);
  }

  hasStylesBordersColor(obj: any) {
    return hasProperty(obj,
      ['styles', 'borders', 'color']);
  }

  getStylesBordersColor(obj: any) {
    return getPropertyValue(obj,
      ['styles', 'borders', 'color'],
        GRATICULE_DEFAULTS.BORDERS_COLOR);
  }

  hasStylesBordersWidth(obj: any) {
    return hasProperty(obj,
      ['styles', 'borders', 'width']);
  }

  getStylesBordersWidth(obj: any) {
    return getPropertyValue(obj,
      ['styles', 'borders', 'width'],
        GRATICULE_DEFAULTS.BORDERS_WIDTH);
  }

  hasStylesBackgroundColor(obj: any) {
    return hasProperty(obj,
      ['styles', 'background', 'color']);
  }

  getStylesBackgroundColor(obj: any) {
    return getPropertyValue(obj,
      ['styles', 'background', 'color'],
        GRATICULE_DEFAULTS.BACKGROUND_COLOR);
  }

  hasStylesLinesColor(obj: any) {
    return hasProperty(obj,
      ['styles', 'lines', 'color']);
  }

  getStylesLinesColor(obj: any) {
    return getPropertyValue(obj,
      ['styles', 'lines', 'color'],
        GRATICULE_DEFAULTS.LINES_COLOR);
  }

  hasStylesLinesWidth(obj: any) {
    return hasProperty(obj,
      ['styles', 'lines', 'width']);
  }

  getStylesLinesWidth(obj: any) {
    return getPropertyValue(obj,
      ['styles', 'lines', 'width'],
        GRATICULE_DEFAULTS.LINES_WIDTH);
  }

  hasStylesLinesOpacity(obj: any) {
    return hasProperty(obj,
      ['styles', 'lines', 'opacity']);
  }

  getStylesLinesOpacity(obj: any) {
    return getPropertyValue(obj,
      ['styles', 'lines', 'opacity'],
        GRATICULE_DEFAULTS.LINES_OPACITY);
  }

}