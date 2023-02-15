import React, {useState} from "react";
import Modal from "react-modal";
import "./login.css";
import { saveAccessTokenToLocalStorage, saveUserIdToLocalStorage } from "../utils";

// Make sure to bind modal to your appElement (http://reactcommunity.org/react-modal/accessibility/)
Modal.setAppElement('#root')

const Login = (props) => {
    const {
        login,
        setToken,
        setVisibleModal,
        visible,
        setRedirectToPage
    } = props;
    const [formData, setFormData] = useState({
        email: "",
        password: ""
    })
    
    const onLoginClick = async (event) => {
        event.preventDefault();
        return login(formData.email, formData.password)
            .then(response => {
                console.log(response)
                if (response.status === 200) { //successful login!
                    setVisibleModal(null);
                    return response.data;
                }
                return null;
            })
            .then(data => {
                console.log(data)
                if (data && data.token) {
                    saveAccessTokenToLocalStorage(data.token);
                    saveUserIdToLocalStorage(data.user.id);
                    setToken(data.token);
                    setRedirectToPage("account");
                }
            })
            .catch(err => {
                console.log(err);
            })
    }

    const onEmailChange = (event) => {
        setFormData({...formData, email: event.target.value})
    }

    const onPasswordChange= (event) => {
        setFormData({...formData, password: event.target.value})
    }

    return (
        <Modal
            isOpen={visible}
            className="LoginSignupModal"
            onRequestClose={()=>setVisibleModal(null)}
            contentLabel="Login Modal"
        >
            <div className="Login">
                <h2>Login</h2>
                <form onSubmit={onLoginClick}>
                    <div>
                        <label>Email:</label>
                        <input type="text" id="email" name="email" onChange={onEmailChange} />
                    </div>  
                    <div>
                        <label>Password:</label>
                        <input type="password" id="password" name="password" onChange={onPasswordChange} />
                    </div>
                    <div>
                        <input type="submit" />
                    </div>
                </form>
            </div>
        </Modal>
    )
}

export default Login;
