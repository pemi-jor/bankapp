import { Router } from "express";
import refreshTokenHandler from "../Controller/refreshTokenController.js";

const refresh = Router();
refresh.get("", refreshTokenHandler);

export default refresh;
