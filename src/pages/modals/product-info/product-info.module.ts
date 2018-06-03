import { ComponentsModule } from './../../../components/components.module';
import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ModalProductInfoPage } from './product-info';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [
    ModalProductInfoPage,
  ],
  imports: [
    IonicPageModule.forChild(ModalProductInfoPage),
    TranslateModule.forChild(),
    ComponentsModule
  ],
})
export class ProductInfoPageModule {}
