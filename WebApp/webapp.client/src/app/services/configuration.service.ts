﻿import { Subject } from 'rxjs';
import { LocalStoreManager } from '../services/local-store-manager.service';

import { DBkeys } from './dk-keys';
import { Utilities } from './utilities.service';
// const { LOGIN_URL } = process.env;
interface UserConfiguration {
    language: string;
    homeUrl: string;
    themeId: number;
    showDashboardStatistics: boolean;
    showDashboardNotifications: boolean;
    showDashboardTodo: boolean;
    showDashboardBanner: boolean;
}

export class ConfigurationService {
    localStorage: LocalStoreManager;
    constructor() {

        this.localStorage = new LocalStoreManager();
        this.loadLocalChanges();
    }

    set language(value: string) {
        this._language = value;
        this.saveToLocalStore(value, DBkeys.LANGUAGE);
        //this.translationService.changeLanguage(value);
    }
    get language() {
        return this._language || ConfigurationService.defaultLanguage;
    }

    set globalLanguage(value: string) {
        this._globalLanguage = value;
       // this.saveToLocalStore(value, DBkeys.GLOBAL_LANGUAGE);
    }
    get globalLanguage() {
        return this._globalLanguage;
    }

    set themeId(value: number) {
        value = +value;
        this._themeId = value;
        this.saveToLocalStore(value, DBkeys.THEME_ID);
       // this.themeManager.installTheme(this.themeManager.getThemeByID(value));
    }
    get themeId() {
        return this._themeId || ConfigurationService.defaultThemeId;
    }

    set homeUrl(value: string) {
        this._homeUrl = value;
        this.saveToLocalStore(value, DBkeys.HOME_URL);
    }
    get homeUrl() {
        return this._homeUrl || ConfigurationService.defaultHomeUrl;
    }

    set showDashboardStatistics(value: boolean) {
        this._showDashboardStatistics = value;
        this.saveToLocalStore(value, DBkeys.SHOW_DASHBOARD_STATISTICS);
    }
    get showDashboardStatistics() {
        return this._showDashboardStatistics != null ? this._showDashboardStatistics : ConfigurationService.defaultShowDashboardStatistics;
    }

    set showDashboardNotifications(value: boolean) {
        this._showDashboardNotifications = value;
        this.saveToLocalStore(value, DBkeys.SHOW_DASHBOARD_NOTIFICATIONS);
    }
    get showDashboardNotifications() {
        return this._showDashboardNotifications != null ? this._showDashboardNotifications : ConfigurationService.defaultShowDashboardNotifications;
    }

    set showDashboardTodo(value: boolean) {
        this._showDashboardTodo = value;
        this.saveToLocalStore(value, DBkeys.SHOW_DASHBOARD_TODO);
    }
    get showDashboardTodo() {
        return this._showDashboardTodo != null ? this._showDashboardTodo : ConfigurationService.defaultShowDashboardTodo;
    }

    set showDashboardBanner(value: boolean) {
        this._showDashboardBanner = value;
        this.saveToLocalStore(value, DBkeys.SHOW_DASHBOARD_BANNER);
    }
    get showDashboardBanner() {
        return this._showDashboardBanner != null ? this._showDashboardBanner : ConfigurationService.defaultShowDashboardBanner;
    }
    public static readonly appVersion: string = '6.0.0';

    // ***Specify default configurations here***
    public static readonly defaultLanguage: string = 'en';
    public static readonly defaultHomeUrl: string = '/';
    public static readonly defaultThemeId: number = 1;
    public static readonly defaultShowDashboardStatistics: boolean = true;
    public static readonly defaultShowDashboardNotifications: boolean = true;
    public static readonly defaultShowDashboardTodo: boolean = false;
    public static readonly defaultShowDashboardBanner: boolean = true;

    public baseUrl = import.meta.env.VITE_REACT_API_URL || Utilities.baseUrl();
    public loginUrl = import.meta.env.VITE_PUBLIC_URL;
    public googleClientId = import.meta.env.VITE_GOOGLECLIENTID;;
    public facebookClientId = import.meta.env.VITE_FACEBOOKCLIENTID;
    public fallbackBaseUrl = 'https://quickapp-standard.ebenmonney.com';
    // ***End of defaults***

    private _language: string = "";
    private _globalLanguage: string = "";
    private _homeUrl: string = "";
    private _themeId: number = 0;
    private _showDashboardStatistics: boolean = false;
    private _showDashboardNotifications: boolean = false;
    private _showDashboardTodo: boolean = false;
    private _showDashboardBanner: boolean = false;
    private onConfigurationImported: Subject<void> = new Subject<void>();

    configurationImported$ = this.onConfigurationImported.asObservable();

