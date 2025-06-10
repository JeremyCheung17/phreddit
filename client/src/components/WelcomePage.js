import React from "react";

export default function WelcomePage({pageSwitch}) {
  return (
    <div className="auth-page" id="welcome-page">
      <div id="welcome-logo">
        <h1 className="banner-name" id="site-name">phreddit</h1>
      </div>
      <div className="auth-box" id="welcome-options">
        <p id='welcome-msg'>Welcome to Phreddit!</p>
        <button className='welcome-buttons' id="login" onClick={() => pageSwitch({pageName: "login"})}>Login</button>
        <button className='welcome-buttons' id="register" onClick={() => pageSwitch({pageName: "register"})}>Register</button>
        <button className='welcome-buttons' id="guest" onClick={() => pageSwitch({pageName: "home"})}>Continue as guest</button>
      </div>
    </div>
  );
}
  
