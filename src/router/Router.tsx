import { createBrowserRouter, Navigate } from "react-router-dom";
import App from "../App";

import MainLayout from "../pages/layout/MainLayout";
import Home from "../pages/Main/Home" ;
import Document from "../pages/Main/Document/Document";
import Word from "../pages/Main/Document/Word";
import Excel from "../pages/Main/Document/Excel";
import Presentation from "../pages/Main/Document/Presentation";
import Note from "../pages/Main/Document/Note";

import TeamWork from "../pages/Main/Account/TeamWork";
import Meeting from "../pages/Main/Account/Meeting";

import GuestLayout from "../pages/layout/GuestLayout";
import Login from "../pages/Auth/Login";
import Register from "../pages/Auth/Register";
import RecoverPassword from "../pages/Auth/RecoverPassword";
import VerifyAccount from "../pages/Auth/VerifyAccount";

import ErrorPages from "../pages/ErrorPages";
import AccountList from "../pages/Main/Account/AccountList";
import Setting from "../pages/Main/Setting";
import Help from "../pages/Main/Help";


const routes = [
    {   path: "/",
        element: <MainLayout />,
        children: [
            {path: "/", element: <Home />},
            {path: "home", element: <Navigate to="/" />},
            {path: "doc", element: <Document />},
            {path: "word", element: <Word />},
            {path: "excel", element: <Excel />},
            {path: "present", element: <Presentation />},
            {path: "note", element: <Note />},
            
            {path: "account", element: <AccountList />},
            {path: "team", element: <TeamWork />},
            {path: "meeting", element: <Meeting />},
            
            {path: "setting", element: <Setting />},
            {path: "help", element: <Help />},
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
    }
])