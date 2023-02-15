import * as fs from "fs";
// New Express
import express from "express";
import * as bodyParser from "body-parser";

const userdataloc = "./src/user_data.json";

const getAllUsers = () => {
    const readfile = fs.readFileSync(userdataloc);
    if (readfile.length !== 0) {
        const jsonObject = JSON.parse(readfile);
        return jsonObject;
    }
    return [];
};

let loggedUser = null;
let allUsers = getAllUsers();

const addUser = (user) => {
    const readfile = fs.readFileSync(userdataloc);
    if (readfile.length !== 0) {
        allUsers = JSON.parse(readfile);
        allUsers = [
            ...allUsers,
            user,
        ];
    } else {
        allUsers = [
            user,
        ];
    }
    fs.writeFileSync(userdataloc,
        JSON.stringify(allUsers),
        (err) => {
            if (err) console.log(err);
            else console.log("Success");
        });
    if (loggedUser !== null) {
        loggedUser = allUsers.find((x) => x.id === parseInt(loggedUser.id, 10));
    }
};

const updateUser = (user) => {
    const readfile = fs.readFileSync(userdataloc);
    if (readfile.length !== 0) {
        allUsers = JSON.parse(readfile);
        const i = allUsers.findIndex((x) => x.id === user.id);
        allUsers[i] = user;
    } else {
        allUsers = [
            user,
        ];
    }
    fs.writeFileSync(userdataloc,
        JSON.stringify(allUsers),
        (err) => {
            if (err) console.log(err);
            else console.log("Success");
        });
    if (loggedUser !== null) {
        loggedUser = allUsers.find((x) => x.id === parseInt(loggedUser.id, 10));
    }
};

const generateID = () => {
    const readfile = fs.readFileSync(userdataloc);
    if (readfile.length !== 0) {
        const jsonObject = JSON.parse(readfile);
        const ids = jsonObject.map((x) => x.id);
        const maxID = ids.reduce((arr, cur) => Math.max(arr, cur));
        return maxID + 1;
    }

    return 1;
};

const validateNewUser = (user) => {
    if (user.balance < 10) return { err: "Deposit needs to be at least 10" };
    if (user.password.length === 0) return { err: "Password can't be empty" };
    if (user.name.length === 0) return { err: "Name can't be empty" };
    return null;
};

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.post("/bank/user", (req, res) => {
    if (req.body.name && req.body.password && req.body.deposit) {
        // console.log(req.body);
        const user = {
            name: req.body.name,
            password: req.body.password,
            id: generateID(),
            balance: req.body.deposit,
            fund_requests: [],
        };
        const valitated = validateNewUser(user);
        if (valitated === null) {
            addUser(user);
            res.json({ id: user.id });
        } else res.json(valitated);
    } else {
        res.json({
            err: "You need to provide password, username, start deposit and email address.",
        });
    }
});

app.get("/bank/:user_id/balance", (req, res) => {
    if (req.params.user_id && req.body.password) {
        allUsers = getAllUsers();
        const user = allUsers.find((x) => x.id === parseInt(req.params.user_id, 10) &&
        x.password === req.body.password);
        if (user) res.send({ balance: user.balance });
        else res.json({ err: "Invalid ID or password" });
    } else res.json({ err: "You need to give user id and password" });
});

app.put("/bank/:user_id/withdraw", (req, res) => {
    if (req.params.user_id && req.body.password && req.body.amount) {
        allUsers = getAllUsers();
        const user = allUsers.find((x) => x.id === parseInt(req.params.user_id, 10) &&
        x.password === req.body.password);
        if (user) {
            if (user.balance >= req.body.amount) {
                user.balance -= req.body.amount;
                updateUser(user);
                res.json({ balance: user.balance });
            } else res.json({ err: `User: ${req.params.id} doesn't have enought funds` });
        } else res.json({ err: "Invalid ID or password" });
    } else res.json({ err: "You need to give user id, withdraw amount and password" });
});

app.put("/bank/:user_id/deposit", (req, res) => {
    if (req.params.user_id && req.body.password && req.body.amount) {
        allUsers = getAllUsers();
        const user = allUsers.find((x) => x.id === parseInt(req.params.user_id, 10) &&
        x.password === req.body.password);
        if (user) {
            if (req.body.amount > 0) {
                user.balance += req.body.amount;
                updateUser(user);
                res.json({ balance: user.balance });
            } else res.json({ err: `User: ${req.params.id} doesn't have enought funds` });
        } else res.json({ err: "Invalid ID or password" });
    } else res.json({ err: "You need to give user id, deposit amount and password" });
});

app.put("/bank/:user_id/transfer", (req, res) => {
    if (req.params.user_id && req.body.password && req.body.amount && req.body.recipient_id) {
        allUsers = getAllUsers();
        const user = allUsers.find((x) => x.id === parseInt(req.params.user_id, 10) &&
        x.password === req.body.password);
        const userToTransfer = allUsers.find((x) => x.id === parseInt(req.body.recipient_id, 10));
        if (user && userToTransfer) {
            if (req.body.amount > 0 && user.balance >= req.body.amount) {
                user.balance -= req.body.amount;
                userToTransfer.balance += req.body.amount;
                updateUser(user);
                updateUser(userToTransfer);
                res.json({ balance: user.balance });
            } else {
                res.json({
                    err: `User: ${req.params.id} doesn't have enought funds or amount is too small`,
                });
            }
        } else res.json({ err: "Invalid password, ID or recipient ID" });
    } else res.json({ err: "You need to give user id, transfer amount and password" });
});

app.put("/bank/:user_id/name", (req, res) => {
    if (req.params.user_id && req.body.password && req.body.new_name) {
        allUsers = getAllUsers();
        const user = allUsers.find((x) => x.id === parseInt(req.params.user_id, 10) &&
        x.password === req.body.password);
        if (user) {
            if (req.body.new_name.length > 0) {
                user.name = req.body.new_name;
                updateUser(user);
                res.json({ name: user.name });
            } else res.json({ err: `User: ${req.params.id} doesn't have enought funds` });
        } else res.json({ err: "Invalid ID or password" });
    } else res.json({ err: "You need to give user id, new name and password" });
});

app.put("/bank/:user_id/password", (req, res) => {
    if (req.params.user_id && req.body.password && req.body.new_password) {
        allUsers = getAllUsers();
        const user = allUsers.find((x) => x.id === parseInt(req.params.user_id, 10) &&
        x.password === req.body.password);
        if (user) {
            if (req.body.password !== req.body.new_password) {
                user.password = req.body.new_password;
                updateUser(user);
                res.json({ password: user.password });
            } else res.json({ err: `User: ${req.params.id} didn't provide new password` });
        } else res.json({ err: "Invalid ID or password" });
    } else res.json({ err: "You need to give user id, password and new password" });
});

app.listen(5000);
