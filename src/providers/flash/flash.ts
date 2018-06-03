import { ToastController } from 'ionic-angular';
import { Injectable } from '@angular/core';
import log from 'loglevel';

const CLASSNAME = '[FlashProvider]';
const logger = log.getLogger(CLASSNAME);

@Injectable()
export class FlashProvider {

  constructor(private toastCtrl: ToastController) {
    logger.debug(CLASSNAME,'loaded.');
  }

  error(message) {
      this.show(message);
  }

  show(message,duration?) {
    let toast = this.toastCtrl.create({
      message: message,
      duration: 3000,
      position: 'top'
    })
    toast.present();
  }
}
