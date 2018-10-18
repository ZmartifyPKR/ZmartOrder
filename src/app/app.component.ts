import { Component, ViewChild } from '@angular/core';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { Config, Nav, Platform } from 'ionic-angular';
import { Observable } from 'rxjs/Rx';
import { FirstRunPage } from '../pages/pages';
import { User } from '../providers/providers';

@Component({
  template: `<ion-menu [content]="content">
    <ion-header>
      <ion-toolbar>
        <ion-title>{{'PAGES' | translate}}</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <ion-note padding>
        {{user.getName()}}
      </ion-note>
      <ion-list>
        <button menuClose ion-item *ngFor="let p of pages" (click)="openPage(p)">
          <div *ngIf="pageActive(p)">{{p.title}}</div>
        </button>
        <button menuClose ion-item (click)="logout()">
          {{'LOGOUT' | translate}}
        </button>
      </ion-list>
    </ion-content>

  </ion-menu>
  <ion-nav #content [root]="rootPage"></ion-nav>`
})
export class MyApp {
  @ViewChild(Nav) nav: Nav;

  rootPage = FirstRunPage;

  defaultLanguage = 'en';

  pages: any[] = [
    { titleCode: 'MENU_SCAN', title: '', component: 'PlaceOrderPage', menutype: ['direct', 'stock'] },
    { titleCode: 'MENU_ORDERS', title: '', component: 'OrderListPage', menutype: ['direct', 'stock'] },
    { titleCode: 'MENU_PRODUCTS', title: '', component: 'ProductListPage', menutype: ['direct', 'stock'] },
    { titleCode: 'MENU_STOCKLEVEL', title: '', component: 'PlaceOrderPage', menutype: ['stock'], params: { stockLevel: true } },
    { titleCode: 'MENU_SETTINGS', title: '', component: 'SettingsPage', menutype: ['direct', 'stock'] }
  ]

  constructor(
    private translate: TranslateService,
    platform: Platform,
    private config: Config,
    private statusBar: StatusBar,
    private splashScreen: SplashScreen,
    public user: User) {
    platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      this.statusBar.styleDefault();
      this.splashScreen.hide();
    });

    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      if (event.lang == 'ar') {
        platform.setDir('rtl', true);
        platform.setDir('ltr', false);
      }
      else {
        platform.setDir('ltr', true);
        platform.setDir('rtl', false);
      }

      Observable.forkJoin(
        this.pages.map((page, index) => this.translate.get(page.titleCode))
      ).subscribe((data): any => {
        data.forEach((newTitle, index) => {
          this.pages[index].title = newTitle
        });
      });

      this.translate.get(['BACK_BUTTON_TEXT']).subscribe(values => {
        this.config.set('ios', 'backButtonText', values.BACK_BUTTON_TEXT);
      });

    });

    this.initTranslate();
  }

  initTranslate() {
    // Set the default language for translation strings, and the current language.
    this.translate.setDefaultLang(this.defaultLanguage);
    const browserLang = this.translate.getBrowserLang();

    if (browserLang) {
      if (browserLang === 'zh') {
        const browserCultureLang = this.translate.getBrowserCultureLang();

        if (browserCultureLang.match(/-CN|CHS|Hans/i)) {
          this.translate.use('zh-cmn-Hans');
        } else if (browserCultureLang.match(/-TW|CHT|Hant/i)) {
          this.translate.use('zh-cmn-Hant');
        }
      } else {
        // this.translate.use(this.translate.getBrowserLang());
        this.translate.use(this.defaultLanguage); // Set your language here

      }
    } else {
      this.translate.use(this.defaultLanguage); // Set your language here
    }
  }

  logout() {
    this.user.logout();
    this.nav.setRoot('LoginPage');
  }

  pageActive(page) {
    if (this.user.directOrder) {
      return page.menutype.includes('direct');
    } else {
      return page.menutype.includes('stock');
    }
  }

  openPage(page) {
    // Reset the content nav to have just this page
    // we wouldn't want the back button to show in this scenario
    this.nav.setRoot(page.component, page.params ? page.params : {});
  }
}
