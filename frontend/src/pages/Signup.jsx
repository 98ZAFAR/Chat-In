import { Link } from "react-router-dom";
import "../css/Signup.css";

const Signup = () => {
  const handleSubmitForm = (event) => {
    event.preventDefault();
  };

  return (
    <>
      <div className="signup-body">
        <div className="signup-form-section">
          <form className="signup-form" onSubmit={handleSubmitForm}>
            <h3 className="form-title">Sign up</h3>

            <div className="form-input">
              <input type="text" id="username" placeholder="Enter your name" />
            </div>
            <div className="form-input">
              <input type="email" id="email" placeholder="Enter your email" />
            </div>
            <div className="form-input">
              <input
                type="password"
                id="password"
                placeholder="Enter your password"
              />
            </div>
            <div className="goToLogin">
                <p>Already have an account?</p>
                <Link to='/signin' className="loginLink">Login</Link>
            </div>
            <div className="submit-button">
              <button type="submit">Register</button>
            </div>
          </form>
        </div>
        <div className="signup-design-section">
        </div>
      </div>
    </>
  );
};

export default Signup;
