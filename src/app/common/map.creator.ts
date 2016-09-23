//our root app component
import {
  Component, ViewChild, ViewContainerRef, Directive,
  ElementRef, Input, ComponentResolver, ComponentFactoryResolver,
  Output, ContentChildren, EventEmitter,
  ChangeDetectorRef, ComponentFactory, ComponentRef,
  Compiler, NgModule, QueryList, SimpleChange,
  AfterContentInit, OnChanges
} from '@angular/core';
import { DynamicComponentManager } from './dynamic.component.manager';
import { AbstractLayerConfiguration } from './abstract.layer';

@Directive({
  selector: '[loader]'
})
export class LayerLoaderDirective {
  @Input()
  private layer: AbstractLayerConfiguration;

  private component: any;

  constructor(private manager: DynamicComponentManager,
    private viewContainerRef: ViewContainerRef) {
  }

  ngAfterViewInit() {
    let linkedComponent = this.layer.linkedComponent;
    const factory = this.manager.createComponentFactory(linkedComponent);
    this.component = this.viewContainerRef.createComponent(factory);
    this.component.instance.linkedConfiguration = this.layer;
    this.layer.linkedComponentRef = this.component;
  }

  ngOnDestroy() {
    this.viewContainerRef.remove();
    this.component.destroy();
    this.component = null;
  }
}

export function createMap(template) {
	@Component({
	  selector: 'map',
	  template: template
	})
	class Map {
	  @ContentChildren(AbstractLayerConfiguration)
	  public layersChildren: QueryList<AbstractLayerConfiguration>;

	  @Input('layers')
	  public layersInput: AbstractLayerConfiguration[];

	  layers: AbstractLayerConfiguration[];

	  ngAfterContentInit() {
	    if (this.layersChildren) {
	      this.layers = this.layersChildren.toArray();
	      this.layersChildren.changes.subscribe(() => {
	        this.layers = this.layersChildren.toArray();
	      })
	    }
	  }

	  ngOnChanges(changes: {[propertyName: string]: SimpleChange}) {
	    if (changes['layersInput']) {
	      this.layers = this.layersInput;
	    }
	  }
	}

	return Map;
}