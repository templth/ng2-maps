//our root app component
import {
  Injectable, Compiler, NgModule, ComponentFactory
} from '@angular/core';

class CacheElement {
	componentType: any;
	componentFactory: ComponentFactory<any>;
}

@Injectable()
export class DynamicComponentManager {
	private cache: CacheElement[] = [];

	constructor(private compiler: Compiler) {

	}

	getComponentFactoryFromCache(componentType: any): ComponentFactory<any> {
		let element = this.cache.find((element: CacheElement) => (element.componentType === componentType));
		if (element) {
			return element.componentFactory;
		}
		return null;
	}

	addComponentFactoryInCache(componentType: any, componentFactory: ComponentFactory<any>) {
		this.cache.push({
			componentType, componentFactory
		});
	}

	createComponentFactory(linkedComponent:any): ComponentFactory<any> {
		let componentFactory = this.getComponentFactoryFromCache(linkedComponent);
		if (componentFactory) {
			return componentFactory;
		}

	    @NgModule({declarations: [linkedComponent]})
	    class TemplateModule {}

	    console.log('Adding component...');
	    // Old fashion
	    /*this.resolver.resolveComponent(Test1Comp).then((factory:ComponentFactory<any>) => {
	      this.cmpRef = this.viewContainerRef.createComponent(factory);
	      console.log('Added component.');
	    });*/
	    // New fashion with ngmodule
	    const mod = this.compiler.compileModuleAndAllComponentsSync(TemplateModule);
	    componentFactory = mod.componentFactories.find((comp) =>
	      comp.componentType === linkedComponent
	    );

	    this.addComponentFactoryInCache(linkedComponent, componentFactory);
	    return componentFactory;
	}

}