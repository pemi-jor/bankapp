import passport from "passport";
import passportLocal from "passport-local";
import passportJWT from "passport-jwt";
import bcrypt from "bcrypt";
import AccountModel from "./Model/accountModel.js";
import { secretOrKey, REFRESH_SECRET } from "./constants.js";

const LocalStrategy = passportLocal.Strategy;
const JWTStrategy = passportJWT.Strategy;
const { ExtractJwt } = passportJWT;

// LocalStrategy is used to check that user has provided correct password for logging in.
const localStrategy = new LocalStrategy({
    usernameField: "email",
    passwordField: "password",
}, (email, password, done) => {
    AccountModel.findOne({ email })
        .then(async (user) => {
            if (!user) return done(null, false);

            const isMatch = await bcrypt.compare(password, user.password);

            return isMatch ?
                done(null, user) :
                done(null, false);
        })
        .catch((err) => done(err));
});

// JWTStrategy is used to check that accessToken is valid and user can access resources.
// accessToken should only be exchanged with resource server.
const jwtStrategy = new JWTStrategy({
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey,
}, (payload, done) => {
    AccountModel.findById(payload.id)
        .then((user) => {
            if (user) return done(null, user);

            return done(null, false, { message: "Not authorized" });
        })
        .catch((err) => done(err));
});

// Refresh token is used to grant access tokens to resource server
// Refresh token is stored in httpOnly cookie so that client javascript cannot access it.
// When refreshi token expires, user is logged out.
// New access token and refresh token needs to be requested from authorization server.
// Refresh token  should be only exchanged with authorization server.
// https://stackoverflow.com/questions/38986005/what-is-the-purpose-of-a-refresh-token
const refreshStrategy = new JWTStrategy(
    {
        jwtFromRequest: (req) => req.cookies.refreshToken,
        secretOrKey: REFRESH_SECRET,
    }, (payload, done) => {
        // eslint-disable-next-line
        AccountModel.findById(payload.id)
            .then((user) => {
                if (user) return done(null, user);

                return done(null, false, { message: "Not authorized" });
            })
            .catch((err) => done(err));
    },
);

export const checkRefreshtoken = (req, res) => new Promise((resolve, reject) => passport
    .authenticate("refresh", { session: false }, (err, user) => {
        if (!user) reject(new Error("User not found"));
        if (err) reject(err);
        resolve(user);
    })(req, res));

export const authenticate = (req, res) => new Promise((resolve, reject) => {
    passport.authenticate("local", { session: false }, (err, user) => {
        if (!user) reject(new Error("Wrong username or password!"));

        if (err) reject(err);
        if (user) resolve(user);
    })(req, res);
});

export const setupAuthenticationStrategies = () => {
    passport.initialize();
    passport.use(localStrategy);
    passport.use(jwtStrategy);
    passport.use("refresh", refreshStrategy);
};
