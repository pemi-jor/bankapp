import express from "express";
import passport from "passport";
import {
    newaccount,
    getBalance,
    getfundrequests,
    updateaccount,
    withdrawSum,
    depositSum,
    transferSum,
    requestFunds,
    acceptFundRequest,
    // deleteuser,
} from "../Controller/accountController.js";

const bankRouter = express.Router();

bankRouter.post("/user", newaccount);
bankRouter.post(
    "/:user_id/requestfunds",
    passport.authenticate("jwt", { session: false }),
    requestFunds,
);
bankRouter.get(
    "/:user_id/balance",
    passport.authenticate("jwt", { session: false }),
    getBalance,
);
bankRouter.get(
    "/:user_id/fundrequests",
    passport.authenticate("jwt", { session: false }),
    getfundrequests,
);
bankRouter.put(
    "/:user_id/withdraw",
    passport.authenticate("jwt", { session: false }),
    withdrawSum,
);
bankRouter.put(
    "/:user_id/deposit",
    passport.authenticate("jwt", { session: false }),
    depositSum,
);
bankRouter.put(
    "/:user_id/transfer",
    passport.authenticate("jwt", { session: false }),
    transferSum,
);
bankRouter.put(
    "/:user_id/name",
    passport.authenticate("jwt", { session: false }),
    updateaccount,
);
bankRouter.put(
    "/:user_id/password",
    passport.authenticate("jwt", { session: false }),
    updateaccount,
);
bankRouter.put(
    "/:user_id/acceptfundrequest",
    passport.authenticate("jwt", { session: false }),
    acceptFundRequest,
);
// router.delete("/:user_id/delete", deleteuser);

export default bankRouter;
