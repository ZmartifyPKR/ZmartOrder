import { appVersion } from './../../app/app.version';
import { APPNAME, GlobalProvider, LOGLEVEL } from './../../providers/global/global';
import { Component } from '@angular/core';

import { FormBuilder, FormGroup } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { User } from '../../providers/providers';
import log from 'loglevel';
import { AppManagerProvider } from '../../providers/app-manager/app-manager';

/**
 * @author Peter Kristensen
 *
 */

const CLASSNAME = '[SettingsPage]';
const logger = log.getLogger(CLASSNAME);

@IonicPage()
@Component({
  selector: 'page-settings',
  templateUrl: 'settings.html'
})
export class SettingsPage {
  // User settings
  profile: any;

  // Our local settings object

  options: any;

  settingsReady = false;

  form: FormGroup;

  page: string = 'main';
  pageTitleKey: string = 'SETTINGS.TITLE';
  pageTitle: string;

  subSettings: any = SettingsPage;


  constructor(public navCtrl: NavController,
    public user: User,
    public appManager: AppManagerProvider,
    public formBuilder: FormBuilder,
    public navParams: NavParams,
    public global: GlobalProvider,
    public translate: TranslateService) {

    logger.setLevel(LOGLEVEL);

    this.appManager.checkChannel();
  }

  emptyStringIfNull(s): string {
    return s ? s : '';
  }

  _buildForm() {
    let group: any = {
      name: [this.emptyStringIfNull(this.profile.name)],
      address1: [this.emptyStringIfNull(this.profile.address1)],
      address2: [this.emptyStringIfNull(this.profile.address2)],
      zipCode: [this.emptyStringIfNull(this.profile.zipCode)],
      cityName: [this.profile.cityName],
      country: [this.profile.counry],
      contactPerson: [this.profile.contactPerson],
      telephone: [this.profile.telephone],
      telephoneAlternate: [this.profile.telephoneAlternate],
      email: [this.profile.email]
    };

    this.form = this.formBuilder.group(group);

    // Watch the form for changes, and
    this.form.valueChanges.subscribe((v) => {
      logger.debug(CLASSNAME, 'New value: ', this.form.value);
    });
  }

  ionViewDidLoad() {
    if (!this.user.isAuthenticated()) this.navCtrl.setRoot('LoginPage');
    // Build an empty form for the template to render
    this.form = this.formBuilder.group({});
  }

  ionViewWillEnter() {
    // Build an empty form for the template to render
    this.form = this.formBuilder.group({});

    this.page = this.navParams.get('page') || this.page;
    this.pageTitleKey = this.navParams.get('pageTitleKey') || this.pageTitleKey;

    this.translate.get(this.pageTitleKey).subscribe((res) => {
      this.pageTitle = res;
    })

    this.profile = this.user.getProfile();

    this.settingsReady = true;

    this._buildForm();
  }

  ngOnChanges() {
    logger.debug(CLASSNAME, 'Ng All Changes');
  }

  get appVersion() {
    return APPNAME +' v' + appVersion;
  }

  doRefresh(refresher) {
    this.appManager.performManualUpdate();
    refresher.complete();
  }
}