import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { COMMON_PROVIDERS, COMMON_DIRECTIVES } from './common/';
import { DynamicComponentManager } from './common/dynamic.component.manager';
import { SVG_MAP_DIRECTIVES } from './svg/';

@NgModule({
  declarations: [
    SVG_MAP_DIRECTIVES, COMMON_DIRECTIVES
  ],
  exports: [ SVG_MAP_DIRECTIVES ],
  imports: [
    BrowserModule
  ],
  providers: [
    COMMON_PROVIDERS
  ]
})
export class MapModule { }
