import router, { Router } from "express"
import registerUser from "../controllers/user.controller.js"

const routers = Router()
routers.route("/register").post(registerUser)
// router.router("/login").post(loginUser)

export default router