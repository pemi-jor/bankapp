import bcrypt from "bcrypt";
import AccountModel from "../Model/accountModel.js";

const SALT_WORK_FACTOR = 5;

/*
const newID = async () => {
    const maxid = await AccountModel.find().limit(1).sort("-id");
    if (maxid[0]) return maxid[0].id + 1;
    return 1;
};
*/

export const newaccount = async (req, res) => {
    const {
        name,
        email: em,
        password: pass,
        deposit,
    } = req.body;

    if (!(name) || !(em) || !(deposit) || !(pass)) {
        res.json({ err: `name: ${name} balance: ${deposit} password: ${pass}` });
    }

    const check = await AccountModel.findOne({ email: em });
    if (check) {
        console.log(check);
        res.json({ err: "Account with given email already exists." });
        return;
    }

    if (Number(deposit) >= 10) {
        const dep = parseInt(deposit, 10);
        const fundrequests = [];

        const salt = await bcrypt.genSaltSync(SALT_WORK_FACTOR);
        const hash = await bcrypt.hashSync(pass, salt);
        const user = {
            name,
            email: em,
            password: hash,
            balance: dep,
            fundrequests,
        };
        const userData = new AccountModel(user);
        await userData.save();
        res.json(user.id);
    } else {
        res.json({ err: "Deposit needs to be at least 10" });
    }
};

const updateBalance = async (bal, userid) => {
    console.log(`Bal: ${bal} ID: ${userid}`);
    const user = await AccountModel.findOneAndUpdate(
        { _id: userid },
        { balance: bal },
        { new: true },
    ).exec();
    return user;
};

export const getBalance = async (req, res) => {
    const user = await AccountModel.findOne({ _id: req.params.user_id });

    if (user) {
        res.json({
            balance: user.balance,
            name: user.name,
        });
    } else {
        res.status(404).end();
    }
};

export const getfundrequests = async (req, res) => {
    const user = await AccountModel.findOne({ _id: req.params.user_id });
    if (user) {
        const requestWithNames = await Promise.all(user.fund_requests.map(async (request) => {
            const requestUser = await AccountModel.findOne({ _id: request.userID });
            return { ...request, name: requestUser.name };
        }));
        res.json(requestWithNames);
    } else {
        res.status(404).end();
    }
};

export const depositSum = async (req, res) => {
    const { amount } = req.body;
    if (!(amount) || !(req.params.user_id)) {
        res.json({ err: "You need to give user id, deposit amount and password" });
        return;
    }

    const user = await AccountModel.findOne({ _id: req.params.user_id });

    if (user) {
        if (parseInt(amount, 10) > 0) {
            const newBalance = user.balance + parseInt(amount, 10);
            const updated = await updateBalance(newBalance, user.id);

            if (updated) {
                res.json({
                    balance: updated.balance,
                    name: updated.name,
                });
            } else {
                console.log(`Updated: ${updated}`);
                res.status(400).end();
            }
        } else {
            res.json({ err: "Amount needs to be more than 0." });
        }
    } else {
        res.status(404).end();
    }
};

export const withdrawSum = async (req, res) => {
    const { amount } = req.body;
    if (!(amount) || !(req.params.user_id)) {
        res.json({ err: "You need to give user id, deposit amount and password" });
        return;
    }
    const user = await AccountModel.findById(req.params.user_id);

    if (user) {
        if (user.balance > parseInt(amount, 10)) {
            const newBalance = user.balance - parseInt(amount, 10);
            const updated = await updateBalance(newBalance, user.id);
            if (updated) {
                res.json({
                    balance: updated.balance,
                    name: updated.name,
                });
            } else res.status(404).end();
        } else {
            res.json({ err: `User: ${user.id} doesn't have enought funds` });
        }
    } else {
        res.status(404).end();
    }
};

export const transferSum = async (req, res) => {
    const { amount, recipient_email: remail } = req.body;
    if (!(amount) || !(remail) || !(req.params.user_id)) {
        res.json({ err: "You need to give user id, recipient id, deposit amount and password" });
        return;
    }
    const user = await AccountModel.findOne({ _id: req.params.user_id });

    const userToTransfer = await AccountModel.findOne({ email: remail });
    if (user && userToTransfer) {
        if (user.balance >= parseInt(amount, 10)) {
            user.balance -= parseInt(amount, 10);
            userToTransfer.balance += parseInt(amount, 10);
            await user.save();
            await userToTransfer.save();

            res.json({
                balance: user.balance,
                name: user.name,
            });
        } else {
            res.json({ err: `User: ${user.id} doesn't have enought funds` });
        }
    } else {
        res.status(404).end();
    }
};

export const requestFunds = async (req, res) => {
    const { amount, recipient_id: recipientid } = req.body;
    if (!(amount) || !(recipientid) || !(req.params.user_id)) {
        res.json({ err: "You need to give user id, recipient id, deposit amount and password" });
        return;
    }
    const user = await AccountModel.findOne({ _id: req.params.user_id });

    const userToRequest = await AccountModel.findOne({ email: recipientid });
    if (user && userToRequest) {
        if (parseInt(amount, 10) > 0) {
            let maxID = 1;
            if (userToRequest.fund_requests.length > 0) {
                const ids = userToRequest.fund_requests.map((x) => x.id);
                maxID = ids.reduce((arr, cur) => Math.max(arr, cur));
                maxID += 1;
            }
            const fundObj = { id: maxID, userID: user.id, amount: parseInt(amount, 10) };
            userToRequest.fund_requests = [...userToRequest.fund_requests, fundObj];
            await userToRequest.save();
            res.json(fundObj.id);
        } else {
            res.json({ err: "Amount is too small" });
        }
    } else {
        res.status(404).end();
    }
};

export const acceptFundRequest = async (req, res) => {
    const { recipient_id: recipientid } = req.body;
    if (!(recipientid) || !(req.params.user_id)) {
        res.json({ err: "You need to give user id, recipient id and password" });
        return;
    }
    const user = await AccountModel.findOne({ _id: req.params.user_id });
    const request = user.fund_requests.find((x) => x.id === parseInt(recipientid, 10));

    const userToTransfer = await AccountModel.findOne({ _id: request.userID });
    if (user && userToTransfer && request) {
        if (user.balance >= parseInt(request.amount, 10)) {
            user.balance -= parseInt(request.amount, 10);
            userToTransfer.balance += parseInt(request.amount, 10);
            const newFundRequests = user.fund_requests.filter((item) => item.id !== request.id);
            user.fund_requests = newFundRequests;
            await user.save();
            await userToTransfer.save();
            res.json(user.fund_requests);
        } else {
            res.json({ err: `${user.name} doesn't have enought funds` });
        }
    } else {
        res.status(404).end();
    }
};

export const updateaccount = async (req, res) => {
    const { name, newpassword } = req.body;
    const user = await AccountModel.findOne({ _id: req.params.user_id });

    if (user) {
        if (name) user.name = req.body.name;
        if (newpassword) {
            const salt = await bcrypt.genSaltSync(SALT_WORK_FACTOR);
            const hash = await bcrypt.hashSync(newpassword, salt);
            user.password = hash;
        }
        if (name || newpassword) {
            user.save();
            res.json(user);
        }
    } else {
        res.status(404).end();
    }
};

export const deleteuser = async (req, res) => {
    const user = await AccountModel.findOne({ _id: req.params.id });
    if (user) {
        user.remove().then((resu) => {
            res.json(resu);
        }).catch((err) => {
            res.json(err);
        });
    } else {
        res.status(404).end();
    }
};
