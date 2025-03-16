import { Link } from "react-router-dom";
import "../css/Signin.css";

const Signin = () => {
  const handleSubmitForm = (event) => {
    event.preventDefault();
  };

  return (
    <>
      <div className="signin-body">
        <div className="signin-form-section">
          <form className="signin-form" onSubmit={handleSubmitForm}>
            <h3 className="form-title">Sign in</h3>
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
            <div className="goToRegister">
                <p>Don't have an account?</p>
                <Link to='/signup' className="registerLink">Register</Link>
            </div>
            <div className="submit-button">
              <button type="submit">Login</button>
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
