import { LOGLEVEL } from './../global/global';
import { Injectable } from '@angular/core';
import { Pro } from '@ionic/pro';
import log from 'loglevel';

const CLASSNAME = '[AppManagerProvider]';
const logger = log.getLogger(CLASSNAME);

@Injectable()
export class AppManagerProvider {
  public deployChannel = "";
  public isBeta = false;
  public downloadProgress = 0;

  constructor() {
    logger.setLevel(LOGLEVEL);
    this.checkChannel();
  }


  async checkChannel() {
    const METHOD = 'checkChannel';
    try {
      const res = await Pro.deploy.getConfiguration();
      this.deployChannel = res.channel;
      this.isBeta = (this.deployChannel === 'Beta')
    } catch (err) {
      // We encountered an error.
      // Here's how we would log it to Ionic Pro Monitoring while also catching:
      logger.error(CLASSNAME, METHOD, err, JSON.stringify(err, null, 2));
      Pro.monitoring.exception(err);
    }
  }

  async toggleBeta() {
    const config = {
      channel: (this.isBeta ? 'Beta' : 'Production')
    }

    try {
      await Pro.deploy.configure(config);
      await this.checkChannel();
      await this.performManualUpdate(); // Alternatively, to customize how this works, use performManualUpdate()
    } catch (err) {
      // We encountered an error.
      // Here's how we would log it to Ionic Pro Monitoring while also catching:

      Pro.monitoring.exception(err);
    }

  }

  async performManualUpdate() {

    /*
      Here we are going through each manual step of the update process:
      Check, Download, Extract, and Redirect.
      This code is currently exactly the same as performAutomaticUpdate,
      but you could split it out to customize the flow.

      Ex: Check, Download, Extract when a user logs into your app,
        but Redirect when they logout for an app that is always running
        but used with multiple users (like at a doctors office).
    */

    try {
      const update = await Pro.deploy.checkForUpdate();

      if (update.available) {
        this.downloadProgress = 0;

        await Pro.deploy.downloadUpdate((progress) => {
          this.downloadProgress = progress;
        })
        await Pro.deploy.extractUpdate();
        await Pro.deploy.reloadApp();
      }
    } catch (err) {
      // We encountered an error.
      // Here's how we would log it to Ionic Pro Monitoring while also catching:

      Pro.monitoring.exception(err);
    }

  }

}
