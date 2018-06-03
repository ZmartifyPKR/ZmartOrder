import { Api } from './../api/api';
import { Injectable } from '@angular/core';
import log from 'loglevel';
import { OrderModel } from '../../models/order-model';
import { ProductModel } from '../../models/product-model';
import { LOGLEVEL } from '../global/global';

/**
 * @author Peter Kristensen
 *
 */

const CLASSNAME = '[OrdersProvider]';
const logger = log.getLogger(CLASSNAME);

@Injectable()
export class OrdersProvider {
  constructor(public api: Api) {
    logger.setLevel(LOGLEVEL);
  }

  getOrders(filter?: any): Promise<any> {
    logger.info(CLASSNAME,JSON.stringify(filter,null,2));
    return new Promise((resolve, reject) => {
      this.api.get('orders/salesorder/list/api/', filter).subscribe((orders: any) => {
        logger.debug(CLASSNAME, JSON.stringify(orders, null, 2));
        let _orders: OrderModel[] = [];
        orders.results.forEach(order => { _orders.push(new OrderModel(order)) })
        resolve(_orders);
      },
        (err) => reject(err))
    })
  }

  deleteOrder(id: string): Promise<any> {
    return new Promise((resolve, reject) =>
      this.api.delete('api/orders/salesorder/' + id + '/').subscribe((result) => {
        resolve("OK")
      },
        (err) => reject(err))
    )
  }

  createOrder(product: ProductModel, quantity: number, description?: string): Promise<any> {
    const METHOD = '{createOrder}';
    let body = {
      name: product.name,
      customerProduct: product.id,
      quantity: quantity,
      description: description
    }
    logger.debug(CLASSNAME,JSON.stringify(body,null,2));
    return new Promise((resolve, reject) => {
      this.api.post('orders/salesorder/create/api/', body).subscribe((result) => {
        logger.debug(CLASSNAME,METHOD,JSON.stringify(result,null,2));
        
        resolve(result)
      },
        (err) => reject(err))
    })
  }

  getStockTransactions(filter?: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this.api.get('orders/stocktransaction/list/api/', filter).subscribe((orders: any) => {
        let _orders: OrderModel[] = [];
        orders.results.forEach(order => { _orders.push(new OrderModel(order)) })
        resolve(_orders);
      },
        (err) => reject(err))
    })
  }

  deleteStockTransaction(id: string): Promise<any> {
    return new Promise((resolve, reject) =>
      this.api.delete('api/orders/stocktransaction/' + id + '/').subscribe((result) => {
        resolve("OK")
      },
        (err) => reject(err))
    )
  }

  createStockTransaction(product: ProductModel, quantity: number): Promise<any> {
    let body = {
      name: product.name,
      customerProduct: product.id,
      quantity: quantity
    }
    return new Promise((resolve, reject) => {
      this.api.post('orders/stocktransaction/create/api/', body).subscribe((result) => {
        resolve(result)
      },
        (err) => reject(err))
    })
  }

  updateStockQuantity(product: ProductModel, quantity: number): Promise<any> {
    const METHOD = '{updateStockQuantity}';
    logger.debug(CLASSNAME,METHOD,JSON.stringify(product, null, 2));
    
    let body = {
      count: quantity
    }
    return new Promise((resolve, reject) => {
      this.api.post('customers/customerproduct/' + product.id + '/count/api/', body).subscribe((result) => {
        resolve(result)
      },
        (err) => reject(err))
    })
  }

}
