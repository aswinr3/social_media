import mainRouter from './MainRouter'
import authRouter from './authRouter'
import { createBrowserRouter, type RouteObject } from 'react-router-dom'

const routes: RouteObject[] = [authRouter, mainRouter]
const Router = createBrowserRouter(routes)

export default Router