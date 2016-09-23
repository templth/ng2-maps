import {
  createMap
} from '../common/map.creator';

export let SvgMap = createMap(`
    <div>
      <!--svg height="30" width="200" xmlns="http://www.w3.org/2000/svg">
        <template ngFor [ngForOf]="layers" let-layer>
          <template loader [layer]="layer">
          </template>
        </template>
      </svg-->
      <div height="30" width="200" style="border: solid 1px black">
        <template ngFor [ngForOf]="layers" let-layer>
          <template loader [layer]="layer">
          </template>
        </template>
      </div>
    </div>
  `
);