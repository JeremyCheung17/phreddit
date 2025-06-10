import React, { useState } from 'react';
import axios from 'axios';

export default function LoginPage({pageSwitch}) {
  return (
    <div className="page-content auth-page" id="login-page">
        <div id="welcome-logo">
            <h1 className="banner-name" id="site-name" onClick={() => pageSwitch({pageName: "welcome"})}>phreddit</h1>
        </div>
        <div className="auth-box" id="login-options">
            <h1 className="main-page-title" id="login-title">Login With Email</h1>
            <LoginForm pageSwitch={pageSwitch}/>
        </div>
  </div>
  );
}

function LoginForm({pageSwitch}) {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });

    const [errors, setErrors] = useState("");

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    }

    const handleLogin = async () => {
        if (!formData.email.trim() || !formData.password.trim()) {
            let error = "Email and password cannot be empty."; 
            setErrors(error);
            return;
        }

        const credentials = {
            email: formData.email,
            password: formData.password
        };
        try {
            const login = await axios.post('http://localhost:8000/api/auth/login', credentials);
            pageSwitch({pageName: "home"});
        } catch(err) {
            let error = "A problem occured."; 
            if (err.response.data.message) error = err.response.data.message;
            console.error('Error logging in user: ', err);
            setErrors(error);
        }
    }

    return (
        <form className="auth-forms" id="login-form">
            <label htmlFor="login-email">Email</label>
            <input
                className="text-input"
                id="login-email"
                name = "email"
                value={formData.email}
                onChange={handleChange}
                required
            ></input>
            
            <label htmlFor="login-pwd">Password</label>
            <input
                className="text-input"
                id="login-pwd"
                name = "password"
                value={formData.password}
                onChange={handleChange}
                required
            ></input>
            <button className="submit-button" id="login-submit" type="button" onClick={handleLogin}>
                Sign in
            </button>

            <div className="form-error" id="login-error">{errors}</div>
        </form>
    );
}

    
  
