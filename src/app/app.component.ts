import {Component} from '@angular/core';
import {SVG_MAP_DIRECTIVES} from './d3';


export class ParentClass {
    constructor() { 
      //super();
    }

    open(message:string){
        return "Hello World!";
    }
}

export class ChildClass extends ParentClass {
    constructor() { super(); }

    open(message: string){
        return message;
    }
}

  @Component({
    selector: 'app-root',
    template: `

        <!--button md-button>title1</button-->

    <!--md-content class="md-padding" layout="row" layout-wrap layout-align="center start">
      <div flex="50" layout="column" flex-xs="100">
        <md-card>
          <img src="public/images/grass.jpg" class="md-card-image" alt="Grass">
          <md-card-title>
            <md-card-title-text>
              <span class="md-headline">Action buttons</span>
            </md-card-title-text>
          </md-card-title>
          <md-card-content>
            <map></map>
          </md-card-content>
        </md-card>
      </div>
    </md-content-->

    <map projection="orthographic" [resize]="true" [dynamic]="true">
      <graticule [displayBackground]="displayGraticuleBackground"  [styles]="graticuleStyles" (layerLoaded)="onGraticuleLayerLoaded()"></graticule>
      <geodata></geodata>
      <shapeCircle></shapeCircle>
    </map>

    <div (click)="toggleDisplayGraticuleBackground()">Toggle ({{displayGraticuleBackground}})</div>
    <div (click)="updateStyles()">Update ({{graticuleStyles | json}})</div>

  `/*,
    directives: [MapComponent, GraticuleLayerConfigurationDirective/*, MATERIAL_DIRECTIVES]*/
    ,directives: [SVG_MAP_DIRECTIVES]
  })
  export class AppComponent {
    displayGraticuleBackground:boolean = false;
    graticuleStyles:any = {
      lines: {
        color: '#fff'
      }
    };

    onGraticuleLayerLoaded() {
  	  console.log('loaded');
  	}

    toggleDisplayGraticuleBackground() {
      this.displayGraticuleBackground = !this.displayGraticuleBackground;
    }

    updateStyles() {
      if (this.graticuleStyles.lines.color === '#ffffff') {
        this.graticuleStyles.lines.color = '#ff0000';
      } else {
        this.graticuleStyles.lines.color = '#ffffff';
      }
    }
  }