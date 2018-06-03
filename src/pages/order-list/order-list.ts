import { TranslateService } from '@ngx-translate/core';
import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController } from 'ionic-angular';
import log from 'loglevel';
import { OrdersProvider } from '../../providers/orders/orders';
import { OrderlistType, OrderModel } from '../../models/order-model';
import { User } from '../../providers/providers';
import { FlashProvider } from '../../providers/flash/flash';
import { DomSanitizer } from '@angular/platform-browser';

/**
 * @author Peter Kristensen
 *
 */

const CLASSNAME = '[OrderListPage]';
const logger = log.getLogger(CLASSNAME);

@IonicPage()
@Component({
  selector: 'page-order-list',
  templateUrl: 'order-list.html',
})
export class OrderListPage {
  orderlistType: OrderlistType = OrderlistType.Today;
  orders: OrderModel[] = [];
  loading: any;
  searching: any;

  // Translated strings
  orderlistTypeText: string[];

  constructor(
    public ordersProvider: OrdersProvider,
    public navCtrl: NavController, public navParams: NavParams,
    loadingCtrl: LoadingController,
    private flash: FlashProvider,
    public DomSanitizer: DomSanitizer,
    public translateService: TranslateService,
    public user: User) {

      this.translateService.get([OrderlistType.Delayed,OrderlistType.Delivered,OrderlistType.NotDelivered,OrderlistType.Today,OrderlistType.PictureOrders]).subscribe(values => {
        this.orderlistTypeText = values;
      });

      logger.setLevel('debug');

    this.loading = loadingCtrl.create();
  }

  ionViewDidLoad() {
    if (!this.user.isAuthenticated()) this.navCtrl.setRoot('LoginPage');
    this.loadOrders();
  }

  deleteOrder(order) {
    const METHOD = '{deleteOrder}';
    this.ordersProvider.deleteOrder(order.id).then(result => {
      this.orders.forEach((_order, index) => {
        if (_order.id == order.id) this.orders.splice(index, 1);
      })
    },
    (err) => {
      logger.error(CLASSNAME,METHOD,JSON.stringify(err,null,2));
      this.flash.error('Error deleteOrder');
    }
    )
  }

  loadOrders() {
    const METHOD = '{loadOrders}'
    logger.debug(CLASSNAME,this.orderlistType);  
    this.searching = true;
    this.orders = [];
      this.ordersProvider.getOrders({ filter: this.orderlistType }).then((orders) => {
        this.orders = orders;
        this.searching = false;
      },
        (err) => {
          this.orders = [];
          logger.error(CLASSNAME, METHOD,JSON.stringify(err,null,2));
          this.flash.error('Error loadOrders');
          this.searching = false;
        }
      )
  }

  orderlistTypeMenu() {
    return this.orderlistTypeText[this.orderlistType];
  }

  get imageOrders() {
    return this.orderlistType == OrderlistType.PictureOrders;
  }
}
