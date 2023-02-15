import jwt from "jsonwebtoken";
import { AT_EXPIRATION_TIME, REFRESH_SECRET, RT_EXPIRATION_TIME } from "../constants.js";
import { authenticate, checkRefreshtoken } from "../authentication.js";

const setRefreshCookie = (res, refreshToken) => (
    res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        path: "/api/",
    }));

const createToken = (user) => ({
    token: jwt.sign({ id: user.id }, process.env.SECRET_KEY || "SECRET_KEY", {
        expiresIn: AT_EXPIRATION_TIME,
    }),
    refreshToken: jwt.sign({ id: user.id }, REFRESH_SECRET, {
        expiresIn: RT_EXPIRATION_TIME,
    }),
    id: user.id,
});

export const loginHandler = async (req, res) => authenticate(req, res)
    .then((user) => (user ?
        createToken(user) :
        { token: null, refreshToken: null }))
    .then((tokens) => (tokens.refreshToken ?
        setRefreshCookie(res, tokens.refreshToken)
            .status(200)
            .json({ user: { id: tokens.id }, token: tokens.token }) :
        res.status(403).send("Unauthorized")))
    .catch((err) => (res.status(500).send(err.message)));

export const logoutHandler = async (req, res) => (
    checkRefreshtoken(req, res).then(() => {
        req.logout();
        return res
            .clearCookie("refreshToken", { path: "/bank/" })
            .status(200)
            .send("Logged out");
    })).catch((err) => res.status(500).send(err.message));
