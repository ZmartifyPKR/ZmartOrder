import { Api } from './../api/api';
import { Injectable } from '@angular/core';
import log from 'loglevel';
import { ProductModel } from '../../models/product-model';
import { LOGLEVEL } from '../global/global';

/**
 * @author Peter Kristensen
 *
 */

const CLASSNAME = '[ProductsProvider]';
const logger = log.getLogger(CLASSNAME);

@Injectable()
export class ProductsProvider {

  constructor(public api: Api) {
    logger.setLevel(LOGLEVEL);
  }

  loadProducts(filter?: any): Promise<any> {
    const METHOD = "loadProducts";
    logger.debug(CLASSNAME,METHOD,JSON.stringify(filter,null,2));
    return new Promise((resolve, reject) => {
      this.api.get('customers/customerproduct/list/api/', filter).subscribe((products: any) => {
        logger.debug(CLASSNAME,METHOD,"Count = ", products.count,",next = ",products.next);
        let myProducts: ProductModel[] = [];
        products.results.forEach(product => {
          logger.debug(CLASSNAME,METHOD,JSON.stringify(product,null,2));
          product.customerProduct = product.id;
          myProducts.push(new ProductModel(product))
        });
        resolve(myProducts);
      },
        (err) => reject(err)
      )
    })
  }

  getProductDetails(id: string) {
    const METHOD = "getProductDetails";
    return new Promise((resolve, reject) => {
      this.api.get('products/product/'+id+'/api/').subscribe((result: any) => {
        logger.debug(CLASSNAME,METHOD,JSON.stringify(result,null,2));
          resolve(result)
      },
        (err) => reject(err)
      );
    });
  }

  getProductByBarcode(barcode: string): Promise<any> {
    const METHOD = '{getProductByBarcode}';

    return new Promise((resolve, reject) => {
      this.api.get('products/barcode/list/api/', { name: barcode }).subscribe((data: any) => {
        if (data.count == 0) {
          reject('NOT FOUND');
        } else {
          logger.debug(CLASSNAME, METHOD, JSON.stringify(data, null, 2));
          let product = new ProductModel(data.results[0]);
          // product.id = data.results[0].product.id;
          resolve(product);
        }
      },
        (err) => reject(err)
      )
    })
  }
}
