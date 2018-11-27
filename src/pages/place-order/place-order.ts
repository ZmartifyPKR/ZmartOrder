import { GlobalProvider, NO_IMAGE } from './../../providers/global/global';
import { ProductsProvider } from './../../providers/products/products';

import { TranslateService } from '@ngx-translate/core';
import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController, LoadingController, normalizeURL, ViewController } from 'ionic-angular';
import { OrdersProvider } from '../../providers/orders/orders';
import { BarcodeScanner } from '@ionic-native/barcode-scanner';
import { Camera } from '@ionic-native/camera';

import { DomSanitizer } from '@angular/platform-browser';

import { FormGroup, FormBuilder, FormControl } from '@angular/forms';

import { debounceTime } from 'rxjs/operators/debounceTime';
import log from 'loglevel';
import { ProductModel } from '../../models/product-model';
import { counterRangeValidator } from '../../components/counter-input/counter-input';
import { User } from '../../providers/providers';
import { ToastController } from 'ionic-angular/components/toast/toast-controller';
import { FileTransferObject, FileTransfer } from '@ionic-native/file-transfer';
import { File } from '@ionic-native/file';



/**
 * @author Peter Kristensen
 *
 */

const CLASSNAME = '[PlaceOrderPage]';
const logger = log.getLogger(CLASSNAME);
const LOGLEVEL = 'debug';

@IonicPage()
@Component({
  selector: 'page-place-order',
  templateUrl: 'place-order.html',
})

export class PlaceOrderPage {
  loadedAsModal: boolean = false;
  pagePlaceOrderForm: FormGroup;
  searchTerm: string = '';
  searching: any = false;
  selectedProduct: ProductModel;
  products: ProductModel[]
  description: string;

  qtyStep: number = 1;

  pictureProduct: boolean = false;
  supportsPictureProduct: boolean = false;
  correctPath: string;
  currentName: string;
  // Initially set it to no image
  imagePath: string = NO_IMAGE;

  continueBarCode = false;
  stockLevel: any;

  progress: number;

  // Strings used for translation
  orderNotCreated: string;
  orderCreated: string;

  stockTransactionNotCreated: string;
  stockTransactionCreated: string;

  stockLevelAdjusted: string;
  stockLevelNotAdjusted: string;

  comment: string;
  addComment: string;

  ok: string;
  cancel: string;

  uploadSuccess: string;
  uploadError: string;
  uploading: string;

