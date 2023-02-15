import jwt from "jsonwebtoken";
import { secretOrKey } from "../constants.js";
import { checkRefreshtoken } from "../authentication.js";

export default (req, res) => (
    checkRefreshtoken(req, res).then((user) => {
        const token = jwt.sign({ id: user.id }, secretOrKey || "SECRET_KEY");
        return res.status(200).json(token);
    })).catch(() => res.status(500).send("Something went wrong refreshing token"));
