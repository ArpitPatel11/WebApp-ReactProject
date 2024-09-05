import { useForm } from 'react-hook-form';
import './login.component.scss';
import { FaFacebookF, FaGoogle, FaLock, FaSpinner, FaTwitter } from 'react-icons/fa';
import { UserLogin } from '../../models/user-login.model';
import AuthService from '../../services/auth.service';
import { forwardRef, useEffect, useState } from 'react';
import { toast } from 'react-toastify';


const Login = forwardRef((props: { isModal?: any }, ref) => {

    const authService = new AuthService();
    const [isLoading, setIsLoading] = useState(false);
    const [isExternalLogin, setIsExternalLogin] = useState(false);
    let loginStatusSubscription: any;
    let toastId: any;
    const [loginbuttonState, setLoginbuttonState] = useState(<button type="submit" className="btn btn-primary " >Login</button>);

    const { register, handleSubmit, setValue, reset, formState: { errors, isSubmitted } } = useForm<UserLogin>();

    useEffect(() => {
        setValue("rememberMe", authService.rememberMe);       
        if (getShouldRedirect()) {
            authService.redirectLoginUser();
        } else {
            loginStatusSubscription = authService.getLoginStatusEvent().subscribe(isLoggedIn => {
                if (getShouldRedirect()) {
                    authService.redirectLoginUser();
                }
            });
        }

    });

    const getShouldRedirect = () => {
        return authService.isLoggedIn && !authService.isSessionExpired;
    }



    function login(user: UserLogin) {
        setLoginbuttonState(<button className="btn btn-primary " disabled><FaSpinner className="spinner" /> Logging in...</button>);
        toastId = toast("Attempting Login...",
            {
                autoClose: false, type: "info",
                theme: 'colored'
            }
        );
        setIsLoading(true);
        setIsExternalLogin(false);
        authService.loginWithPassword(user.userName, user.password, user.rememberMe)
            .then(() => {
                setTimeout(() => {
                    setIsLoading(false);
                    reset();
                    authService.redirectLoginUser();

                    if (!props.isModal) {
                        toast.update(toastId, {
                            render: `Login` + `Welcome ${user.userName}`,
                            type: "success",
                            theme: 'colored'
                        });
                    } else {
                        toast.update(toastId, {
                            render: `Login` + `Session for ${user.userName} restored!`,
                            type: "success",
                            theme: 'colored'
                        });
                        setTimeout(() => {
                            console.log('Session Restored', 'Please try your last operation again');
                        }, 500);


                    }
                }, 5000);

            })
            .catch((error: any) => {
                setLoginbuttonState(<button type="submit" className="btn btn-primary " >Login</button>);
                setIsLoading(false);
                toast.update(toastId, {
                    render: "Unable to login, Invalid username or password",
                    type: "error",
                    theme: 'colored'
                });
                console.log(error);
            }
            );
    }
    //{ errors.userName && isSubmitted ? toast.error(`Username is required`+`Please enter a valid username.`, { theme: 'colored', toastId: "1" }) : null }
    //{ errors.password && isSubmitted ? toast.error(`Password is required` + `Please enter a valid password`, { theme: 'colored', toastId: "2" }) : null }

    function loginWithGoogle() {
        setIsLoading(true);
        setIsExternalLogin(true);
        authService.initLoginWithGoogle(authService.rememberMe);
    }

    function loginWithFacebook() {
        setIsLoading(true);
        setIsExternalLogin(true);
        authService.initLoginWithFacebook(authService.rememberMe);
    }

    function loginWithTwitter() {
        setIsLoading(true);
        setIsExternalLogin(true);
        authService.initLoginWithTwitter(authService.rememberMe);
    }
    return (
        <div className="d-flex h-95">
            <div className="login-container m-auto">
                <div className="card boxshadow">
                    <div className="card-header bg-primary dark text-white clearfix">
                        <FaLock /> Login
                    </div>
                    <div className="card-body">
                        <div className="col-md-10 offset-md-1 px-md-3">
                            <form onSubmit={handleSubmit(login)}>
                                <div className="form-group row mb-3">
                                    <label className="col-form-label text-md-end col-md-4">Username:</label>
                                    <div className="col-md-8">
                                        <input
                                            type="text"
                                            placeholder="Enter username"
                                            className={`form-control ${errors.userName && isSubmitted ? 'is-invalid' : ''} ${!errors.userName && isSubmitted ? 'is-valid' : ''}`}
                                            {...register('userName', { required: true })}
                                        />
                                        <div className="invalid-feedback">{errors.userName ? "Username is required" : null}</div>
                                    </div>
                                </div>
                                <div className="form-group row mb-3">
                                    <label className="col-form-label text-md-end col-md-4" >Password:</label>
                                    <div className="col-md-8">
                                        <input
                                            type="password"
                                            placeholder="Enter password"
                                            className={`form-control ${errors.password ? 'is-invalid' : ''} ${!errors.password && isSubmitted ? 'is-valid' : ''}`}
                                            {...register('password', { required: true })}
                                        />
                                        <div className="invalid-feedback">{errors.password ? "Password is required" : null}</div>
                                    </div>
                                </div>
                                <div className="form-group row mb-3">
                                    <div className="offset-md-4 col-md-8">
                                        <div className="form-check">
                                            <input
                                                type="checkbox"
                                                defaultChecked={authService.rememberMe}
                                                {...register('rememberMe')}
                                                className="form-check-input"
                                                id="login-rememberme"
                                            />
                                            <label className="form-check-label" htmlFor="login-rememberme">Remember me</label>
                                        </div>
                                    </div>
                                </div>

                                
                                <div className="mb-3 row">
                                    <div className="offset-md-4 col-md-8">
                                        <div className="d-flex align-items-stretch">
                                            {loginbuttonState}
                                                                                 
                                            {!isLoading || isExternalLogin ? (
                                                <div className="d-flex flex-wrap align-items-center justify-content-end w-100">
                                                 <span className="text-muted text-nowrap me-1">or Connect with: </span>
                                                    <div className="d-flex align-items-center">
                                                        <button className="btn btn-outline-danger btn-sm  btn-social" onClick={loginWithGoogle}  ><FaGoogle /></button>
                                                        <button className="btn btn-outline-primary btn-sm btn-social mx-1" onClick={loginWithFacebook} ><FaFacebookF/></button>
                                                        <button className="btn btn-outline-info btn-sm btn-social" onClick={loginWithTwitter} ><FaTwitter/></button>
                                                    </div>
                                                </div>
                                                ): null
                                                   
                                              }  
                                        </div>
                                    </div>
                                </div>

                                <div className="col-md-12">
                                    <hr className="hr-separator" />
                                </div>

                                <div className="col-md-12 last-control-group account-controls text-center">
                                    <span className="card-text">Don't have an account? </span>
                                    <div className="d-inline-block text-nowrap">
                                        <a className="card-link text-link" href="/register" >Register</a>
                                    |
                                        <a className="card-link text-link" href="forgetpassword">Forgot password?</a>
                                </div>
                        </div>
                            </form >
                        </div >
                    </div >
                </div >
            </div >
        </div >
    );
})

export default Login