import {
	KeyValueDiffers, KeyValueDiffer,
	DoCheck, ComponentRef
} from '@angular/core';

import {
	LayerDiffConfigurationType
} from './layer';

export function configureInheritanceProvider(type) {
	return { provide: AbstractLayerConfiguration, useExisting: type };
}

export class AbstractLayerConfiguration implements DoCheck {
	private diffs: any[] = [];

	public linkedComponentRef: ComponentRef<any>;

	constructor(public linkedComponent: any, private differs:  KeyValueDiffers) {
	}

	createDifferForObject(): KeyValueDiffer {
		return this.differs.find({}).create(null);
	}

	configureChangeDetectionForObject(diff, prop, handler): void {
		var changes = diff.diff(prop);
    	if (changes) {
      		changes.forEachChangedItem(handler);
      	}
	}

	initializeChangeDetectionForInputs(configs: { name: string, type?: LayerDiffConfigurationType }[]) {
		configs.forEach(config => {
			this.diffs.push({
				diff: this.createDifferForObject(),
				name: config.name,
				type: config.type
			});
		});
	}

	ngDoCheck() {
		this.diffs.forEach(diff => {
			this.configureChangeDetectionForObject(diff.diff, this[diff.name], (elt) => {
				if (this.linkedComponentRef &&
						this.linkedComponentRef.instance.onLayerConfigurationChanges) {
					this.linkedComponentRef.instance.onLayerConfigurationChanges(elt);
				}
			});
		});
	}
}

export class AbstractLayerComponent {
	public linkedConfiguration: AbstractLayerConfiguration;

	emitToLinkedConfiguration(eventName: string, obj?: any) {
		if (this.linkedConfiguration[eventName]) {
			this.linkedConfiguration[eventName].emit(obj);
		}
	}
}
