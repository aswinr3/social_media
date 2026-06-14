import express from 'express';
import { validateLogin } from '../schemas/Login.js';
import login_controllers from '../controllers/Login.js';

const loginRouter = express.Router()

loginRouter.post("/", validateLogin, login_controllers.verifyLogin)

export default loginRouter

