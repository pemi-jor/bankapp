import { Router } from "express";
import loginRoutes from "./loginRouter.js";
// import userRoutes from "./userRoutes.js";
import refreshTokenHandler from "../Controller/refreshTokenController.js";
import { logoutHandler } from "../Controller/loginController.js";
import bankRouter from "./bankRouter.js";

const router = Router();
router.use("/login", loginRoutes());
// router.use("/user", userRoutes());
router.use("/bank", bankRouter);
router.use("/logout", logoutHandler);
router.get("/refreshToken", refreshTokenHandler);

export default router;
