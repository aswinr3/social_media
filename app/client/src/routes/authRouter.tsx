import Register from "../pages/Register";
import type { RouteObject } from "react-router-dom";



const authRouter: RouteObject = {
    path: "/",
    element: <Register />
}

export default authRouter;