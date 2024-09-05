import { map, Observable, Subject } from "rxjs";
import { IdToken } from "../models/login-response.model";
import { PermissionValues } from "../models/permission.model";
import { User } from "../models/user.model";
import { ConfigurationService } from "./configuration.service";
import { DBkeys } from "./dk-keys";
import { JwtHelper } from "./jwt-helper";
import { LocalStoreManager } from "./local-store-manager.service";
import { OidcHelperService } from "./oidc-helper.service";


export default class AuthService {
    jwthelper: JwtHelper;
    localStorage: LocalStoreManager;
    configurations: ConfigurationService;
    oidcHelperService: OidcHelperService;

    private previousIsLoggedInCheck = false;
    public reLoginDelegate: (() => void) | undefined;
    private loginStatus = new Subject<boolean>();

    public get loginUrl() { return this.configurations.loginUrl; }
    public get homeUrl() { return this.configurations.homeUrl; }

    public loginRedirectUrl= "";
    public logoutRedirectUrl="";

    constructor() {
        
        this.jwthelper = new JwtHelper();
        this.localStorage = new LocalStoreManager();
        this.configurations = new ConfigurationService();
        this.oidcHelperService = new OidcHelperService();
        this.initializeLoginStatus();
    }

    private initializeLoginStatus() {
        this.localStorage.getInitEvent().subscribe(() => {
            this.reevaluateLoginStatus();
        });
    }

    gotoPage(page: string, preserveParams = true) {
        window.location.pathname = page;
    }

    gotoHomePage() {
        window.location.pathname = this.homeUrl;
    }

    redirectLoginUser() {
        const redirect = this.loginRedirectUrl && this.loginRedirectUrl !== '/' && this.loginRedirectUrl !== ConfigurationService.defaultHomeUrl ? this.loginRedirectUrl : this.homeUrl;
        this.loginRedirectUrl = "";
        window.location.pathname = redirect;
    }

    redirectLogoutUser() {
        console.log(this.loginUrl);
        console.log(this.configurations.loginUrl);
        const redirect = this.logoutRedirectUrl ? this.logoutRedirectUrl : this.loginUrl;
        this.logoutRedirectUrl = "";
        window.location.pathname = redirect ?? "";
    }

    reLogin() {
        if (this.reLoginDelegate) {
            this.reLoginDelegate();
        } else {
            this.redirectForLogin();
        }
    }

    redirectForLogin() {
        this.loginRedirectUrl = window.location.pathname;
        window.location.pathname = this.loginUrl ?? "";
    }

    refreshLogin() {
        return this.oidcHelperService.refreshLogin()
            .pipe(map(resp => this.processLoginResponse(resp, this.rememberMe)));
    }

    loginWithPassword(userName?: string, password?: string, rememberMe?: boolean) {
        if (this.isLoggedIn) {
            this.logout();
        }

        return this.oidcHelperService.loginWithPassword(userName, password)
            .then((response: any) => this.processLoginResponse(response, rememberMe));
    }

    loginWithExternalToken(token: string, provider: string, email: string, password: string) {
        if (this.isLoggedIn) {
            this.logout();
        }

        //return this.oidcHelperService.loginWithExternalToken(token, provider, email, password)
        //    .then((resp:any) => this.processLoginResponse(resp));
    }

    initLoginWithGoogle(rememberMe?: boolean) {
        if (this.isLoggedIn) {
            this.logout();
        }

        this.localStorage.savePermanentData(rememberMe, DBkeys.REMEMBER_ME);
        this.oidcHelperService.initLoginWithGoogle();
    }

    initLoginWithFacebook(rememberMe?: boolean) {
        if (this.isLoggedIn) {
            this.logout();
        }

        this.localStorage.savePermanentData(rememberMe, DBkeys.REMEMBER_ME);
       // this.oidcHelperService.initLoginWithFacebook();
    }

    initLoginWithTwitter(rememberMe?: boolean) {
        if (this.isLoggedIn) {
            this.logout();
        }

        this.localStorage.savePermanentData(rememberMe, DBkeys.REMEMBER_ME);
       // this.oidcHelperService.initLoginWithTwitter();
    }

