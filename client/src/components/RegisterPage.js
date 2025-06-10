import React, { useState } from 'react';
import axios from 'axios';

export default function RegisterPage({pageSwitch}) {
  return (
    <div className="page-content auth-page" id="register-page">
        <div id="welcome-logo">
            <h1 className="banner-name" id="site-name" onClick={() => pageSwitch({pageName: "welcome"})}>phreddit</h1>
        </div>
        <div className="auth-box" id="register-options">
            <h1 className="main-page-title" id="new-comment-title">Create An Account</h1>
            <RegisterForm pageSwitch={pageSwitch}/>
        </div>
  </div>
  );
}

function RegisterForm({pageSwitch}) {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        displayName: '',
        password: '',
        confirmPassword: ''
    });

    const [errors, setErrors] = useState({});

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    }

    const validateForm = async () => {
        const { firstName, lastName, displayName, email, password, confirmPassword } = formData;
        let valid = true;
        let newErrors = {};
        
        
        if (!firstName.trim()) {
            newErrors.firstName = "First name is required.*"
            valid = false;
        }
        if (!lastName.trim()) {
            newErrors.lastName = "Last name is required.*"
            valid = false;
        }

        if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
            newErrors.email = "A valid email is required.*";
            valid = false;
        }
        if (!displayName.trim()) {
            newErrors.displayName = "Display name is required.*"
            valid = false;
        }

        const validUser = await axios.get("/api/users/check-taken", {
            params: {
                email: formData.email,
                displayName: formData.displayName,
            }
        });
        if (validUser.data.emailTaken) {
            newErrors.email = "There is an existing account using this email.*";
            valid = false;
        }
        if (validUser.data.nameTaken) {
            newErrors.displayName = "Display Name is taken.*";
            valid = false;
        }

        if (!password) {
            newErrors.password = "Password is required.*";
            valid = false;
        }
        else {
            const pwd = password.toLowerCase();
            if (pwd.includes(firstName.toLowerCase()) ||
                pwd.includes(lastName.toLowerCase()) ||
                pwd.includes(displayName.toLowerCase()) ||
                pwd.includes(email.toLowerCase())) {
                    newErrors.password = "Password cannot contain your name, display name, or email.*";
                    valid = false;
                }
        }
        if (password !== confirmPassword) {
            newErrors.confirmPassword = "Passwords do not match.*";
            valid = false;
        }

        setErrors(newErrors);
        return valid;
    }

    const handleSubmit = async () => {
        const validForm = await validateForm();
        if (!validForm) {
            //pageSwitch({pageName: "welcome"});
            return;
        }

        const newUser = {
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
            displayName: formData.displayName,
            password: formData.password
        };
        try {
            const addUser = await axios.post('http://localhost:8000/api/auth/register', newUser);
            alert(`Welcome to phreddit, ${formData.firstName} ${formData.lastName}!`);
            pageSwitch({pageName: "welcome"});
        } catch(err) {
            console.error('Error registering new user: ', err);
            return;
        }
    }

    return (
        <form className="auth-forms" id="register-form">
            <label htmlFor="firstName">First Name</label>
            <input
                className="text-input"
                id="firstName"
                name = "firstName"
                value={formData.firstName}
                onChange={handleChange}
                required
            ></input>
            <div className="form-error">{errors.firstName}</div>

            <label htmlFor="lastName">Last Name</label>
            <input
                className="text-input"
                id = "lastName" 
                name = "lastName"
                value={formData.lastName}
                onChange={handleChange}
                required
            ></input>
            <div className="form-error">{errors.lastName}</div>

            <label htmlFor='register-email'>Email</label>
            <input
                className="text-input"
                id = "register-email"
                name = "email"
                value={formData.email}
                onChange={handleChange}
                required
            ></input>
            <div className="form-error">{errors.email}</div>

            <label htmlFor='register-displayName'>Display Name</label>
            <input
                className="text-input"
                id='register-displayName'
                name = "displayName"
                value={formData.displayName}
                onChange={handleChange}
                required
            ></input>
            <div className="form-error">{errors.displayName}</div>

            <label htmlFor='register-pwd'>Password</label>
            <input
                className="text-input"
                id="register-pwd"
                name = "password"
                value={formData.password}
                onChange={handleChange}
                required
            ></input>
            <div className="form-error">{errors.password}</div>

            <label htmlFor="register-pwd-confirm">Confirm Password</label>
            <input
                className="text-input"
                id="register-pwd-confirm"
                name = "confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
            ></input>
            <div className="form-error">{errors.confirmPassword}</div>           

            <button className="submit-button" id="register-submit" type="button" onClick={handleSubmit}>
                Sign Up
            </button>
        </form>
    );
}

    
  
