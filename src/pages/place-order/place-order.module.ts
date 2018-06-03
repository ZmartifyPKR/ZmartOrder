import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { PlaceOrderPage } from './place-order';
import { TranslateModule } from '@ngx-translate/core';
import { ComponentsModule } from '../../components/components.module';

@NgModule({
  declarations: [
    PlaceOrderPage,
  ],
  imports: [
    IonicPageModule.forChild(PlaceOrderPage),
    TranslateModule.forChild(),
    ComponentsModule,
  ],
  exports: [PlaceOrderPage],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class PlaceOrderPageModule {}
