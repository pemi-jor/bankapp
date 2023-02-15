import React, {useState, useEffect, useMemo} from 'react';
import axios from "axios";
import AuthContext, {useAuthContext} from './AuthContext';
import {API_URL} from './constants';
import jwt from "jsonwebtoken";
import {saveAccessTokenToLocalStorage, removeAccessTokenFromLocalStorage, loadAccessTokenFromLocalStorage, loadUserIdFromLocalStorage, removeUserIdFromLocalStorage} from './utils';
import App from "./App";

const fetchProfile = async (id) => axios.get(`${API_URL}bank/${id}/balance`, {
    headers: {
        "Authorization": `Bearer ${loadAccessTokenFromLocalStorage()}`
    },
    withCredentials: true
})
    .then(response => response.status === 200 ? response.data : null)
    .catch(err => console.log(err));

const AuthHandler = () => {
    const {login, logout, refreshToken} = useAuthContext();
    const [authenticated, setAuthenticated] = useState(false);
    const [token, setToken] = useState(loadAccessTokenFromLocalStorage());
    const [user, setUser] = useState(null);
    const [refreshInterval, setRefreshInterval] = useState(null)

    const userId = useMemo(() => {
        if (token) {
            const { id } = jwt.decode(token, {json: true});
            return id;
        }
        return null;
    }, [token])

    const clearState = () => {
        setToken(null);
        setAuthenticated(false);
        setRefreshInterval(null);
        setUser(null);
        removeAccessTokenFromLocalStorage();
        removeUserIdFromLocalStorage();
    }
    
    useEffect(() => {
        if (token && token.length !== 0) {
            setAuthenticated(true);
        }
    }, [token])


    useEffect(() => {
        const currentid = loadUserIdFromLocalStorage();
        if (currentid)
            fetchProfile(currentid)
                .then(setUser)
                .catch(err => console.log(err))
    }, [userId])


    useEffect(() => {
        //refreshes access token every ten minutes
        const tenMinutesInMilliseconds = 1000 * 60 * 10;
        //console.log(token, refreshInterval);
        if (token && refreshInterval === null) {
            const interval = setInterval(() => refreshToken()
                .then(token => {
                    saveAccessTokenToLocalStorage(token);
                    setToken(token);
                })
                .catch(err => {
                    console.log(err);
                    clearState();
                }), tenMinutesInMilliseconds)
            setRefreshInterval(interval)
        }
    }, [refreshInterval, refreshToken, token]);

    useEffect(() => {
        refreshToken().then(token => {
            saveAccessTokenToLocalStorage(token);
            setToken(token);
        }).catch(err => {
            console.log("Token is not valid or it has expired. Login to get access.", err);
            clearState();
        })
    }, [refreshToken])

    useEffect(() => {
        if (refreshInterval !== null && token === null) {
            clearInterval(refreshInterval);
        }
    }, [refreshInterval, token])

    const onLogoutClick = () => {
        logout(token, refreshInterval)
            .then(() => {
                clearState();
            })
            .catch(err => console.log(err));
    }

    return (
        <AuthContext.Provider value={{
            authenticated,
            login,
            logout,
            refreshToken,
            token,
            user
        }}>
            <App 
                userIsAuthenticated={authenticated} 
                login={login}
                user={user}
                onLogoutClick={onLogoutClick}
                setToken={setToken}
            />
        </AuthContext.Provider>
    );
}

export default AuthHandler;
