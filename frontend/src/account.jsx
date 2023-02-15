import {useEffect, useState} from "react";
import axios from "axios";
import {API_URL} from "./constants";
import "./account.css";
import { loadAccessTokenFromLocalStorage, loadUserIdFromLocalStorage } from './utils';

const Account = (props) => {
    const [deposit, setDeposit] = useState(0);
    const [withdraw, setWithdraw] = useState(0);
    const [transfer, setTransfer] = useState(0);
    const [transferEmail, setTransferEmail] = useState("");
    const [cantTransfer, setCantTransfer] = useState(true);
    const [cantWithdraw, setCantWithdraw] = useState(true);
    const [cantDeposit, setCantDeposit] = useState(true);
    const [cantUpdate, setCantUpdate] = useState(true);
    const [error, setError] = useState("");
    const [current, setCurrent] = useState({name: "", balance: 0});
    const [updateForm, setupdateForm] = useState({name: "", newpassword: "", password: ""});
    
    const { refreshAccount } = props;
    const getid = () => {
        return loadUserIdFromLocalStorage();
    };
    
    const setConfig = () => {
        return {
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${loadAccessTokenFromLocalStorage()}`
            },
            withCredentials: true
        };
    };

    // TODO: add Regex for value checks
    const changedDeposit = (e) => {
        setDeposit(e.target.value);
    };
    const changedWithdraw = (e) => {
        setWithdraw(e.target.value);
    };
    const changedTransfer = (e) => {
        setTransfer(e.target.value);
    };
    const changedTransferEmail = (e) => {
        setTransferEmail(e.target.value);
    };
    const checkName = (e) => {
        setupdateForm({ ...updateForm, name: updateForm.name + e.target.value, });
    };
    const checkPassword = (e) => {
        setupdateForm({ ...updateForm, password: updateForm.password + e.target.value});
    };
    const checkNewPassword = (e) => {
        setupdateForm({ ...updateForm, newpassword: updateForm.newpassword + e.target.value});
    };
    
    const submitDeposit = async (e) => {
        e.preventDefault();
        const axiosConfig = setConfig();
        const userid = getid();
        const submitData = {
            amount: deposit,
        };
        console.log(`Config: ${axiosConfig} uuserid ${userid} data ${submitData}`);
        
        const resp = await axios.put(`${API_URL}bank/${userid}/deposit`,
        submitData, axiosConfig);
        
        if (resp.err) setError(resp.err);
        else {
            setError("");
            setCurrent({...current, name: resp.data.name, balance: resp.data.balance});
        }
        setDeposit(0);
        /* */
    };
    const submitWithdraw = async (e) => {
        e.preventDefault();
        const axiosConfig = setConfig();
        const userid = getid();
        const submitData = {
            amount: withdraw,
        };
        const resp = await axios.put(`${API_URL}bank/${userid}/withdraw`,
        submitData, axiosConfig);
        if (resp.err) setError(resp.err);
        else {
            setError("");
            setCurrent({...current, name: resp.data.name, balance: resp.data.balance});
        }
        setWithdraw(0);
    };

    const submitTransfer = async (e) => {
        e.preventDefault();
        const axiosConfig = setConfig();
        const userid = getid();
        const submitData = {
            amount: transfer,
            recipient_email: transferEmail,
        };
        const resp = await axios.put(`${API_URL}bank/${userid}/transfer`,
        submitData, axiosConfig);
        if (resp.err) setError(resp.err);
        else {
            setError("");
            setCurrent({...current, name: resp.data.name, balance: resp.data.balance});
        }
        setTransfer(0);
        setTransferEmail("");
    };

    const setUpdateData = () => {
        let data = {password: updateForm.password};
        if (updateForm.name.length > 0) data = {...data, name: updateForm.name};
        if (updateForm.name.length > 0) data = {...data, newpassword: updateForm.newpassword};
        return data;
    };
    
    const updateUser = async (e) => {
        e.preventDefault();
        const axiosConfig = setConfig();
        const userid = getid();
        const submitData = setUpdateData();
        const resp = await axios.put(`${API_URL}bank/${userid}/name`,
        submitData, axiosConfig);
        if (resp.err) setError(resp.err);
        else {
            setError("");
            setCurrent({...current, name: resp.data.name, balance: resp.data.balance});
        }
        setTransfer(0);
        setTransferEmail("");
    };

    function updateCurrent(data) {
        setCurrent({...current, name: data.name, balance: data.balance});
    };
/*
*/
    useEffect(() => {
        async function getBalance () {
            // get balance
            const axiosConfig = setConfig();
            const userid = getid();
            const resp = await axios.get(`${API_URL}bank/${userid}/balance`, axiosConfig);
            if (resp.err) {
                setError(resp.err);
            } else {
                console.log(resp.data);
                updateCurrent(resp.data);
            }
        }
        getBalance();
    }, [refreshAccount]);


    useEffect(() => {
        if (deposit > 0) setCantDeposit(false);
        else setCantDeposit(true);
    }, [deposit]);
    useEffect(() => {
        if(withdraw > 0) setCantWithdraw(false);
        else setCantWithdraw(true);
    }, [withdraw]);
    useEffect(() => {
        if(transferEmail.length > 0 && transfer > 0) setCantTransfer(false);
        else setCantTransfer(true);
    }, [transfer, transferEmail]);
    useEffect(() => {
        if ((updateForm.name.length > 0 ||
            updateForm.newpassword.length > 0) &&
            updateForm.password.length > 0) setCantUpdate(false);
        else setCantUpdate(true);
    }, [updateForm]);

    return (
        <div className="account">
            <div className="witdep">
                <p>{error}</p>
                <div className="witdepContainer">
                    <div className="witdepForm">
                        <form >
                            <div className="inputfield">
                                <label>Deposit <input value={deposit} onChange={changedDeposit} min="0" type="number" /></label>
                            </div>
                            <input type="submit" disabled={cantDeposit} onClick={submitDeposit} value="Deposit" />
                        </form>
                    </div>
                    <div className="witdepForm">
                        <form onSubmit={submitWithdraw}>
                            <div className="inputfield">
                                <label>Withdraw <input value={withdraw} onChange={changedWithdraw} min="0" type="number" /></label>
                            </div>
                            <input disabled={cantWithdraw} type="submit" />
                        </form>
                    </div>
                    <div className="witdepForm">
                        <form onSubmit={submitTransfer}>
                            <div className="inputfield">
                                <label>Reciever Email <input value={transferEmail} onChange={changedTransferEmail} /></label>
                            </div>
                            <div className="inputfield">
                                <label>Transfer <input value={transfer} onChange={changedTransfer} min="0" type="number" /></label>
                            </div>
                            <input disabled={cantTransfer} type="submit" />
                        </form>
                    </div>
                </div>
            </div>
            <div className="info">
                <div>
                    {
                    //getBalance()
                }
                    <h3>Name: {current.name}</h3>
                    <p>Balance: {current.balance}</p>
                </div> 
            </div>
            <div className="updateForm">
                <h3>Update Information</h3>
                <form onSubmit={updateUser}>
                    <div className="updateFields">
                        <label>Password: <input type="password" value={updateForm.password} onChange={checkPassword} /></label>
                        <label>New Pasword: <input type="password" value={updateForm.newpassword} onChange={checkNewPassword} /></label>
                        <label>Name: <input value={updateForm.name} onChange={checkName} /></label>
                    </div>
                    <input disabled={cantUpdate} type="submit" value="Update" />
                </form>
            </div>
        </div>
    );
};

export default Account;
