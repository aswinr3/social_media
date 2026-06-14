import Login from "../pages/Login";
import MainLayout from "../layout/MainLayout";
import DashBoard from "../pages/DashBoard";
import Profile from '../pages/Profile'
import Chat from '../pages/Chat'
import CreatePost from '../pages/CreatePost'
import Notification from "../pages/Notification";
import type { RouteObject } from "react-router-dom";


const mainRouter: RouteObject = {
    path: "/",
    element: <MainLayout />,
    children: [
        {
            path: '/login',
            element: <Login />,

        },
        {
            path: '/dashboard',
            element: <DashBoard />,

        },
        {
            path: '/profile',
            element: <Profile />,

        },
        {
            path: '/profile/:id',
            element: <Profile />,
        },
        {
            path: '/chat',
            element: <Chat />,
        },
        {
            path: '/post',
            element: <CreatePost />,
        },
        {
            path: '/notification',
            element: <Notification />,
            
        }

    ]

}

export default mainRouter;