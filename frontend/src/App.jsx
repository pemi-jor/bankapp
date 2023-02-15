import { BrowserRouter as Router, Route, Link, Redirect } from 'react-router-dom';
import React, { useState } from "react";
import Account from "./account";
import "./router.css";
import Login from "./modals/login";
import Signup from "./modals/signup";
import FundRequest from "./fundrequest";

function App(props) {
  const [visibleModal, setVisibleModal] = useState(null);
  const [redirectToPage, setRedirectToPage] = useState(null);
  const [refreshAccount, setRefreshAccount] = useState(false);
  const [refreshFundRequests, setRefreshFundRequests] = useState(false);

  const { 
    userIsAuthenticated,
    login,
    user,
    onLogoutClick,
    setToken
  } = props;

  const setModal = (modalValue) => 
    (event) => {
      event.preventDefault();
      visibleModal === modalValue ?
        setVisibleModal(null) :
        setVisibleModal(modalValue);
  };

  const OnClickRA = (e) => {
    if (userIsAuthenticated) setRefreshAccount(true);
  };
  const OnClickRFR = (e) => {
    if (userIsAuthenticated) setRefreshFundRequests(true);
  };

  return (
    <div className="App">
        <Router>
          <ul>
            {/* Auth */}
            {
              userIsAuthenticated ?
                <li className="navElement">
                  <Link className="nav" onClick={OnClickRA} to="/account">Account</Link>
                </li> :
                <li className="navElement">
                  <a href="/#" className="nav" onClick={setModal("signup")}> Signup </a>
                </li> 
            }
            {
              userIsAuthenticated ?
                <li className="navElement">
                  <Link className="nav" onClick={OnClickRFR} to="/fundrequests">Fund Requests</Link>
                </li> : ""
            }
            {
              userIsAuthenticated ?
                <li className="navElement">
                  <Link className="nav" href="/#" onClick={onLogoutClick}>Logout</Link>
                </li> :
                <li className="navElement">
                  <a href="/#" className="nav" onClick={setModal("login")}> Login </a>
                </li>
            }

          </ul>
          <Route exact path="/" >
            {
              userIsAuthenticated ?
              <Account 
              user={user}
              refreshAccount={refreshAccount}
              /> :
              <p className="NotLogged" >Login or Signup</p>
            }
          </Route>
          <Route exact path="/account" >
            {
              userIsAuthenticated ?
              (<Account 
              user={user}
              refreshAccount={refreshAccount}
              />) :
              <p className="NotLogged" >Login or Signup</p>
            }
          </Route>
          <Route exact path="/fundrequests" >
            {
              userIsAuthenticated ?
              (<FundRequest 
              user={user}
              refreshFundRequests={refreshFundRequests}
              />) :
              <p className="NotLogged">Login or Signup</p>
            }
          </Route>
          <Login
              login={login}
              setToken={setToken}
              visible={visibleModal === "login" ? true : false}
              setVisibleModal={setVisibleModal}
              setRedirectToPage={setRedirectToPage}
          />
          <Signup
              visible={visibleModal === "signup" ? true : false}
              setVisibleModal={setVisibleModal}
              setRedirectToPage={setRedirectToPage}
          />
          {redirectToPage && <Redirect to={redirectToPage} />}
        </Router>
        
      
    </div>
  );
}

export default App;
