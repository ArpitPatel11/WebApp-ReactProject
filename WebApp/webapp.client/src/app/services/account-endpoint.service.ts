import axios from "axios";
import { error } from "console";
import { catchError } from "rxjs";
import AuthService from "./auth.service";
import { ConfigurationService } from "./configuration.service";
import { EndpointBase } from "./endpoint-base.service";

export class AccountEndpoint {
    authService: AuthService;
    configurations: ConfigurationService;
    endpointBase: EndpointBase;

    constructor() {
        this.authService = new AuthService();
        this.configurations = new ConfigurationService();
        this.endpointBase = new EndpointBase()
    }

    get usersUrl() { return this.configurations.baseUrl + '/api/account/users'; }
    get usersPublicUrl() { return this.configurations.baseUrl + '/api/account/public/users'; }
    get userByUserNameUrl() { return this.configurations.baseUrl + '/api/account/users/username'; }
    get userHasPasswordUrl() { return this.configurations.baseUrl + '/api/account/users/haspassword'; }
    get currentUserUrl() { return this.configurations.baseUrl + '/api/account/users/me'; }
    get currentUserPreferencesUrl() { return this.configurations.baseUrl + '/api/account/users/me/preferences'; }
    get sendConfirmEmailUrl() { return this.configurations.baseUrl + '/api/account/users/me/sendconfirmemail'; }
    get confirmEmailUrl() { return this.configurations.baseUrl + '/api/account/public/confirmemail'; }
    get recoverPasswordUrl() { return this.configurations.baseUrl + '/api/account/public/recoverpassword'; }
    get resetPasswordUrl() { return this.configurations.baseUrl + '/api/account/public/resetpassword'; }
    get unblockUserUrl() { return this.configurations.baseUrl + '/api/account/users/unblock'; }
    get rolesUrl() { return this.configurations.baseUrl + '/api/account/roles'; }
    get roleByRoleNameUrl() { return this.configurations.baseUrl + '/api/account/roles/name'; }
    get permissionsUrl() { return this.configurations.baseUrl + '/api/account/permissions'; }


    getUserEndpoint<T>(userId?: string) {
        const endpointUrl = userId ? `${this.usersUrl}/${userId}` : this.currentUserUrl;

        return fetch(endpointUrl, this.endpointBase.requestHeaders).then(response => response.json())
     }

    getUserByUserNameEndpoint<T>(userName: string): any {
        const endpointUrl = `${this.userByUserNameUrl}/${userName}`;

        return axios.get(endpointUrl, this.endpointBase.requestHeaders).then(res => res.data).catch(error => console.log(error));
    }                           

    getUsersEndpoint<T>(page?: number, pageSize?: number) {
        const endpointUrl = page && pageSize ? `${this.usersUrl}/${page}/${pageSize}` : this.usersUrl;

        return fetch(endpointUrl, this.endpointBase.requestHeaders).then(response =>response.json())
    }

    getNewUserEndpoint<T>(userObject: any, isPublicRegistration: any) {
        const endpointUrl = isPublicRegistration ? this.usersPublicUrl : this.usersUrl;

        return axios.post<T>(endpointUrl, JSON.stringify(userObject), this.endpointBase.requestHeaders).then(res => res.data).then(error => console.log(error));
    }

    getUpdateUserEndpoint(userObject: any, userId?: string) {
        const endpointUrl = userId ? `${this.usersUrl}/${userId}` : this.currentUserUrl;

        return axios.put(endpointUrl, JSON.stringify(userObject), this.endpointBase.requestHeaders).then(res => res.data).then(error => console.log(error));
    }

    getPatchUpdateUserEndpoint(patch: {}, userId?: string): any;
    getPatchUpdateUserEndpoint(value: any, op: string, path: string, from?: any, userId?: string): any;
    getPatchUpdateUserEndpoint(valueOrPatch: any, opOrUserId?: any, path?: any, from?: any, userId?: string): any {
        let endpointUrl: string;
        let patchDocument: {};

        if (path) {
            endpointUrl = userId ? `${this.usersUrl}/${userId}` : this.currentUserUrl;
            patchDocument = from ?
                [{ value: valueOrPatch, path, op: opOrUserId, from }] :
                [{ value: valueOrPatch, path, op: opOrUserId }];
        } else {
            endpointUrl = opOrUserId ? `${this.usersUrl}/${opOrUserId}` : this.currentUserUrl;
            patchDocument = valueOrPatch;
        }

        return axios.patch(endpointUrl,JSON.stringify(patchDocument), this.endpointBase.requestHeaders).then((res: any) => { JSON.stringify(res.data); },
            catchError(error => {
                return this.endpointBase.handleError(error, () => this.getPatchUpdateUserEndpoint(valueOrPatch, opOrUserId, path, from, userId))
            })
        );
    }


