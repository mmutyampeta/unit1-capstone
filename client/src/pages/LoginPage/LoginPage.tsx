import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import "./LoginPage.css";
import ErrorMessage from "../../components/ErrorMessage/ErrorMessage";

import { Link, useNavigate } from "react-router-dom";

// import userService from "../../utils/userService";

type LoginPageProps = {
  handleSignUpOrLogin: () => void;
};

export default function LoginPage({ handleSignUpOrLogin }: LoginPageProps) {
  const [state, setState] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");

  // this function takes a path defined in App.js for our routes
  const navigate = useNavigate();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    try {
      // We always pass in an OBJECT as the data we want to send to the server
      // await userService.login(state); // making the http request to the server

      navigate("/");
      handleSignUpOrLogin(); // this comes from app.js as a prop, which it gets the token from localstorage and stores the decoded
      // token in the app.js state
    } catch (err) {
      console.log(err);
      setError("check terminal and console");
    }
  }

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    setState({
      ...state,
      [e.target.name]: e.target.value,
    });
  }

  return (
    <div className="login-page">
      <div className="login-form-container">
        <h2 className="login-header">Login</h2>
        <form autoComplete="off" onSubmit={handleSubmit} className="login-form">
          <div className="login-segment">
            <input
              type="email"
              name="email"
              placeholder="email"
              value={state.email}
              onChange={handleChange}
              required
              className="login-input"
            />
            <input
              name="password"
              type="password"
              placeholder="password"
              value={state.password}
              onChange={handleChange}
              required
              className="login-input"
            />
            <button type="submit" className="login-btn">
              Login
            </button>
          </div>
          <div className="login-message">
            New to Us? <Link to="/signup">Sign up</Link>
          </div>
          {error ? <ErrorMessage message={error} /> : null}
        </form>
      </div>
    </div>
  );
}