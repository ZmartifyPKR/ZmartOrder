import { BackgroundImage } from './background-image/background-image';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ColorRadio } from './color-radio/color-radio';
import { CounterInput } from './counter-input/counter-input';
import { PreloadImage } from './preload-image/preload-image';
import { ShowHideContainer } from './show-hide-password/show-hide-container';
import { ShowHideInput } from './show-hide-password/show-hide-input';
import { IonicModule } from 'ionic-angular/module';


const COMPONENTS = [
	BackgroundImage, 
	ColorRadio, 
	PreloadImage, 
	ShowHideContainer, 
	ShowHideInput,
	CounterInput,
];

@NgModule({
	declarations: COMPONENTS,
	imports: [IonicModule],
	exports: COMPONENTS,
	schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
})
export class ComponentsModule {

}
