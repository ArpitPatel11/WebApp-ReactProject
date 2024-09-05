import { catchError, from, mergeMap, Observable, Subject, switchMap, throwError} from "rxjs";
import AuthService from "./auth.service";


export class EndpointBase {

    authService: AuthService;
    taskPauser: any;
    isRefreshingLogin: boolean = false;


    constructor() {
        this.authService = new AuthService();
    }

    public get requestHeaders() {
        const headers = {
            Authorization: 'Bearer ' + this.authService.accessToken,
            'Content-Type': 'application/json',
            Accept: 'application/json, text/plain, */*'
        }

        return { headers };
    }

    public refreshLogin():any {
        return this.authService.refreshLogin().pipe(
            catchError(error => {
                return this.handleError(error, () => this.refreshLogin());
            }));
    }

    public handleError(error: { status: number; error: { error: string; error_description: any; }; }, continuation: () => Observable<any>) {
        if (error.status === 401) {
            if (this.isRefreshingLogin) {
                return this.pauseTask(continuation);
            }

            this.isRefreshingLogin = true;

            return from(this.authService.refreshLogin()).pipe(
                mergeMap(() => {
                    this.isRefreshingLogin = false;
                    this.resumeTasks(true);

                    return continuation();
                }),
                catchError(refreshLoginError => {
                    this.isRefreshingLogin = false;
                    this.resumeTasks(false);
                    this.authService.reLogin();

                    if (refreshLoginError.status === 401 || (refreshLoginError.error && refreshLoginError.error.error === 'invalid_grant')) {
                        return throwError('session expired');
                    } else {
                        return throwError(refreshLoginError || 'server error');
                    }
                }));
        }

        if (error.error && error.error.error === 'invalid_grant') {
            this.authService.reLogin();

            return throwError((error.error && error.error.error_description) ? `session expired (${error.error.error_description})` : 'session expired');
        } else {
            return throwError(error);
        }
    }



    private pauseTask(continuation: () => Observable<any>) {
        if (!this.taskPauser) {
            this.taskPauser = new Subject();
        }

        return this.taskPauser.pipe(switchMap(continueOp => {
            return continueOp ? continuation() : throwError('session expired');
        }));
    }


    private resumeTasks(continueOp: boolean) {
        setTimeout(() => {
            if (this.taskPauser) {
                this.taskPauser.next(continueOp);
                this.taskPauser.complete();
                this.taskPauser = null;
            }
        });
    }
}