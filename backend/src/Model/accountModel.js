import mongoose from "mongoose";

const accountSchema = new mongoose.Schema({
    email: { type: String, unique: true },
    name: String,
    password: String,
    balance: Number,
    fund_requests: Array,
});

const AccountModel = mongoose.model("user", accountSchema);

export default AccountModel;
