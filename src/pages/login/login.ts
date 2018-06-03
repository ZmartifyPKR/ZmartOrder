import { GlobalProvider } from './../../providers/global/global';
import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { IonicPage, NavController, ToastController } from 'ionic-angular';

import { User } from '../../providers/providers';
import { MainPage } from '../pages';
import { appVersion } from '../../app/app.version';
import { AppManagerProvider } from '../../providers/app-manager/app-manager';

@IonicPage()
@Component({
  selector: 'page-login',
  templateUrl: 'login.html'
})
export class LoginPage {
  // The account fields for the login form.
  // If you're using the username field with or without email, make
  // sure to add it to the type
  account: { username: string, password: string } = {
    // username: '',
    //password: ''
    username: '',
    // username: '45825014',
    password: ''
  };
  domain: string;

  appversion = appVersion;

  // Our translated text strings
  private loginErrorString: string;

  constructor(public navCtrl: NavController,
    public user: User,
    public appManager: AppManagerProvider,
    public global: GlobalProvider,
     public toastCtrl: ToastController,
    public translateService: TranslateService) {

    this.translateService.get('LOGIN_ERROR').subscribe((value) => {
      this.loginErrorString = value;
    })

    this.domain = this.global.getDomain();
    


    if (user.isAuthenticated()) {
      this.user.tokenRefresh();
      this.navCtrl.setRoot(MainPage);
    }
  }

  // Attempt to login in through our User service
  doLogin() {
    this.global.setDomain(this.domain);

    this.user.login(this.account).then((resp) => {
      this.navCtrl.setRoot(MainPage);
    }, (err) => {
      // this.navCtrl.push(MainPage);
      // Unable to log in
      let toast = this.toastCtrl.create({
        message: this.loginErrorString,
        duration: 3000,
        position: 'top'
      });
      toast.present();
    });
  }

  doRefresh(refresher) {
    this.appManager.performAutomaticUpdate();
    refresher.complete();
  }
}
