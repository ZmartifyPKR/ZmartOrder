import { Injectable } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs/Rx';
import log from 'loglevel';
import { LOGLEVEL } from '../global/global';

/**
 * @author Peter Kristensen
 *
 */

const CLASSNAME = '[APIInterceptor]';
const logger = log.getLogger(CLASSNAME);
 
@Injectable()
export class APIInterceptor implements HttpInterceptor {

    constructor(
    ) {
        logger.setLevel(LOGLEVEL);
    }
    
    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        logger.debug(CLASSNAME,'Request: ', JSON.stringify(req,null,2));

        if (req.url.endsWith('/accounts/token/')) {
            const newReq = req.clone({setHeaders: { 'Content-Type': 'application/json'}})
            logger.debug(CLASSNAME,'NewRequest: ', JSON.stringify(newReq,null,2));

            return next.handle(newReq);
        } else if (req.url.includes('/api/')) {
            let idToken = window.localStorage.getItem('id_token');
            /* if (!idToken) {
                this.navCtrl.setRoot('LoginPage');
            }
            */
            /* const authReq = req.clone({ setHeaders: { Authorization: idToken ? this.buildToken(idToken) : 'NO TOKEN',
                    'Content-Type': 'application/json' } });
            */
                   const authReq = req.clone({ setHeaders: { Authorization: idToken ? this.buildToken(idToken) : 'NO TOKEN' } });
            // logger.debug(CLASSNAME,"idToken = ", idToken, JSON.stringify(authReq,null,2));
            return next.handle(authReq);
        } else {
            return next.handle(req);
        }
    }

    buildToken(s: string): string {
        return 'JWT ' + s.replace(/"/g, '');
    }
}
