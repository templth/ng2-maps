import {
	KeyValueDiffer
} from '@angular/core';

export interface OnLayerConfigurationChanges {
	onLayerConfigurationChanges(diff: any);
}

export enum LayerDiffConfigurationType {
	OBJECT, ARRAY
}

export interface DataLayer {
	getDataConfiguration(): any;
	onDataLoaded(data: any);
}