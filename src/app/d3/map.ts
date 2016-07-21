import {Component, Input, HostListener, ViewContainerRef, ViewChild, ContentChildren, ElementRef, Renderer, ChangeDetectorRef, ComponentRef} from '@angular/core';
import {AbstractLayerConfiguration} from './layers/map.layer';
import {GraticuleLayerComponent, GraticuleLayerConfigurationDirective} from './layers/graticule/map.graticule';
import {GeodataLayerComponent, GeodataLayerConfigurationDirective} from './layers/geodata/map.geodata';
import {ShapeCircleLayerComponent, ShapeCircleLayerConfigurationDirective} from './layers/shape/map.shape.circle';
import {MapService} from './services/map.service';
import {MapUpdateService} from './services/map.update.service';
import {ExpressionsService} from '../services/expressions/expressions.service';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/interval';

declare var d3: any;

// Dynamic adding for layers components
// See: http://stackoverflow.com/questions/36325212/angular-2-dynamic-tabs-with-user-click-chosen-components/36325468#36325468
// See: http://stackoverflow.com/questions/37439696/angular-2-rc1-databinding-and-componentresolver
// See: http://stackoverflow.com/questions/37487977/passing-input-while-creating-angular-2-component-dynamically-using-componentreso

@Component({
	selector: 'map',
	template: `
	  <!--svg preserveAspectRatio="xMidYMid" viewBox="0 0 500 570"><!-- width="786" height="477.63326226012794"-->
	  <svg #svg preserveAspectRatio="xMidYMid" viewBox="0 0 938 570">
	    <!--rect style="background-color: white" width="938" height="570"></rect-->
	    <g id="map1" transform="translate(0,0)scale(1,1)">
	      <g id="map1-layers">
            <template ngFor let-layer [ngForOf]="layers">
              <g *ngIf="shouldBeGraticuleLayer(layer.layerConfiguration)"
                    graticule [layer]="layer.layerConfiguration"
                    [configuration]="layer" [path]="path"></g>
              <g *ngIf="shouldBeGeodataLayer(layer.layerConfiguration)"
                    geodata [layer]="layer.layerConfiguration"
                    [configuration]="layer" [path]="path"></g>
              <g *ngIf="shouldBeShapeLayer(layer.layerConfiguration)"
                    shape [layer]="layer.layerConfiguration"
                    [configuration]="layer" [path]="path"></g>
            </template>
	      </g>
	    </g>
	  </svg>
	`,
	directives: [GraticuleLayerComponent, GeodataLayerComponent, ShapeCircleLayerComponent],
	providers: [MapService, MapUpdateService, ExpressionsService]
})
export class MapComponent {
  @Input('id') id: string;
  @Input()
  layers: any[];
  @Input()
  resize:boolean = true;
  @Input()
  projection:string;
  @Input()
  dynamic:boolean = true;

  path: any;

  @ViewChild('svg')
  svgElement: ElementRef;

  @ContentChildren(AbstractLayerConfiguration)
  configurations;

  @ViewChild('target', {read: ViewContainerRef}) graticuleTarget;

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    if (this.resize) {
      this.renderer.setElementAttribute(this.svgElement.nativeElement,
        'width', event.target.innerWidth);
      this.renderer.setElementAttribute(this.svgElement.nativeElement,
        'height', event.target.innerHeight);
    }
  }

  constructor(private mapService: MapService, private renderer: Renderer,
  	private changeDetector: ChangeDetectorRef, private elementRef: ElementRef,
  	private updateService: MapUpdateService) {

  }

  loadLayersData() {
    let dataLoaders = {};
    this.layers.forEach((layer) => {
      let configuration = layer.layerConfiguration;
      if (configuration.data) {
        dataLoaders[configuration.data.url] = configuration.data;
      }
    });

    Object.keys(dataLoaders).forEach(key => {
      let loader = dataLoaders[key];
      if (loader.type === 'topojson') {
        d3.json(loader.url, (data) => {
          console.log('get data');
          this.updateService.triggerLayerDataLoaded(loader.url, data);
        });
      } else if (loader.type === 'csv') {
        d3.csv(loader.url, (data) => {
          data = data.filter(d => d.mass > 50000);
          this.updateService.triggerLayerDataLoaded(loader.url, data);
        });
      }
    });
  }

  ngAfterContentInit() {
    console.log('>> ngAfterContentInit');
    // Initialize layers from input configurations
    if (this.configurations) {
      this.layers = [];
      this.configurations.forEach((configuration) => {
        this.layers.push(configuration);
      });
    }

    // Load data of layers if any
    if (this.layers) {
      this.loadLayersData();
    }
  }

  ngAfterViewInit() {
    console.log('>> ngAfterViewInit');
    this.renderer.setElementAttribute(this.svgElement.nativeElement,
      'width', window.innerWidth.toString());
    this.renderer.setElementAttribute(this.svgElement.nativeElement,
      'height', window.innerHeight.toString());

    var mapConfig = { projection: { type: this.projection } };
    //var mapConfig = { projection: { type: 'satellite' } };

	  var projection = this.mapService.createProjection(mapConfig);
	  this.path = d3.geo.path().projection(projection);



    this.mapService.current = {
      scale: projection.scale(),
      center: projection.center()
    };

    if (this.dynamic) {
	    this.mapService.configureMapBehaviors(
		    this, this.svgElement.nativeElement, projection,
		    mapConfig);
    }

	  this.changeDetector.detectChanges();
  }

  shouldBeGraticuleLayer(layer) {
    return layer.type === 'graticule';
  }

  shouldBeGeodataLayer(layer) {
    return layer.type === 'geodata';
  }

  shouldBeShapeLayer(layer) {
	  return layer.type === 'shape';
  }
}