    getUserPreferencesEndpoint<T>(): any {

        return axios.get(this.currentUserPreferencesUrl, this.endpointBase.requestHeaders).then((res: any) => { JSON.stringify(res.data); },
            catchError(error => {
                return this.endpointBase.handleError(error, () => this.getUserPreferencesEndpoint())
            })
        );
    }

    getUpdateUserPreferencesEndpoint(configuration: string): any {
        return axios.put(this.currentUserPreferencesUrl, JSON.stringify(configuration), this.endpointBase.requestHeaders).then((res: any) => { JSON.stringify(res.data); },
            catchError(error => {
                return this.endpointBase.handleError(error, () => this.getUpdateUserPreferencesEndpoint(configuration))
            })
        );
    }

    getUnblockUserEndpoint(userId: string): any {
        const endpointUrl = `${this.unblockUserUrl}/${userId}`;

        return axios.put(endpointUrl, null,  this.endpointBase.requestHeaders).then((res: any) => { JSON.stringify(res.data); },
            catchError(error => {
                return this.endpointBase.handleError(error, () => this.getUnblockUserEndpoint(userId))
            })
        );
    }

    getDeleteUserEndpoint<T>(userId: string): any {
        const endpointUrl = `${this.usersUrl}/${userId}`;

        return axios.delete(endpointUrl, this.endpointBase.requestHeaders).then((res: any) => { JSON.stringify(res.data); },
            catchError(error => {
                return this.endpointBase.handleError(error, () => this.getUnblockUserEndpoint(userId))
            })
        );
    }

    getRoleEndpoint(roleId: string): any {
        const endpointUrl = `${this.rolesUrl}/${roleId}`;

        return axios.get(endpointUrl, this.endpointBase.requestHeaders).then((res: any) => { JSON.stringify(res.data); },
            catchError(error => {
                return this.endpointBase.handleError(error, () => this.getRoleEndpoint(roleId))
            })
        );
    }

    getRoleByRoleNameEndpoint<T>(roleName: string):any {
        const endpointUrl = `${this.roleByRoleNameUrl}/${roleName}`;
        //return axios.get(endpointUrl, this.endpointBase.requestHeaders).then((res: any) => {
        // JSON.stringify(res.data);
        //});
        return fetch(endpointUrl, this.endpointBase.requestHeaders).then(response => response.json())
    }

    getRolesEndpoint<T>(page?: number, pageSize?: number) {
        const endpointUrl = page && pageSize ? `${this.rolesUrl}/${page}/${pageSize}` : this.rolesUrl;

        return fetch(endpointUrl, this.endpointBase.requestHeaders)
            .then(response => response.json())
    }

    getNewRoleEndpoint<T>(roleObject: any) {
        return axios.post<T>(this.rolesUrl, JSON.stringify(roleObject), this.endpointBase.requestHeaders)
            .then(res => res.data).then(error => console.log(error));
    }
    

    getUpdateRoleEndpoint<T>(roleObject: any, roleId?: string) {
        const endpointUrl = `${this.rolesUrl}/${roleId}`;
        return axios.put(endpointUrl, roleObject, this.endpointBase.requestHeaders)
            .then((res: any) => {
                JSON.stringify(res.data);
            });
    }

    getDeleteRoleEndpoint<T>(roleId: string): any {
        const endpointUrl = `${this.rolesUrl}/${roleId}`;

        return axios.delete(endpointUrl, this.endpointBase.requestHeaders).then((res: any) => { JSON.stringify(res.data); },
            catchError(error => {
                return this.endpointBase.handleError(error, () => this.getDeleteRoleEndpoint(roleId))
            })
        );
    }


    getPermissionsEndpoint<T>() {

        return fetch(this.permissionsUrl, this.endpointBase.requestHeaders)
            .then(response => response.json())
    } 

    getUserHasPasswordEndpoint<T>(userId: string) {
        const endpointUrl = `${this.userHasPasswordUrl}/${userId}`;
        return fetch(endpointUrl, this.endpointBase.requestHeaders)
            .then(response => response.json())
    }

    getRecoverPasswordEndpoint<T>(usernameOrEmail: any): any {
        const endpointUrl = `${this.recoverPasswordUrl}`;

        return axios.post<T>(endpointUrl, JSON.stringify(usernameOrEmail), this.endpointBase.requestHeaders).then(res => res.data).then(error => console.log(error));

    }
}