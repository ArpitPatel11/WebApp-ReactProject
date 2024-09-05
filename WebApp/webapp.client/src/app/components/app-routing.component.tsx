import React, { useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import AuthService from '../services/auth.service';
import App from './app.component';
//import Home from './home/home.component';
import Home from './home/home.component';
import Login from './login/login.component';
import Products from './products/products.component';
import Settings from './settings/settings.component';
//import Register from './account/register/register.component';
//import ForgetPassword from './account/recover-password/recover-password..component';
//import About from './about/about.component';
//import Settings from './settings/settings.component';



const Routing = () => {
    const authService = new AuthService();
    const [isUserLoggedIn, setIsuserLoggedin] = useState(authService.isLoggedIn);

    const ProtectedRoute = ({ children }: any) => {
        if (isUserLoggedIn) {
            setIsuserLoggedin(true);
            return <>{children}</>;
        }
        else {
            setIsuserLoggedin(false);
            return <Navigate to="/login" />;
        }
    }

    return (
        <BrowserRouter>
        <App>
            <Routes>
                    <Route path="/" element={<ProtectedRoute > <Home /> </ProtectedRoute>} />
                    <Route path="login" element={<Login />} />
                    {/*<Route path="register" element={<Register />} />*/}
                    {/*<Route path="forgetpassword" element={<ForgetPassword />} />*/}
                    <Route path="home" element={<ProtectedRoute > <Home /> </ProtectedRoute>} />
                    {/*<Route path="customers" element={<ProtectedRoute > <Customers /> </ProtectedRoute>} />*/}
                    {/*<Route path="orders" element={<ProtectedRoute > <Orders />  </ProtectedRoute>} />*/}
                    <Route path="products" element={<ProtectedRoute > <Products />  </ProtectedRoute>} />
                    <Route path="settings" element={<ProtectedRoute > <Settings /> </ProtectedRoute>} />
                    {/*<Route path="about" element={<About />} />*/}
                    {/*<Route path="*" element={< NotFound />} />*/}
            </Routes>
        </App>
        </BrowserRouter>
       
                
   
    );
}

export default Routing;