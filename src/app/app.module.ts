import { ComponentsModule } from './../components/components.module';
import { HttpClient, HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { ErrorHandler, Injectable, Injector, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { Camera } from '@ionic-native/camera';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';
import { BarcodeScanner } from '@ionic-native/barcode-scanner';
import { FileTransfer, FileTransferObject } from '@ionic-native/file-transfer';
import { CameraMock } from '@ionic-native-mocks/camera';
import { SplashScreenMock } from '@ionic-native-mocks/splash-screen';
import { StatusBarMock } from '@ionic-native-mocks/status-bar';
import { BarcodeScannerMock } from '@ionic-native-mocks/barcode-scanner';
import { FileTransferMock, FileTransferObjectMock} from '@ionic-native-mocks/file-transfer';

import { IonicStorageModule } from '@ionic/storage';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { Pro } from '@ionic/pro';

import { User } from '../providers/providers';
import { Api } from '../providers/providers';
import { MyApp } from './app.component';
import { APIInterceptor } from '../providers/api/api.interceptor';
import { ProductsProvider } from '../providers/products/products';
import { OrdersProvider } from '../providers/orders/orders';
import { GlobalProvider, IS_BROWSER } from '../providers/global/global';
import { appVersion } from './app.version';
import { FlashProvider } from '../providers/flash/flash';
import { AppManagerProvider } from '../providers/app-manager/app-manager';

//  const isBrowser = document.URL.includes('https://') || document.URL.includes('http://'); // document.URL.startsWith(‘http’);
const isBrowser = IS_BROWSER;

// The translate loader needs to know where to load i18n files
// in Ionic's static asset pipeline.
export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

const IonicPro = Pro.init('6377d259',{
  appVersion: appVersion
})

@Injectable()
export class MyErrorHandler implements ErrorHandler {
  ionicErrorHandler: IonicErrorHandler;

  constructor(injector: Injector) {
    try {
      this.ionicErrorHandler = injector.get(IonicErrorHandler);
    } catch(e) {
      // Unable to get the IonicErrorHandler provider, ensure 
      // IonicErrorHandler has been added to the providers list below
    }
  }

  handleError(err: any): void {
    IonicPro.monitoring.handleNewError(err);
    // Remove this if you want to disable Ionic's auto exception handling
    // in development mode.
    this.ionicErrorHandler && this.ionicErrorHandler.handleError(err);
  }
}

@NgModule({
  declarations: [
    MyApp
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    ComponentsModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: (createTranslateLoader),
        deps: [HttpClient]
      }
    }),
    IonicModule.forRoot(MyApp, {
      tabsPlacement: 'bottom',
      tabsHideOnSubPages: false,
    }),
    IonicStorageModule.forRoot()
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp
  ],
  providers: [
    Api,
    APIInterceptor,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: APIInterceptor,
      multi: true
    },
    User,
    // Use mocks during development when running in browser, otherwise use native
    (isBrowser ? { provide: Camera, useClass: CameraMock } : Camera),
    (isBrowser ? { provide: BarcodeScanner, useClass: BarcodeScannerMock } : BarcodeScanner),
    (isBrowser ? { provide: SplashScreen, useClass: SplashScreenMock } : SplashScreen),
    (isBrowser ? { provide: StatusBar, useClass: StatusBarMock } : StatusBar),
    (isBrowser ? { provide: FileTransfer, useClass: FileTransferMock } : FileTransfer),
    (isBrowser ? { provide: FileTransferObject, useClass: FileTransferObjectMock } : FileTransferObject),
    // File,

    // Keep this to enable Ionic's runtime error handling during development
    IonicErrorHandler,
    [{ provide: ErrorHandler, useClass: MyErrorHandler }],
    ProductsProvider,
    ProductsProvider,
    OrdersProvider,
    FlashProvider,
    GlobalProvider,
    AppManagerProvider
  ]
})
export class AppModule { }
