import { LocalStoreManager } from "./local-store-manager.service";
import { ConfigurationService } from "./configuration.service";
import { UserManager, UserManagerSettings } from 'oidc-client';
import axios from 'axios';
import qs from 'qs';
import { DBkeys } from "./dk-keys";

export class OidcHelperService {
    localStorage: LocalStoreManager;
    requestResponse: any;
    configurations: ConfigurationService;
    private readonly tokenEndpoint = '/connect/token';
    private readonly clientId = 'quickapp_spa';
    private readonly scope = 'openid email phone profile offline_access roles';
    private readonly twitterRequestTokenEndpoint = '/oauth/twitter/request_token';
    private readonly twitterAccessTokenEndpoint = '/oauth/twitter/access_token';

    constructor() {
        this.configurations = new ConfigurationService();
        this.requestResponse = "";
        this.localStorage = new LocalStoreManager();
    }

    loginWithPassword(userName?: string, password?: string) {
        // var axios = require('axios');
        // var qs = require('qs');
        var data = qs.stringify({
            'client_id': this.clientId,
            'scope': this.scope,
            'grant_type': 'password',
            'username': userName,
            'password': password
        });
        const headers = {
            'Content-Type': 'application/x-www-form-urlencoded'
        };
        return axios.post(this.tokenEndpoint, data, { headers });  
    }

    refreshLogin() {
        //var axios = require('axios');
        //var qs = require('qs');
        var data = qs.stringify({
            'client_id': this.clientId,
            'refresh_token': this.refreshToken,
            'grant_type': 'refresh_token'

        });
        const headers = {
            'Content-Type': 'application/x-www-form-urlencoded'
        };
        return axios.post(this.tokenEndpoint, data, { headers });  
    }

    loginWithExternalToken(token: string, provider: string, email?: string, password?: string) {
        //var axios = require('axios');
        //var qs = require('qs');
        var params = qs.stringify({
            'token': token,
            'provider': provider,
            'client_id': 'quickapp_spa',
            'grant_type': 'delegation',
            'scope': 'openid email phone profile offline_access roles quickapp_api',
        });
        const header = {
            'Content-Type': 'application/x-www-form-urlencoded'
        };

        if (email) {
            params = params.append('email', email);
        }

        if (password) {
            params = params.append('password', password);
        }

        return axios.post(this.tokenEndpoint, params, { headers: header });
    }

    initLoginWithGoogle() {
        const settings: UserManagerSettings = {
            'authority': 'https://accounts.google.com' ,
            'redirect_uri': this.configurations.baseUrl + '/google-login' as string,
            'client_id': this.configurations.googleClientId as string,
            'scope': 'openid profile email',
            response_type: 'code',
            post_logout_redirect_uri: this.configurations.baseUrl + '/google-login', // Match with your OAuth Client signout redirect URI
        }

        const userManager = new UserManager(settings);
        userManager.signinRedirect();
        userManager.signinRedirectCallback()
        //var url = userManager.settings.metadataUrl;
        //return axios.get('https://accounts.google.com/o/oauth2/v2/auth', { headers }).then((res: any) => {
        //    console.log(res);

        //});
    }
    //createSigninRequest() {
    //    this.userManager.createSigninRequest().then((req) => {
    //        window.location.href = req.url;
    //    }).catch(function (err) {
    //    });
    //}
    get accessToken(): string {
        return this.localStorage.getData(DBkeys.ACCESS_TOKEN);
    }

    get accessTokenExpiryDate(): Date {
        return this.localStorage.getDataObject<Date>(DBkeys.TOKEN_EXPIRES_IN, true);
    }

    get refreshToken(): string {
        return this.localStorage.getData(DBkeys.REFRESH_TOKEN);
    }

    get isSessionExpired(): boolean {
        if (this.accessTokenExpiryDate == null) {
            return true;
        }

        return this.accessTokenExpiryDate.valueOf() <= new Date().valueOf();
    }
}