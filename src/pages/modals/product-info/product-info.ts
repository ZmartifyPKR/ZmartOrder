import { ModalController } from 'ionic-angular/components/modal/modal-controller';
import { GlobalProvider, NO_IMAGE } from './../../../providers/global/global';
import { ProductsProvider } from './../../../providers/products/products';
import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, Platform, normalizeURL } from 'ionic-angular';
import { ViewController } from 'ionic-angular/navigation/view-controller';
import { ProductModel } from '../../../models/product-model';

import log from 'loglevel';

/**
 * @author Peter Kristensen
 */

const CLASSNAME = '[ProductInfoPage]';
const logger = log.getLogger(CLASSNAME);

@IonicPage()
@Component({
  selector: 'page-product-info-modal',
  templateUrl: 'product-info.html',
})
export class ModalProductInfoPage {
  product: ProductModel;
  details: any = {};
  imageUrl: string;

  constructor(
    public platform: Platform,
    public navCtrl: NavController,
    public modalCtrl: ModalController,
    public navParams: NavParams,
    public viewCtrl: ViewController,
    public global: GlobalProvider,
    public productProvider: ProductsProvider) {

    logger.setLevel('debug');

    this.product = this.navParams.get('product');
    this.imageUrl = normalizeURL(this.product.image ? global.apiUrl + this.product.image : NO_IMAGE);

    this.productProvider.getProductDetails(this.product.idProduct).then((result) => {
      this.details = result;
    },
      (err) => logger.error(err));
  }

  dismiss() {
    this.viewCtrl.dismiss();
  }

  openUrl(url: string) {
    window.open(url, '_system', 'location=yes');
  }

  orderProduct(product) {
    let modal = this.modalCtrl.create('PlaceOrderPage', { product: product });
    modal.present();
  }

}
