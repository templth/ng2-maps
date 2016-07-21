import {Input} from '@angular/core';
import {Subject} from 'rxjs/Subject';

export abstract class AbstractLayer {
  initialized: boolean = false;
  layerLoaded: Subject<boolean> = new Subject<boolean>();

  abstract handleUpdates(updates);
}

export abstract class AbstractLayerConfiguration {
  layer: AbstractLayer;
  layerConfiguration: any;
}