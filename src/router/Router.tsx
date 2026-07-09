import { createBrowserRouter, Navigate } from "react-router-dom";
import App from "../App";

import MainLayout from "../pages/layout/MainLayout";
import Home from "../pages/Main/Home" ;
import PDF from "../pages/Main/Document/PDF";
import Word from "../pages/Main/Document/Word";
import Excel from "../pages/Main/Document/Excel";
import Media from "../pages/Main/Document/Media";
import Zip from "../pages/Main/Document/Zip";
import Note from "../pages/Main/Document/Note";
import Different from "../pages/Main/Document/Different";

import TeamWork from "../pages/Main/Account/TeamWork";
import Meeting from "../pages/Main/Account/Meeting";

import GuestLayout from "../pages/layout/GuestLayout";
import Login from "../pages/Auth/Login";
import Register from "../pages/Auth/Register";
import RecoverPassword from "../pages/Auth/RecoverPassword";
import VerifyAccount from "../pages/Auth/VerifyAccount";

import ErrorPages from "../pages/ErrorPages";
import AccountList from "../pages/Main/AccountList";
import Setting from "../pages/Main/Setting";
import Help from "../pages/Main/Help";
import TeamInfo from "../pages/Main/Account/TeamInfo";
import MeetingInfo from "../pages/Main/Account/MeetingInfo";


const routes = [
    {   path: "/",
        element: <MainLayout />,
        children: [
            {path: "/", element: <Home />},
            {path: "home",      element: <Navigate to="/" />},
            {path: "pdf",       element: <PDF />},
            {path: "word",      element: <Word />},
            {path: "excel",     element: <Excel />},
            {path: "media",     element: <Media />},
            {path: "zip",       element: <Zip />},
            {path: "note",      element: <Note />},
            {path: "different", element: <Different />},
            
            {path: "team",      element: <TeamWork />},
            {path: "team-info", element: <TeamInfo />},

            {path: "meeting",   element: <Meeting />},
            {path: "meeting-info", element: <MeetingInfo />},
            
            {path: "account",   element: <AccountList />},
            
            {path: "setting",   element: <Setting />},
            {path: "help",      element: <Help />},
        ]
    },
    {   path: "/",
        element: <GuestLayout />,
        children: [
            {path: "login",     element: <Login />},
            {path: "register",  element: <Register />},
            {path: "verify",    element: <VerifyAccount />},
            {path: "recover",   element: <RecoverPassword />},
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