  loading: any;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public alertCtrl: AlertController,
    public toastCtrl: ToastController,
    private loadingCtrl: LoadingController,
    private viewCtrl: ViewController,
    private barcodeScanner: BarcodeScanner,
    private camera: Camera,
    private file: File,
    public ordersProvider: OrdersProvider,
    public productsProvider: ProductsProvider,
    public translateService: TranslateService,
    public domSanitizer: DomSanitizer,
    public global: GlobalProvider,
    private transfer: FileTransfer,
    fb: FormBuilder,
    public user: User) {

    logger.setLevel(LOGLEVEL);



    this.stockLevel = this.navParams.get('stockLevel');

    this.translateService.get(['ORDER_CREATED', 'ORDER_NOT_CREATED', 'STOCKTRANS_CREATED', 'STOCKTRANS_NOT_CREATED',
      'STOCKLEVEL_ADJUSTED', 'STOCKLEVEL_NOT_ADJUSTED',
      'COMMENT', 'ADD_COMMENTS', 'OK', 'CANCEL',
      'UPLOAD_SUCCESS', 'UPLOAD_ERROR', 'UPLOADING']).subscribe(values => {
        this.orderCreated = values['ORDER_CREATED'];
        this.orderNotCreated = values['ORDER_NOT_CREATD'];
        this.stockTransactionCreated = values['STOCKTRANS_CREATED'];
        this.stockTransactionNotCreated = values['STOCKTRANS_NOT_CREATED'];
        this.stockLevelAdjusted = values['STOCKLEVEL_ADJUSTED'];
        this.stockLevelNotAdjusted = values['STOCKLEVEL_NOT_ADJUSTED'];
        this.comment = values['COMMENT'];
        this.addComment = values['ADD_COMMENTS'];
        this.cancel = values['CANCEL'];
        this.ok = values['OK'];
        this.uploadSuccess = values['UPLOAD_SUCCESS'];
        this.uploadError = values['UPLOAD_ERROR'];
        this.uploading = values['UPLOADING'];
      });

    this.pagePlaceOrderForm = fb.group({
      searchControl: [],
      productId: [],
      productName: [],
      quantity: new FormControl(1, counterRangeValidator(10, 0)),
    });

    this.supportsPictureProduct = this.user.hasPictureProductId();

    // Did we enter in modal mode with a known product?
    let product = this.navParams.get('product');

    if (product) {
      logger.debug(CLASSNAME, 'product', JSON.stringify(product, null, 2));
      this.loadedAsModal = true;
      this.selectProduct(product);
    } else {
      this.loadedAsModal = false;
    }
  }

  ionViewDidLoad() {
    if (!this.user.isAuthenticated()) this.navCtrl.setRoot('LoginPage');

    this.setFilteredProducts();

    this.pagePlaceOrderForm.controls['searchControl'].valueChanges.pipe(debounceTime(700)).subscribe(search => {
      this.searching = false;
      this.setFilteredProducts();
    })
  }

  ionViewWillEnter() {
    if (!this.user.isAuthenticated()) this.navCtrl.setRoot('LoginPage');
  }

  ionViewCanEnter() {
    if (!this.user.isAuthenticated()) this.navCtrl.setRoot('LoginPage');
  }

  addComments() {
    const METHOD = "addComments()";

    this.user.tokenRefresh();
    let confirm = this.alertCtrl.create({
      title: this.addComment,
      message: this.selectedProduct.productName,
      inputs: [
        {
          name: 'description',
          placeholder: this.comment
        }
      ],
      buttons: [
        {
          text: this.cancel,
          handler: () => {
            logger.debug(CLASSNAME, METHOD, 'CANCEL pressed');
          }
        },
        {
          text: this.ok,
          handler: (data) => {
            this.description = data.description;
          }
        }
      ]
    });
    confirm.present();
  }

  confirmOrder() {
    const METHOD = "confirmOrder()";
    logger.debug(CLASSNAME, METHOD, JSON.stringify(this.selectedProduct, null, 2));

    if (this.user.directOrder) {
      // Normal direct order
      if (this.pictureProduct) {
        this.orderByPicture();
      } else {
        this.ordersProvider.createOrder(this.selectedProduct, this.quantity, this.description).then((result) => {
          this.quantity = 1;
          this.selectedProduct = undefined;
          this.presentToast(this.orderCreated);
        },
          (err) => {
            logger.error(CLASSNAME, METHOD, JSON.stringify(err, null, 2));
            this.presentToast(this.orderNotCreated);
          }
        )
      }
    } else if (!this.stockLevel) {
      // Stock transaction
      this.ordersProvider.createStockTransaction(this.selectedProduct, - this.quantity).then((result) => {
        this.quantity = 1;
        this.selectedProduct = undefined;
        this.presentToast(this.stockTransactionCreated);
      },
        (err) => {
          logger.error(CLASSNAME, METHOD, JSON.stringify(err, null, 2));
          this.presentToast(this.stockTransactionNotCreated)
        }
      )
    } else {
      // Stock level
      // logger.debug(CLASSNAME,METHOD,JSON.stringify(this.selectedProduct,null,2));

      this.ordersProvider.updateStockQuantity(this.selectedProduct, this.quantity).then((result) => {
        this.quantity = 1;
        this.selectedProduct = undefined;
        if (!this.continueBarCode) this.presentToast(this.stockLevelAdjusted);
      },
        (err) => {
          logger.error(CLASSNAME, METHOD, JSON.stringify(err, null, 2));
          this.presentToast(this.stockLevelNotAdjusted);
          this.continueBarCode = false;
        }
      )
    }

    // If loaded as modal, dismiss after entering the order - then return to whereever we came from
    if (this.loadedAsModal) this.dismiss();

    // Continue with scanning i.e. simulate a click
    if (this.continueBarCode) {
      this.scanBarcode();
    }
  }

  onSearchInput() {
    this.searching = true;
  }

  setFilteredProducts() {
    const METHOD = '{setFilteredProducts}';

    if (this.searchTerm == '') {
      this.products = [];
    } else {
      this.productsProvider.loadProducts({ name: this.searchTerm }).then((products) => {
        this.products = products;
      },
        (err) => {
          logger.error(CLASSNAME, METHOD, JSON.stringify(err, null, 2));
          this.presentToast('Error retrieving products');
        });
    }
  }

  get quantity() {
    return this.pagePlaceOrderForm.controls['quantity'].value;
  }

  set quantity(quantity: number) {
    this.pagePlaceOrderForm.controls['quantity'].setValue(quantity);
  }

  selectProduct(product: ProductModel) {
    this.selectedProduct = product;
    this.imagePath = this.imagePath ? this.global.apiUrl + product.image : NO_IMAGE;
    this.quantity = product.defaultQuantity;
    this.qtyStep = this.quantity;
    this.searchTerm = null;
    this.products = [];
    this.pictureProduct = false;
  }

  scanBarcode() {
    const METHOD = "scanBarCode()";

    let product_not_found = '';
    this.translateService.get(['PRODUCT_NOT_FOUND']).subscribe(values => {
      product_not_found = values['PRODUCT_NOT_FOUND'];
    });

    this.barcodeScanner.scan({ formats: this.user.scanFormats }).then((barcodeData) => {
      if (barcodeData.cancelled) {
        logger.debug(CLASSNAME, METHOD, "Cancelled");
        this.continueBarCode = false;
      } else {
        this.productsProvider.getProductByBarcode(barcodeData.text).then((product) => {
          this.selectProduct(product);
        },
          (err) => this.presentToast(product_not_found)
        );
        this.continueBarCode = true;
      }
    },
      (err) => {
        logger.error(CLASSNAME, err);
      })
  }

  takePicture() {
    const METHOD = "takePicture()";

    this.camera.getPicture({
      quality: 100,
      sourceType: this.camera.PictureSourceType.CAMERA,
      destinationType: this.camera.DestinationType.FILE_URI,
      encodingType: this.camera.EncodingType.JPEG,
      mediaType: this.camera.MediaType.PICTURE,
      targetWidth: 1024,
      targetHeight: 768
    }).then((imageData) => {
      logger.debug(CLASSNAME, METHOD, 'Picture taken: ', JSON.stringify(imageData, null, 2));

      // Use File to create the correct path for viewing
      let filename = imageData.substring(imageData.lastIndexOf('/') + 1);
      let path = imageData.substring(0, imageData.lastIndexOf('/') + 1);
      //then use the method reasDataURL  btw. var_picture is ur image variable
      this.file.readAsDataURL(path, filename).then(res => this.imagePath = res);

      this.selectedProduct = new ProductModel({
        customerProduct: this.user.getPictureProductId(),
        name: "Picture from mobile phone",
        productName: 'PRODUCT PICTURE',
        image: normalizeURL(imageData),
        quantity: 1,
        product: {}
      });
      this.quantity = 1;
      this.pictureProduct = true;

    }, (err) => {
      logger.error(CLASSNAME, err);
    });
  }

  public orderByPicture() {
    const METHOD = 'orderByPicture()';

    // File name only
    var filename = this.selectedProduct.image;

    let idToken = window.localStorage.getItem('id_token');

    var options = {
      fileKey: "image",
      fileName: filename.substr(filename.lastIndexOf('/') + 1),
      chunkedMode: false,
      mimeType: "image/jpeg",
      headers: { Authorization: idToken ? this.buildToken(idToken) : 'NO TOKEN' },
      params: {
        description: this.description,
        image: filename,
        customerProduct: this.selectedProduct.id,
        quantity: this.quantity,
        name: this.selectedProduct.name
      }
    };

    logger.debug(CLASSNAME, METHOD, JSON.stringify(options, null, 2));

    const fileTransfer: FileTransferObject = this.transfer.create();

    this.loading = this.loadingCtrl.create({
      content: this.uploading,
    });
    this.loading.present();

    this.progress = -1;

    fileTransfer.onProgress(progress => {
      this.progress = progress.lengthComputable ? progress.loaded / progress.total * 100 : -1;
      logger.debug(CLASSNAME, "Progress: ", this.progress);
    })

    // Use the FileTransfer to upload the image
    fileTransfer.upload(filename, this.global.apiUrl + '/orders/salesorder/create/api/', options).then(data => {
      this.loading.dismiss()
      this.clearProduct();
      this.presentToast(this.orderCreated);
    }, err => {
      logger.error(CLASSNAME, JSON.stringify(err, null, 2));
      this.loading.dismiss()
      this.presentToast(JSON.stringify(err,null,2));
      // this.presentToast(this.uploadError);
    });
  }

  get showTakePicture(): boolean {
    return (this.supportsPictureProduct && this.directOrder);
  }

  clearProduct() {
    this.quantity = 1;
    this.selectedProduct = undefined;
    this.pictureProduct = false;
    this.comment = '';
  }

  buildToken(s: string): string {
    return 'JWT ' + s.replace(/"/g, '');
  }

  presentToast(message) {
    let toast = this.toastCtrl.create({
      message: message,
      duration: 9000,
      position: 'top'
    })
    toast.present();
  }

  dismiss() {
    this.viewCtrl.dismiss();
  }


  get directOrder(): boolean {
    return this.user.directOrder;
  }

  get menuTitle() {
    if (this.directOrder) {
      return 'MENU_SCAN'
    } else if (this.stockLevel) {
      return 'MENU_STOCKLEVEL'
    } else {
      return 'MENU_STOCK'
    }
  }

  get actionButtonText() {
    if (this.directOrder) {
      return 'PLACE_ORDER'
    } else if (this.stockLevel) {
      return 'STOCK_LEVEL'
    } else {
      return 'STOCK_TRANS'
    }
  }
}
