import { createBrowserRouter, Navigate } from "react-router-dom";
import App from "../App";

import MainLayout from "../pages/layout/MainLayout";
import Home from "../pages/Main/Home" ;
// import FileStorage from "../pages/Main/FileStorage";
import Document from "../pages/Main/Document/Document";
import Excel from "../pages/Main/Document/Excel";
import Note from "../pages/Main/Document/Note";
import Presentation from "../pages/Main/Document/Presentation";
import AccountList from "../pages/Main/Account/AccountList";
import TeamWork from "../pages/Main/Account/TeamWork";


import GuestLayout from "../pages/layout/GuestLayout";
import Login from "../pages/Auth/Login";
import Register from "../pages/Auth/Register";
import RecoverPassword from "../pages/Auth/RecoverPassword";
import VerifyAccount from "../pages/Auth/VerifyAccount";

import ErrorPages from "../pages/ErrorPages";
import Meeting from "../pages/Main/Account/Meeting";
import Setting from "../pages/Main/Setting";

const routes = [
    {   path: "/",
        element: <MainLayout />,
        children: [
            {path: "/", element: <Home />},
            {path: "home", element: <Navigate to="/" />},
            {path: "doc", element: <Document />},
            {path: "excel", element: <Excel />},
            {path: "present", element: <Presentation />},
            {path: "note", element: <Note />},
            
            {path: "account", element: <AccountList />},
            {path: "team", element: <TeamWork />},
            {path: "meeting", element: <Meeting />},
            
            {path: "setting", element: <Setting />},
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
    },
    {
        path: "*",
        element: <ErrorPages />
    }
]

export const router = createBrowserRouter ([
    {   path: "/",
        element: <App />,
        children: routes
    },
])