    private loadLocalChanges() {
        if (this.localStorage.exists(DBkeys.LANGUAGE)) {
            this._language = this.localStorage.getDataObject<string>(DBkeys.LANGUAGE);
            //this.translationService.changeLanguage(this._language);
        } else {
            this.resetLanguage();
        }

        if (this.localStorage.exists(DBkeys.THEME_ID)) {
            this._themeId = this.localStorage.getDataObject<number>(DBkeys.THEME_ID);
           // this.themeManager.installTheme(this.themeManager.getThemeByID(this._themeId));
        } else {
            this.resetTheme();
        }

        if (this.localStorage.exists(DBkeys.HOME_URL)) {
            this._homeUrl = this.localStorage.getDataObject<string>(DBkeys.HOME_URL);
        }

        if (this.localStorage.exists(DBkeys.SHOW_DASHBOARD_STATISTICS)) {
            this._showDashboardStatistics = this.localStorage.getDataObject<boolean>(DBkeys.SHOW_DASHBOARD_STATISTICS);
        }

        if (this.localStorage.exists(DBkeys.SHOW_DASHBOARD_NOTIFICATIONS)) {
            this._showDashboardNotifications = this.localStorage.getDataObject<boolean>(DBkeys.SHOW_DASHBOARD_NOTIFICATIONS);
        }

        if (this.localStorage.exists(DBkeys.SHOW_DASHBOARD_TODO)) {
            this._showDashboardTodo = this.localStorage.getDataObject<boolean>(DBkeys.SHOW_DASHBOARD_TODO);
        }

        if (this.localStorage.exists(DBkeys.SHOW_DASHBOARD_BANNER)) {
            this._showDashboardBanner = this.localStorage.getDataObject<boolean>(DBkeys.SHOW_DASHBOARD_BANNER);
        }
    }

    private saveToLocalStore(data: any, key: string) {
        setTimeout(() => this.localStorage.savePermanentData(data, key));
    }

    public import(jsonValue: string) {
        this.clearLocalChanges();

        if (jsonValue) {
            const importValue: UserConfiguration = Utilities.JsonTryParse(jsonValue);

            if (importValue.language != null) {
                this.language = importValue.language;
            }

            if (importValue.themeId != null) {
                this.themeId = +importValue.themeId;
            }

            if (importValue.homeUrl != null) {
                this.homeUrl = importValue.homeUrl;
            }

            if (importValue.showDashboardStatistics != null) {
                this.showDashboardStatistics = importValue.showDashboardStatistics;
            }

            if (importValue.showDashboardNotifications != null) {
                this.showDashboardNotifications = importValue.showDashboardNotifications;
            }

            if (importValue.showDashboardTodo != null) {
                this.showDashboardTodo = importValue.showDashboardTodo;
            }

            if (importValue.showDashboardBanner != null) {
                this.showDashboardBanner = importValue.showDashboardBanner;
            }
        }

        this.onConfigurationImported.next();
    }

    public export(changesOnly = true): string {
        const exportValue: UserConfiguration = {
            language: changesOnly ? this._language : this.language,
            themeId: changesOnly ? this._themeId : this.themeId,
            homeUrl: changesOnly ? this._homeUrl : this.homeUrl,
            showDashboardStatistics: changesOnly ? this._showDashboardStatistics : this.showDashboardStatistics,
            showDashboardNotifications: changesOnly ? this._showDashboardNotifications : this.showDashboardNotifications,
            showDashboardTodo: changesOnly ? this._showDashboardTodo : this.showDashboardTodo,
            showDashboardBanner: changesOnly ? this._showDashboardBanner : this.showDashboardBanner
        };

        return JSON.stringify(exportValue);
    }

    public clearLocalChanges() {
        this._language = "";
        this._homeUrl = "";
        this._showDashboardStatistics = false;
        this._showDashboardNotifications = false;
        this._showDashboardTodo = false;
        this._showDashboardBanner = false;

        this.localStorage.deleteData(DBkeys.LANGUAGE);
        this.localStorage.deleteData(DBkeys.THEME_ID);
        this.localStorage.deleteData(DBkeys.HOME_URL);
        this.localStorage.deleteData(DBkeys.SHOW_DASHBOARD_STATISTICS);
        this.localStorage.deleteData(DBkeys.SHOW_DASHBOARD_NOTIFICATIONS);
        this.localStorage.deleteData(DBkeys.SHOW_DASHBOARD_TODO);
        this.localStorage.deleteData(DBkeys.SHOW_DASHBOARD_BANNER);

        this.resetLanguage();
        this.resetTheme();
        this.clearUserConfigKeys();
    }

    private resetLanguage() {

        //if (this._globalLanguage) {
        //    this._language = this.translationService.changeLanguage(this._globalLanguage);
        //} else {
        //    const language = this.translationService.useBrowserLanguage();

        //    if (language) {
        //        this._language = language;
        //    } else {
        //        this._language = this.translationService.useDefaultLangage();
        //    }
        //}
    }

    private resetTheme() {
        //this.themeManager.installTheme();
        //this._themeId = null;
    }


    private addKeyToUserConfigKeys(configKey: string) {
        const configKeys = this.localStorage.getDataObject<string[]>(DBkeys.USER_CONFIG_KEYS) ?? [];

        if (!configKeys.includes(configKey)) {
            configKeys.push(configKey);
            this.localStorage.savePermanentData(configKeys, DBkeys.USER_CONFIG_KEYS);
        }
    }

    private clearUserConfigKeys() {
        const configKeys = this.localStorage.getDataObject<string[]>(DBkeys.USER_CONFIG_KEYS);

        if (configKeys != null && configKeys.length > 0) {
            for (let key of configKeys) {
                this.localStorage.deleteData(key);
            }

            this.localStorage.deleteData(DBkeys.USER_CONFIG_KEYS);
        }
    }

    public saveConfiguration(data: any, configKey: string) {
        this.addKeyToUserConfigKeys(configKey);
        this.localStorage.savePermanentData(data, configKey)
    }

    public getConfiguration<T>(configKey: string, isDateType = false): T {
        return this.localStorage.getDataObject<T>(configKey, isDateType);
    }
}
