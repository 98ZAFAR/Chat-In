import { Link } from "react-router-dom";
import "../css/Signup.css";
import { useContext, useState } from "react";
import axios from "axios";
import { ChatContext } from "../stores/chatStore";

const Signup = () => {
  const {registerUser} = useContext(ChatContext);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });

  const handleSubmitForm = (event) => {
    event.preventDefault();
    registerUser(formData);
  };

  const handleChange = (event) => {
    setFormData({ ...formData, [event.target.name]: event.target.value });
  };

  return (
    <>
      <div className="signup-body">
        <div className="signup-form-section">
          <form className="signup-form" onSubmit={handleSubmitForm}>
            <h3 className="form-title">Sign up</h3>

            <div className="form-input">
              <input
                type="text"
                id="username"
                name="username"
                placeholder="Enter your name"
                onChange={handleChange}
              />
            </div>
            <div className="form-input">
              <input
                type="email"
                id="email"
                name="email"
                placeholder="Enter your email"
                onChange={handleChange}
              />
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
            <div className="goToLogin">
              <p>Already have an account?</p>
              <Link to="/signin" className="loginLink">
                Login
              </Link>
            </div>
            <div className="submit-button">
              <button type="submit">Register</button>
            </div>
          </form>
        </div>
        <div className="signup-design-section"></div>
      </div>
    </>
  );
};

export default Signup;
