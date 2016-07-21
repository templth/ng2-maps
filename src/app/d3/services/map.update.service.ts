import {Subject} from 'rxjs/Rx';
import {Layer} from '../model/map.model';

export interface MapUpdate {
  layerId: string;
  layer: Layer;
  diffs: { string: any }[];
}

export class MapUpdateService {
  private layerDataConfigurationUpdated$: Subject<any> = new Subject();
  private layerDataLoaded$: Subject<any> = new Subject();

  registerOnLayerConfigurationUpdated(layer: Layer) {
    return this.layerDataConfigurationUpdated$
      .filter(update => update.layerId === layer.id);
  }
  
  triggerLayerConfigurationUpdates(layer: Layer, diffs) {
    this.layerDataConfigurationUpdated$
      .next({ layerId: layer.id, layer, diffs });
  }

  registerOnLayerDataLoaded(url: string) {
	  return this.layerDataLoaded$
	    .filter(update => update.url === url);
  }

  triggerLayerDataLoaded(url: string, data: any) {
    this.layerDataLoaded$
      .next({ url, data });
  }
}