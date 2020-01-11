import 'rxjs/add/operator/toPromise';

import { Injectable, NgZone } from '@angular/core';

import { Api } from '../api/api';
import log from 'loglevel';
import { DEFAULT_PREFERENCES, LOGLEVEL } from '../global/global';

/**
 * @author Peter Kristensen
 *
 */

const CLASSNAME = '[User]';
const logger = log.getLogger(CLASSNAME);

// Now we just set token lifetime in program, later to be received via API
const TOKEN_LIFETIME = 3600 * 24 * 7;

@Injectable()
export class User {
  _user: any = {};
  _settings: any;
  _idToken: any;
  _accessToken: any;
  _serverSettings: any;
  _tokenLifeTime = TOKEN_LIFETIME;

  constructor(
    public zone: NgZone,
    public api: Api) {
    logger.setLevel(LOGLEVEL);

    this._user = this.getStorageVariable('profile');
    this._idToken = this.getStorageVariable('id_token');

    this._tokenLifeTime = this.getTokenLifetime();
    logger.debug(CLASSNAME, "tokenLifeTime", this._tokenLifeTime);

    if (!this._tokenLifeTime) {
      // If not set, set it to default
      this._tokenLifeTime = TOKEN_LIFETIME;
    }
  }

  private getStorageVariable(name) {
    return JSON.parse(window.localStorage.getItem(name));
  }

  private setStorageVariable(name, data) {
    window.localStorage.setItem(name, JSON.stringify(data));
  }

  private setIdToken(token) {
    this._idToken = token;
    this.setStorageVariable('id_token', token);
  }
/*
  private setAccessToken(token) {
    this._accessToken = token;
    this.setStorageVariable('access_token', token);
  }
*/
  private setProfile(profile) {
    this._user = profile;
    this.setStorageVariable('profile', profile);
  }
/*
  private setUserId(userId) {
    this._user.userId = userId;
    this.setStorageVariable('user_id', userId);
  }
*/
  public isAuthenticated() {
    return false;
    /*
    const expiresAt = JSON.parse(localStorage.getItem('expires_at'));
    return Date.now() < expiresAt;
    */
  }

  getName() {
    if (!this.isAuthenticated()) {
      return 'NOT LOGGED IN'
    } else {
      let profile = this.getProfile();
      return profile ? profile.name : '??';
    }
  }


  getProfile() {
    return this.getStorageVariable('profile');
  }

  getTokenLifetime() {
    return this.getStorageVariable('token_lifetime');
  }

  getPictureProductId() {
    return this.getStorageVariable('imageId');
  }

  setPictureProductId(imageId) {
    this.setStorageVariable('imageId', imageId);
  }

  hasPictureProductId(): boolean {
    const METHOD = "hasPictureProductId()";
    logger.debug(CLASSNAME,METHOD,JSON.stringify(this.getPictureProductId() == null,null,2));
    return (this.getPictureProductId() !== null)
  }

  setTokenLifetime(tokenLifetime: number) {
    this.setStorageVariable('token_lifetime', tokenLifetime);
    this._tokenLifeTime = tokenLifetime;
  }

  getSettings() {
    return this._user.mobilePreferences;
  }

  setSettings(settings: any) {
    // const METHOD = "setSettings()";
    return; // Local settings not possible!
    /*
    this.api.get('customers/customer/' + this._user.id + '/api/').subscribe(currentUserDetails => {
      let newUser: any = currentUserDetails;
      let newPref = {};
      if (newUser.mobilePreferences) {
        newPref = JSON.parse(newUser.mobilePreferences);
      }
      for (let k in settings) {
        newPref[k] = settings[k];
      }
      newUser.mobilePreferences = JSON.stringify(newPref);

      this.api.put('customers/customer/' + this._user.id + '/api/', newUser).subscribe((userDetails) => {
        this.setProfile(newUser);
        logger.debug(CLASSNAME, METHOD, "userPreferences updated", JSON.stringify(userDetails, null, 2));
      },
        (err) => logger.error(CLASSNAME, METHOD, "unable to save preferences")
      );
    },
      (err) => logger.error(CLASSNAME, METHOD, "unable to load update userdetails")
    );
    */
  }

  get settings() {
    return this._user.mobilePreferences;
  }

  get profile() {
    return this._user;
  }

  get directOrder() {
    return this._user ? (this._user.dealMode == 'directorder') : true;
  }

