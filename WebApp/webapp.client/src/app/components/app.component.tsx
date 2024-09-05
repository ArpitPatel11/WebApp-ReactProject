import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {  Navbar, NavItem, NavLink } from 'reactstrap';
import './app.component.scss';
import { FaHome, FaCog, FaSignOutAlt, FaInfoCircle } from "react-icons/fa";
import logo from '../assets/images/logo-white.png';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer, toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import AuthService from '../services/auth.service';
import { AccountService } from '../services/account.service';
import { Permissions } from '../models/permission.model';
import Login from './login/login.component';

const App = (props: any) => {
    
    const authService = new AuthService();
    const accountService = new AccountService();
    const [shouldShowLoginModal, setShouldShowLoginModal] = useState(false);
    const [isAppLoaded, setIsAppLoaded] = useState(false);
    const [removePrebootScreen, setRemovePrebootScreen] = useState(false);
    const [canViewCustomers] = useState({ isCanViewCustomers });
    const [canViewProducts] = useState({ isCanViewProducts });
    const [canViewOrders] = useState({ isCanViewOrders });
    const [isUserLoggedIn, setIsUserLoggedIn] = useState(authService.isLoggedIn);
    const [inAboutPage, setInAboutPage] = useState(true);

    useEffect(() => {
        setTimeout(() => setIsAppLoaded(true), 500);
        setTimeout(() => setRemovePrebootScreen(true), 1000);

        setTimeout(() => {
            if (isUserLoggedIn) {
                if (!authService.isSessionExpired) {
                    toast.success(`Welcome Back ${authService.currentUser ? authService.currentUser.userName : ''}`, { theme: 'colored', toastId: "1" })
                }
                else {
                    toast.error(`Session Expired ,Your Session has expired. Please log in again`, { theme: 'colored', toastId: "1" })
                    setShouldShowLoginModal(true);
                }

            }
        }, 2000);

        authService.reLoginDelegate = () => setShouldShowLoginModal(true);

        authService.getLoginStatusEvent().subscribe((isLoggedIn: any) => {
            setIsUserLoggedIn(isLoggedIn);
            setTimeout(() => {
                if (!isUserLoggedIn) {
                    toast(`Session Expired ,Your Session has expired. Please log in again`, { theme: 'colored', toastId: "1" })
                }
            }, 500);
        });


    });

    function logout() {
        authService.logout();
        authService.redirectLogoutUser();
    }

    function userName() {
        return authService.currentUser ? authService.currentUser.userName : '';
    }

    function isCanViewCustomers() {
        return accountService.userHasPermission(Permissions.viewUsers);
    }
    function isCanViewProducts() {
        return accountService.userHasPermission(Permissions.viewUsers);
    }

    function isCanViewOrders() {
        return true;
    }

    const { t } = useTranslation();
    return (
        <div className="app-component app-container">
            <Navbar id="header" className=" navbar navbar-expand-lg navbar-dark bg-primary fixed-top" >
                <div className="container-xl px-md-3 px-xxl-4">
                   
                   
                    <button type="button" className="navbar-toggler" data-bs-toggle="collapse" data-bs-target=".menuItemsContainer">
                        <span className="navbar-toggler-icon"></span>
                    </button>
                    {isUserLoggedIn ? (
                        <div className="app-component collapse navbar-collapse menuItemsContainer">
                            <Link className="app-component navbar-brand" to={'/'} >
                                <img src={logo} className="d-inline-block align-top" alt="logo" />
                                <span className="d-lg-none d-xl-inline">QuickApp Standard</span>
                            </Link>
                            <ul className="app-component nav nav-pills flex-column flex-lg-row flex-fill" >
                                <NavItem className="nav-item">
                                    <NavLink tag={Link} className="nav-link" to="/home"><FaHome /></NavLink>
                                </NavItem>
                                {canViewCustomers ?
                                    <NavItem className="nav-item">
                                        <NavLink tag={Link} className="nav-link" to="/customers">{t('Customers') as string}</NavLink>
                                    </NavItem> : null}
                                {canViewProducts ?
                                    <NavItem className="nav-item">
                                        <NavLink tag={Link} className="nav-link" to="/products">{t('Products') as string}</NavLink>
                                    </NavItem> : null}
                                {canViewOrders ?
                                    <NavItem className="nav-item">
                                        <NavLink tag={Link} className="nav-link" to="/orders">{t('Orders') as string}</NavLink>
                                    </NavItem> : null}
                                <NavItem className="nav-item">
                                    <NavLink tag={Link} className="nav-link" to="/about">{t('About') as string}</NavLink>
                                </NavItem>
                                <NavItem className="nav-item ms-lg-auto me-lg-2 active">
                                    <NavLink tag={Link} className="nav-link" to="/settings"><FaCog /></NavLink>
                                </NavItem>
                            </ul>
                           

                            <span className="navbar-text notifications-popup d-lg-none d-xl-inline-block">{t('app.Welcome') as string} {userName()}</span>
                            <a className="nav-link user-name d-inline-block px-1" >

                                <span className="badge badge-pill badge-secondary">3</span>
                            </a>

                            <ul className="app-component nav nav-pills ml-lg-2 flex-column flex-lg-row">
                                <li className="nav-item">
                                    <Link to={''} className="nav-link" onClick={logout}><FaSignOutAlt />{t('Logout') as string}</Link>
                                </li>
                            </ul>
                        </div>) :


                        (
                            <div className="app-component collapse navbar-collapse menuItemsContainer">
                                <ul className="app-component nav nav-pills flex-column flex-lg-row ml-auto">
                                    <li className="nav-item" >
                                        {inAboutPage ? 
                                            <Link to="/about" className="nav-link" onClick={() => { setInAboutPage(false) }}><FaInfoCircle /></Link>
                                            :
                                            <Link to="/" className="nav-link" onClick={() => { setInAboutPage(true) }}><FaSignOutAlt /></Link>
                                            }
                                    </li>
                                </ul>
                            </div>
                        )}
                </div>
            </Navbar>

            {!removePrebootScreen ?
                <div id="pre-bootstrap" className="app-component prebootStep">
                    <div className="messaging">
                        <h1>
                            Loaded!
                        </h1>
                        <p>
                            QUICK APPLICATION SYSTEM - <span >quick</span>App &copy; <a href="https://www.ebenmonney.com">WWW.EBENMONNEY.COM</a>
                        </p>

                    </div>
                </div> : null}

            < main className="app-component">
                {props.children}
                <div className="app-component footer-height"></div>
            </main>

            <footer className="app-component footer fixed-bottom">
                <div className="container">
                    <p className="text-center text-muted">
                        <span >quick</span>App &copy; {(new Date().getFullYear())}
                        <a href="https://www.ebenmonney.com" target="_blank">www.ebenmonney.com</a>
                    </p>
                </div>
            </footer>

            {shouldShowLoginModal ?
                <div className="Loginmodal">
                    <div className="w3-modal-content">
                        <div className="w3-container">
                            <Login />
                        </div>
                    </div>
                </div>
                : null}

            <ToastContainer
                className="toast--container"
                position="top-right"
                autoClose={2000}
                hideProgressBar={true}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable={false}
                pauseOnHover
            />
        </div >
    );
}

export default App;
