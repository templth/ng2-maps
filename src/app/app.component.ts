import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'app works!';

  toggle:boolean;

  prop: any = {
    f1: 'test'
  };

  toggleLayer() {
    this.toggle = !this.toggle;
  }

  layerClicked() {
    console.log('layer clicked');
  }

  updateProp() {
    this.prop.f1 = this.prop.f1 +   'test1';
  }
}
