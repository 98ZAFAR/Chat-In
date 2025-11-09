import { Link, useNavigate } from "react-router-dom";
import "../css/Signin.css";
import { ChatContext } from "../stores/chatStore";
import { useContext, useState } from "react";
import { useEffect } from "react";

const API_URL = import.meta.env.VITE_API_URL;

const Signin = () => {
  const { loginUser } = useContext(ChatContext);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const { token } = useContext(ChatContext);
  const navigate = useNavigate();

  const handleSubmitForm = (event) => {
    event.preventDefault();
    loginUser(formData);
  };

  const handleChange = (event) => {
    setFormData({ ...formData, [event.target.name]: event.target.value });
  };

  const handleGoogleLogin = () => {
    window.location.href = `${API_URL}/auth/google`;
  };

  useEffect(() => {
    if (token) {
      navigate('/chat');
    }
  }, [token, navigate]);

  return (
    <>
      <div className="signin-body">
        <div className="signin-form-section">
          <form className="signin-form" onSubmit={handleSubmitForm}>
            <h3 className="form-title">Sign in</h3>
            <div className="form-input">
              <input type="email" id="email" name="email" placeholder="Enter your email" onChange={handleChange} />
            </div>
            <div className="form-input">
              <input
                type="password"
                id="password"
                placeholder="Enter your password"
                name="password"
                onChange={handleChange}
              />
            </div>
            <div className="goToRegister">
              <p>Don't have an account?</p>
              <Link to='/signup' className="registerLink">Register</Link>
            </div>
            <div className="submit-button">
              <button type="submit">Login</button>
            </div>
            <div className="divider">
              <span>OR</span>
            </div>
            <div className="google-login-button">
              <button type="button" className="google-btn" onClick={handleGoogleLogin}>
                <img src="https://developers.google.com/identity/images/g-logo.png" alt="Google" />
                Login with Google
              </button>
            </div>
          </form>
        </div>
        <div className="signin-design-section">
        </div>
      </div>
    </>
  );
};

export default Signin;
