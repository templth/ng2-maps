import {
	Directive, Component, Input,
	Output, EventEmitter,
	KeyValueDiffers
} from '@angular/core';
import {
	AbstractLayerConfiguration,
	AbstractLayerComponent,
	configureInheritanceProvider
} from '../../common/abstract.layer';
import {
	OnLayerConfigurationChanges
} from '../../common/layer';

@Directive({
	selector: 'layer',
	providers: [
		configureInheritanceProvider(SimpleLayerConfiguration)
	]
})
export class SimpleLayerConfiguration extends AbstractLayerConfiguration {
	@Output()
	click: EventEmitter<string> = new EventEmitter();
	@Input()
	prop: any;

	constructor(differs:  KeyValueDiffers) {
		super(SimpleLayerComponent, differs);
	}

	ngOnInit() {
		this.initializeChangeDetectionForInputs([
			{ name: 'prop' }
		]);
	}
}

@Component({
  selector: ':svg:g[test1]',
  template: `
    <div>I love SVG!</div>
    <div (click)="onClick()">Test1</div>
  `
})
export class SimpleLayerComponent extends AbstractLayerComponent
		implements OnLayerConfigurationChanges {
	onClick() {
		this.emitToLinkedConfiguration('click');
	}

	onLayerConfigurationChanges(diff: any) {
		console.log('diff = ', diff);
	}
}
