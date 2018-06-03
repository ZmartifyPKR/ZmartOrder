import { GlobalProvider, LOGLEVEL } from './../../providers/global/global';
import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { ProductsProvider } from '../../providers/products/products';
import { debounceTime } from 'rxjs/operators/debounceTime';
import log from 'loglevel';
import { ProductlistType, ProductModel } from '../../models/product-model';
import { ModalController } from 'ionic-angular/components/modal/modal-controller';
import { FormGroup, FormBuilder } from '@angular/forms';
import { User } from '../../providers/providers';
import { TranslateService } from '@ngx-translate/core';

/**
 * @author Peter Kristensen
 *
 */

const CLASSNAME = '[ProductListPage]';
const logger = log.getLogger(CLASSNAME);


@IonicPage()
@Component({
  selector: 'page-product-list',
  templateUrl: 'product-list.html',
})
export class ProductListPage {
  pageProductListForm: FormGroup;
  productlistType: ProductlistType;
  products: ProductModel[];
  searchTerm: string = '';
  searching: any = false;
  loading: any;

  // Translated strings
  productlistTypeText: string[];

  constructor(public navCtrl: NavController, public navParams: NavParams,
    public productsProvider: ProductsProvider,
    public modalCtrl: ModalController,
    public translateService: TranslateService,
    global: GlobalProvider,
    public user: User,
    public fb: FormBuilder) {
    logger.setLevel(LOGLEVEL);

    this.translateService.get([ProductlistType.AllProducts, ProductlistType.LowStock, ProductlistType.Stock]).subscribe(values => {
      this.productlistTypeText = values;
    });

    this.pageProductListForm = fb.group({
      searchControl: [],
    });
  }

  ionViewDidLoad() {
    if (!this.user.isAuthenticated()) this.navCtrl.setRoot('LoginPage');

    this.productlistType = ProductlistType.AllProducts;

    this.setFilteredProducts();

    this.pageProductListForm.controls['searchControl'].valueChanges.pipe(debounceTime(700)).subscribe(search => {
      this.searching = false;
      this.setFilteredProducts();
    })
  }

  onSearchInput() {
    this.searching = true;
  }

  setFilteredProducts() {
    this.searching = true;
    this.productsProvider.loadProducts({ name: this.searchTerm }).then((products) => {
      this.products = products;
      this.searching = false;
    }, (err) => {
      logger.error(CLASSNAME, err);
      this.searching = false;
    })
  }

  orderProduct(product) {
    this.navCtrl.setRoot('PlaceOrderPage', { product: product });
  }

  showProduct(product) {
    let modal = this.modalCtrl.create('ModalProductInfoPage', { product: product });
    modal.present();
  }

  loadProducts() {
    let filter = {};
    if (this.productlistType != ProductlistType.AllProducts) {
      filter = this.productlistType;
    }
    this.searching = true;
    this.products = [];
    this.productsProvider.loadProducts({ filter: filter }).then((products) => {
      this.products = products;
      this.searching = false;
    },
      (err) => {
        this.products = [];
        logger.error(CLASSNAME, err);
        this.searching = false;
      }
    )
  }

  productlistTypeMenu() {
    return this.productlistTypeText[this.productlistType];
  }

  get directOrder(): boolean {
    return this.user.directOrder;
  }

  get allProducts(): boolean {
    return this.productlistType == ProductlistType.AllProducts;
  }

  lowStock(product) {
    if (this.directOrder) {
      return '';
    } else {
      return (product.availableQty < product.minimumStock);
    }
  }

  justWarning(product) {
    if ((product.minimumStock > 1) && (product.availableQty == product.minimumStock))
      return true
    else
      return false
  }
}
