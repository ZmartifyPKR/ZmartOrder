import { NgModule } from '@angular/core';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { IonicPageModule } from 'ionic-angular';

import { SettingsPage } from './settings';
import { createTranslateLoader } from '../../app/app.module';
import { HttpClient } from '@angular/common/http';

@NgModule({
  declarations: [
    SettingsPage,
  ],
  imports: [
    IonicPageModule.forChild(SettingsPage),
    TranslateModule.forChild({
      loader: {
          provide: TranslateLoader,
          useFactory: createTranslateLoader,
          deps: [HttpClient]
      }
  })
  ],
  exports: [
    SettingsPage
  ]
})
export class SettingsPageModule { }
