import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";
/*
import bankRouter from "./router/bankRouter.js";
import refresh from "./router/refreshTokenRouter.js";
import LogginRouter from "./router/loginRouter.js";
*/
import appRouter from "./router/routes.js";
import { setupAuthenticationStrategies } from "./authentication.js";
import { PORT, DB_URL } from "./constants.js";

const app = express();

app.use((req, res, next) => {
    console.log(`METHOD: ${req.method}`);
    console.log(`PATH: ${req.path}`);
    console.log(`BODY: ${req.body}`);
    console.log(`Params: ${req.params}`);
    console.log(`QUERY: ${req.query}`);
    console.log("----");
    next();
});

if (process.env.NODE_ENV !== "production") {
    app.use(cors({
        origin: "http://localhost:3000",
        credentials: true,
        methods: "GET, PUT, POST, DELETE",
    }));
} // Needed for development use for production set allowed origins and methods.

app.use(cookieParser());
app.use(express.urlencoded({
    extended: true,
}));

const connection = async () => {
    await mongoose.connect(
        DB_URL,
        { useNewUrlParser: true, useUnifiedTopology: true },
    );
};

mongoose.set("useFindAndModify", false);

connection();
app.use(express.json());

app.use("/api", appRouter);
/*
app.use("/bank", bankRouter);
app.use("/log", LogginRouter);
app.use("/refreshToken", refresh);
*/
setupAuthenticationStrategies();
app.listen(PORT, () => {
    console.log("listening to port 5000");
});
