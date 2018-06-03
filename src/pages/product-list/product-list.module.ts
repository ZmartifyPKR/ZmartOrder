import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ProductListPage } from './product-list';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [
    ProductListPage,
  ],
  imports: [
    IonicPageModule.forChild(ProductListPage),
    TranslateModule.forChild(),
  ],
})
export class ProductListPageModule {}
