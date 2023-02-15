import React, { useState } from "react";
import Modal from "react-modal";
import axios from "axios";
import "./login.css";
import { API_URL } from "../constants";

// Make sure to bind modal to your appElement (http://reactcommunity.org/react-modal/accessibility/)
Modal.setAppElement('#root')

//export type LoginFn = (email: string, password: string) => Promise<Response>;
const signup = (name, email, password, deposit) => {
    const options = {
        url: `${API_URL}bank/user/`,
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        withCredentials: true,
        data: { 
            name,
            email,
            password,
            deposit
        }
    }
    return axios(options)
};

const Signup = (props) => {
    const { visible, setVisibleModal, setRedirectToPage } = props;
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        deposit: 0
    })

    const onSignupClick = async (event) => {
        event.preventDefault();
        return signup(formData.name, formData.email, formData.password, formData.deposit)
            .then(response => {
                console.log(response)
                if (response.status === 200) { //successful login!
                    setVisibleModal(null);
                    setRedirectToPage("");
                    return response.data;
                }

                return null;
            })
            .then(data => {
                console.log(data)
            })
            .catch(err => {
                console.log(err);
            })
    }

    const onNameChange = (event) => {
        setFormData({ ...formData, name: event.target.value })
    }

    const onEmailChange = (event) => {
        setFormData({ ...formData, email: event.target.value })
    }

    const onPasswordChange = (event) => {
        setFormData({ ...formData, password: event.target.value })
    }

    const onDepositChange = (event) => {
        setFormData({ ...formData, deposit: event.target.value })
    }

    return (
        <Modal
            isOpen={visible}
            className="LoginSignupModal"
            onRequestClose={() => setVisibleModal(null)}
            contentLabel="Login Modal"
        >
            <div className="Login">
                <h2>Signup</h2>
                <form onSubmit={onSignupClick}>
                    <div>
                        <label>Name:</label>
                        <input type="text" id="name" name="name" onChange={onNameChange} />
                    </div>
                    <div>
                        <label>Email:</label>
                        <input type="text" id="email" name="email" onChange={onEmailChange} />
                    </div>
                    <div>
                        <label>Password:</label>
                        <input type="password" id="password" name="password" onChange={onPasswordChange} />
                    </div>
                    <div>
                        <label>Deposit:</label>
                        <input type="number" min="10" id="deposit" name="deposit" onChange={onDepositChange} />
                    </div>
                    <div>
                        <input type="submit" />
                    </div>
                </form>
            </div>
        </Modal>
    )
}

export default Signup;
