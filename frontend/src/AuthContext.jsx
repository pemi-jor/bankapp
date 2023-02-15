import {createContext, useContext} from "react";
import {API_URL} from "./constants.js";
import axios from "axios";

const login = (email, password) => {
    const options = {
        method: "POST",
        url: `${API_URL}login`,
        headers: {
            "Content-Type": "application/json",
        },
        withCredentials: true,
        data: {
            email,
            password
        }
    }
    return axios(options);
};

const logout = (token, refreshInterval) => {
    if (refreshInterval) {
        clearInterval(refreshInterval)
    }
    if (token) {
        const options = {
            method: "POST",
            url: `${API_URL}logout`,
            withCredentials: true
        }
        return axios(options);
    }

    return Promise.resolve();
};

const refreshToken = () =>
    axios.get(`${API_URL}refreshToken`, {
        withCredentials: true
    }).then(response => {
        if (response.status === 200) {
            return response.data
        }
        throw new Error("Couldn't refresh token");
    });

const AuthContext = createContext({
    authenticated: false,
    login,
    logout,
    refreshToken,
    token: null,
    user: null
});

export const useAuthContext = () => useContext(AuthContext);
export default AuthContext;
