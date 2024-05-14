import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { doCreateUserWithEmailAndPassword } from './firebase/auth';
import './Register.css';

const RegisterForm = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [showErrorPopup, setShowErrorPopup] = useState('');

  const handleRegister = async (event) => {
    event.preventDefault();
    const lowerCaseEmail = email.toLowerCase();
    try {
      await doCreateUserWithEmailAndPassword(lowerCaseEmail, password);
      setShowErrorPopup('');
      setShowSuccessPopup(true);
      setTimeout(() => {
        setShowSuccessPopup(false);
        navigate('/');
      }, 3000);
    } catch (error) {
      console.error("Registration error:", error);
      const errorMessage = error.code === 'auth/email-already-in-use'
        ? "Email has been used"
        : "An error occurred during registration";
      setShowErrorPopup(errorMessage);
      setShowSuccessPopup(false);
    }
  };

  const handleAlreadyHaveAccount = () => {
    navigate('/');
  };

  return (
    <div className="card">
      {showSuccessPopup && (
        <div className="success-popup">New Account Created</div>
      )}
      {showErrorPopup && (
        <div className="error-popup">{showErrorPopup}</div>
      )}
      <div className="card2">
        <form className="form" onSubmit={handleRegister}>
          <p id="heading">Register</p>
          <div className="field">
            <input
              type="email"
              className="input-field"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="off"
            />
          </div>
          <div className="field">
            <input
              type="password"
              className="input-field"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div className="btn">
            <button type="submit" className="button1">Sign Up</button>
          </div>
          <button type="button" className="button3" onClick={handleAlreadyHaveAccount}>
            Already have an account
          </button>
        </form>
      </div>
    </div>
  );
};

export default RegisterForm;
