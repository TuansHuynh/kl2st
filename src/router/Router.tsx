import { createBrowserRouter, Navigate } from "react-router-dom";
import App from "../App";

import MainLayout from "../pages/layout/MainLayout";
import Home from "../pages/Main/Home" ;
import FileStorage from "../pages/Main/FileStorage";

import GuestLayout from "../pages/layout/GuestLayout";
import Login from "../pages/Auth/Login";
import Register from "../pages/Auth/Register";
import RecoverPassword from "../pages/Auth/RecoverPassword";
import VerifyAccount from "../pages/Auth/VerifyAccount";

const routes = [
    {   path: "/",
        element: <MainLayout />,
        children: [
            {path: "/", element: <Home />},
            {path: "home", element: <Navigate to="/" />},
            {path: "file-storage", element: <FileStorage />}
        ]
    },
    {   path: "/",
        element: <GuestLayout />,
        children: [
            {path: "login", element: <Login />},
            {path: "register", element: <Register />},
            {path: "verify", element: <VerifyAccount />},
            {path: "recover", element: <RecoverPassword />},
        ]
    }
]

export const router = createBrowserRouter ([
    {   path: "/",
        element: <App />,
        children: routes
    },
])