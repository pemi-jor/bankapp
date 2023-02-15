import {useEffect, useState} from "react";
import axios from "axios";
import {API_URL} from "./constants";
import "./account.css";
import "./fundrequest.css";
import { loadAccessTokenFromLocalStorage, loadUserIdFromLocalStorage } from './utils';

const FundRequest = (props) => {
    const [transfer, setTransfer] = useState(0);
    const [transferEmail, setTransferEmail] = useState("");
    const [error, setError] = useState("");
    const [cantTransfer, setCantTransfer] = useState(true);
    const [fundRequestElement, setFundRequestElemet] = useState(null);
    
    const { refreshFundRequests } = props;

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

    const acceptFundRequest = async (e, id) => {
        e.preventDefault();
        const axiosConfig = setConfig();
        const userid = getid();
        const data = { recipient_id: id };
        const fundRequests = await axios.put(`${API_URL}bank/${userid}/acceptfundrequest`,
        data, axiosConfig);
        if(fundRequests.err){
            setError(fundRequests.err);
        } else {
            createFundRequests();
        }
    };

    async function createFundRequests () {
        const axiosConfig = setConfig();
        const userid = getid();
        const fundRequests = await axios.get(`${API_URL}bank/${userid}/fundrequests`, axiosConfig);

        const fundRequestMap = fundRequests.data.length > 0 ? (
                <div>
                    {fundRequests.data.map((request, i) => (
                        <div key={String(request.id) + String(i)}>
                            <form className="acceptForm" onSubmit={() => acceptFundRequest(request.id)}>
                                <label>{request.name}: {request.amount} </label>
                                <input type="submit" />
                            </form>
                            <hr />
                        </ div>
                    ))}
                </div>) : (<p>No Open Fund Requests</p>);
        setFundRequestElemet(fundRequestMap);
    };

    const changedTransfer = (e) => {
        setTransfer(e.target.value);
    };
    const changedTransferEmail = (e) => {
        setTransferEmail(e.target.value);
    };
    
    const submitRequest = async (e) => {
        e.preventDefault();
        const submitData = {
            amount: transfer,
            recipient_id: transferEmail,
        };
        const axiosConfig = setConfig();
        const userid = getid();
        const resp = await axios.post(`${API_URL}bank/${userid}/requestfunds`,
        submitData, axiosConfig);
        if (resp.err){
            setError(resp.err);
        } else {
            setError("Request sent.");
        }
    };

    useEffect(() => {
        createFundRequests();
    }, [refreshFundRequests]);

    useEffect(() => {
        if(transferEmail.length > 0 && transfer > 0) setCantTransfer(false);
        else setCantTransfer(true);
    }, [transfer, transferEmail]);
    
    return (
        <div className="account">
            <div className="witdep">
                <p>{error}</p>
                <div className="witdepForm">
                    <form onSubmit={submitRequest}>
                        <div className="inputfield">
                            <label>Reciever Email <input onChange={changedTransferEmail}  /></label>
                        </div>
                        <div className="inputfield">
                            <label>Transfer <input onChange={changedTransfer} min="0" type="number" /></label>
                        </div>
                        <input disabled={cantTransfer} type="submit" />
                    </form>
                </div>
            </div>
            <div className="info">
                {fundRequestElement}
            </div>
            
        </div>
    );
};

export default FundRequest;