    private processLoginResponse(response: any, rememberMe?: boolean) {
        const idToken = response.data.id_token;
        const accessToken = response.data.access_token;
        if (idToken == null) {
            throw new Error('accessToken cannot be null');
        }
        if (accessToken == null) {
            throw new Error('accessToken cannot be null');
        }

        rememberMe = rememberMe || this.rememberMe;

        const refreshToken = response.data.refresh_token || this.refreshToken;
        const expiresIn = response.data.expires_in;
        const tokenExpiryDate = new Date();
        tokenExpiryDate.setSeconds(tokenExpiryDate.getSeconds() + expiresIn);
        const accessTokenExpiry = tokenExpiryDate;
        const jwtHelper = new JwtHelper();
        const decodedAccessToken = jwtHelper.decodeToken(idToken) as IdToken;

        const permissions: PermissionValues[] = Array.isArray(decodedAccessToken.permission) ? decodedAccessToken.permission : [decodedAccessToken.permission];

        if (!this.isLoggedIn) {
            this.configurations.import(decodedAccessToken.configuration);
        }

        const user = new User(
            decodedAccessToken.sub,
            decodedAccessToken.name,
            decodedAccessToken.fullname,
            decodedAccessToken.email,
            decodedAccessToken.jobtitle,
            decodedAccessToken.phone_number,
            Array.isArray(decodedAccessToken.role) ? decodedAccessToken.role : [decodedAccessToken.role]);
        user.isEnabled = true;

        this.saveUserDetails(user, permissions, accessToken, refreshToken, accessTokenExpiry, rememberMe);

        this.reevaluateLoginStatus(user);

        return user;
    }

    private saveUserDetails(user: User, permissions: PermissionValues[], accessToken: string, refreshToken: string, expiresIn: Date, rememberMe: boolean) {
        if (rememberMe) {
            this.localStorage.savePermanentData(accessToken, DBkeys.ACCESS_TOKEN);
            this.localStorage.savePermanentData(refreshToken, DBkeys.REFRESH_TOKEN);
            this.localStorage.savePermanentData(expiresIn, DBkeys.TOKEN_EXPIRES_IN);
            this.localStorage.savePermanentData(permissions, DBkeys.USER_PERMISSIONS);
            this.localStorage.savePermanentData(user, DBkeys.CURRENT_USER);
        } else {
            this.localStorage.saveSyncedSessionData(accessToken, DBkeys.ACCESS_TOKEN);
            this.localStorage.saveSyncedSessionData(refreshToken, DBkeys.REFRESH_TOKEN);
            this.localStorage.saveSyncedSessionData(expiresIn, DBkeys.TOKEN_EXPIRES_IN);
            this.localStorage.saveSyncedSessionData(permissions, DBkeys.USER_PERMISSIONS);
            this.localStorage.saveSyncedSessionData(user, DBkeys.CURRENT_USER);
        }

        this.localStorage.savePermanentData(rememberMe, DBkeys.REMEMBER_ME);
    }

    logout(): void {
        this.localStorage.deleteData(DBkeys.ACCESS_TOKEN);
        this.localStorage.deleteData(DBkeys.REFRESH_TOKEN);
        this.localStorage.deleteData(DBkeys.TOKEN_EXPIRES_IN);
        this.localStorage.deleteData(DBkeys.USER_PERMISSIONS);
        this.localStorage.deleteData(DBkeys.CURRENT_USER);

        this.configurations.clearLocalChanges();

        this.reevaluateLoginStatus();
    }

    private reevaluateLoginStatus(currentUser?: User) {
        const user = currentUser || this.localStorage.getDataObject<User>(DBkeys.CURRENT_USER);
        const isLoggedIn = user != null;

        if (this.previousIsLoggedInCheck !== isLoggedIn) {
            setTimeout(() => {
                this.loginStatus.next(isLoggedIn);
            });
        }

        this.previousIsLoggedInCheck = isLoggedIn;
    }

    getLoginStatusEvent(): Observable<boolean> {
        return this.loginStatus.asObservable();
    }

    get currentUser(): User {

        const user = this.localStorage.getDataObject<User>(DBkeys.CURRENT_USER);
        this.reevaluateLoginStatus(user);

        return user;
    }

    get userPermissions(): PermissionValues[] {
        return this.localStorage.getDataObject<PermissionValues[]>(DBkeys.USER_PERMISSIONS) || [];
    }

    get accessToken(): string {
        return this.oidcHelperService.accessToken;
    }

    get accessTokenExpiryDate(): Date {
        return this.oidcHelperService.accessTokenExpiryDate;
    }

    get refreshToken(): string {
        return this.oidcHelperService.refreshToken;
    }

    get isSessionExpired(): boolean {
        return this.oidcHelperService.isSessionExpired;
    }

    get isLoggedIn(): boolean {
        return this.currentUser != null;
    }

    get rememberMe(): boolean {
        return this.localStorage.getDataObject<boolean>(DBkeys.REMEMBER_ME) === true;
    }
}