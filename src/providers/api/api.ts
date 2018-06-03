import { GlobalProvider } from './../../providers/global/global';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import log from 'loglevel';
import { LOGLEVEL } from '../global/global';

/**
 * Api is a generic REST Api handler. Set your API url first.
 */

const CLASSNAME = '[API]';
const logger = log.getLogger(CLASSNAME);
 
@Injectable()
export class Api {

  imagePath: string = '/media/orderhandling/products/product';

  constructor(public http: HttpClient, public global: GlobalProvider) {

   logger.setLevel(LOGLEVEL);

   logger.debug(CLASSNAME,'apiUrl =', this.global.apiUrl);
  }

  get(endpoint: string, params?: any, reqOpts?: any) {
    if (!reqOpts) {
      reqOpts = {
        params: new HttpParams()
      };
    }

    // Support easy query params for GET requests
    if (params) {
      reqOpts.params = new HttpParams();
      for (let k in params) {
        reqOpts.params = reqOpts.params.set(k, params[k]);
      }
    }

    return this.http.get(this.global.apiUrl + '/' + endpoint, reqOpts);
  }

  post(endpoint: string, body: any, reqOpts?: any) {
    return this.http.post(this.global.apiUrl + '/' + endpoint, body, reqOpts);
  }

  postForm(endpoint: string, formData: any, reqOpts?: any) {
    return this.http.post(this.global.apiUrl + '/' + endpoint, formData, reqOpts);
  }


  put(endpoint: string, body: any, reqOpts?: any) {
    return this.http.put(this.global.apiUrl + '/' + endpoint, body, reqOpts);
  }

  delete(endpoint: string, reqOpts?: any) {
    return this.http.delete(this.global.apiUrl + '/' + endpoint, reqOpts);
  }

  patch(endpoint: string, body: any, reqOpts?: any) {
    return this.http.put(this.global.apiUrl + '/' + endpoint, body, reqOpts);
  }

  imageUrl(image) {
    return this.global.apiUrl + this.imagePath + '/' + image;
  }
}
