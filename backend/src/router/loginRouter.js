import { Router } from "express";
import { loginHandler } from "../Controller/loginController.js";

export default () => {
    const router = Router();
    router.post("/", loginHandler);
    return router;
};