  get scanFormats() {
    return this._user.scanFormats ? this._user.scanFormats : DEFAULT_PREFERENCES.scanFormats;
  }

  get language() {
    return this._user.language;
  }

  set language(lang: string) {
    const METHOD = 'set language';
    logger.info(CLASSNAME,METHOD,'Language: ', lang);
  }

  /**
   * Send a POST request to our login endpoint with the data
   * the user entered on the form.
   */
  login(accountInfo: any) {
    const METHOD = "login()";


    return new Promise((resolve, reject) => {
      this.api.post('accounts/token/', accountInfo).subscribe((res: any) => {
        // If the API returned a successful response, mark the user as logged in
        if (res.status == 'success') {
          this._loggedIn(res);
        } else if (res.token) {

          logger.debug(CLASSNAME, "IdToken received");
          this.setIdToken(res.token);
          // this.setAccessToken(res.token);
          const expiresAt = JSON.stringify((this._tokenLifeTime * 1000) + new Date().getTime());
          this.setStorageVariable('expires_at', expiresAt);

          // Get user Id
          this.api.get('customers/customer/list/api/').subscribe((userId: any) => {
            logger.debug(CLASSNAME,METHOD,JSON.stringify(userId,null,2));
            if (userId.count <= 0) {
              reject("Customer not found");
            } else {
              let id = userId.results[0].id;
              this.setPictureProductId(userId.results[0].imageId)
              // Get user details
              this.api.get('customers/customer/' + id + '/api/').subscribe((userDetails) => {
                logger.debug(CLASSNAME, METHOD, "userdetails", id, JSON.stringify(userDetails, null, 2));
                this.setProfile(userDetails);

                if (!this._user.mobilePreferences) {
                  this.setSettings(DEFAULT_PREFERENCES);
                } else {
                  this._settings = JSON.parse(this._user.mobilePreferences);
                }

                this.loadServerSettings();

                resolve("OK");
              },
                (err) => reject(err.statusText)
              );
            }
          },
            (err) => reject(err.statusText)
          );

        } else {
          logger.warn(CLASSNAME, METHOD, res);
        }
      }, err => {
        reject(err);
      });
    })
  }


  /**
   * Send a POST request to our signup endpoint with the data
   * the user entered on the form.
   */
  signup(accountInfo: any) {
    const METHOD = "signup()";

    let seq = this.api.post('signup', accountInfo);

    seq.subscribe((res: any) => {
      // If the API returned a successful response, mark the user as logged in
      if (res.status == 'success') {
        this._loggedIn(res);
      }
    }, err => {
      logger.error(CLASSNAME, METHOD, 'ERROR', err);
    });
    return seq;
  }

  tokenRefresh() {
    const METHOD = "tokenRefresh()";

    this.api.post('accounts/token-refresh/', { token: this._idToken }).subscribe((res: any) => {
      // If the API returned a successful response, mark the user as logged in
      if (res.status == 'success') {
        this._loggedIn(res);
      } else if (res.token) {
        this.setIdToken(res.token);
        // this.setAccessToken(res.token);
        const expiresAt = JSON.stringify((this._tokenLifeTime * 1000) + new Date().getTime());
        this.setStorageVariable('expires_at', expiresAt);
      } else {
        logger.warn(CLASSNAME, METHOD, res);
      }
    }, err => {
      logger.error(CLASSNAME, METHOD, err)
    })
  }

  private loadServerSettings() {
    const METHOD = "loadServerSettings()";
    this.api.get('accounts/serverstatistics/').subscribe((serverSettings: any) => {
      logger.debug(CLASSNAME,METHOD,JSON.stringify(serverSettings,null,2));
      this.setTokenLifetime(serverSettings.JWT_AUTH.JWT_REFRESH_EXPIRATION_DELTA);
    },
      (err) => logger.error(CLASSNAME, METHOD, JSON.stringify(err,null,2))
    )
  }

  /**
   * Log the user out, which forgets the session
   */
  logout() {
    window.localStorage.removeItem('profile');
    window.localStorage.removeItem('user_id');
    window.localStorage.removeItem('access_token');
    window.localStorage.removeItem('id_token');
    window.localStorage.removeItem('expires_at');

    this._user = null;
    this._idToken = null;
    this._accessToken = null;
  }

  /**
   * Process a login/signup response to store user data
   */
  _loggedIn(resp) {
    this._user = resp.user;
  }

}
