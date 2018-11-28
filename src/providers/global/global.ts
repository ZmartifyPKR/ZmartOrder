import { appVersion } from './../../app/app.version';
import { Injectable } from '@angular/core';
import log from 'loglevel';

const CLASSNAME = '[GlobalProvider]';
const logger = log.getLogger(CLASSNAME);

export const IS_BROWSER = false;

export const APPNAME = 'ZmartOrder';
export const NO_IMAGE = 'assets/img/no-image-scan.jpg';
export const LOGLEVEL = 'debug';

export const DEFAULT_PREFERENCES = {
  language: 'da',
  scanFormats: 'EAN_8,EAN_13,CODE_128,CODE_39',
  quickScan: true
}

@Injectable()
export class GlobalProvider {

  _apiUrl: string;

  constructor() {
    logger.setLevel(LOGLEVEL);
    logger.debug(CLASSNAME, APPNAME, 'version', appVersion, 'loaded...');
  }

  get apiUrl() {
    const METHOD = '{get apiUrl}';

    if (!this._apiUrl) {
      if (IS_BROWSER) {
        this._apiUrl = '/api';
      } else {
        this._apiUrl = 'https://' + this.getDomain() + '.djangobooster.com';
      }
      logger.debug(CLASSNAME, METHOD, 'API url = ', this.apiUrl)
    }
    return this._apiUrl;
  }

  getDomain(): string {
    return this.getStorageVariable('domain');
  }

  setDomain(domain: string) {
    this.setStorageVariable('domain', domain);
    this._apiUrl = undefined; // It will be recreated next time it's used
  }

  private getStorageVariable(name) {
    return JSON.parse(window.localStorage.getItem(name));
  }

  private setStorageVariable(name, data) {
    window.localStorage.setItem(name, JSON.stringify(data));
  }
}
