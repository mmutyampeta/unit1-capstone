import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import ErrorMessage from "../../components/ErrorMessage/ErrorMessage";
import "./SignupPage.css";

// this hook allows us to navigate programatically
import { useNavigate } from "react-router-dom";
// import userService from "../../utils/userService";

type SignupPageProps = {
  handleSignUpOrLogin: () => void;
};

export default function SignUpPage({ handleSignUpOrLogin }: SignupPageProps) {
  const [error, setError] = useState("");

  const [state, setState] = useState({
    username: "",
    email: "",
    password: "",
    passwordConf: "",
  });

  const navigate = useNavigate();

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    setState({
      ...state,
      [e.target.name]: e.target.value,
    });
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    try {
      // await userService.signup(state); // userService is imported at top of file
      handleSignUpOrLogin(); // this is destructred in the props
      // and it grabs the token from localstorage and sets the
      // new user in state!

      // Change the view to the home page!
      navigate("/"); // navigate acceps a path defined by a route!
    } catch (err: any) {
      console.log(err, " <- this comes from tht throw in utils/signup");
      setError(err.message);
    }

    // ===========================================
  }

  return (
    <div className="signup-page">
      <div className="signup-form-container">
        <h2 className="signup-header">Sign Up</h2>
        <form
          autoComplete="off"
          onSubmit={handleSubmit}
          className="signup-form"
        >
          <div className="signup-segment">
            <input
              name="username"
              placeholder="username"
              value={state.username}
              onChange={handleChange}
              required
              className="signup-input"
            />
            <input
              type="email"
              name="email"
              placeholder="email"
              value={state.email}
              onChange={handleChange}
              required
              className="signup-input"
            />
            <input
              name="password"
              type="password"
              placeholder="password"
              value={state.password}
              onChange={handleChange}
              required
              className="signup-input"
            />
            <input
              name="passwordConf"
              type="password"
              placeholder="Confirm Password"
              value={state.passwordConf}
              onChange={handleChange}
              required
              className="signup-input"
            />
          </div>
          <button type="submit" className="signup-btn">
            Signup
          </button>
          {error ? <ErrorMessage message={error} /> : null}
        </form>
      </div>
    </div>
  );
}