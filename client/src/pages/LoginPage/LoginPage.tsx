import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import "./LoginPage.css";
import ErrorMessage from "../../components/ErrorMessage/ErrorMessage";

import { Link, useNavigate } from "react-router-dom";

import userService from "../../utils/userService";

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
    setError("");

    try {
      await userService.login(state);

      handleSignUpOrLogin();
      navigate("/recipes");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Unable to log in.");
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
        <Link className="login-brand" to="/">
          <span className="login-brand-mark" aria-hidden="true">⌇</span>
          spoonful
        </Link>
        <div className="login-intro">
          <h2 className="login-header">Welcome Back!</h2>
          <p>Log in to your account to continue</p>
        </div>
        <form autoComplete="off" onSubmit={handleSubmit} className="login-form">
          <div className="login-segment">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              name="email"
              placeholder="Email"
              value={state.email}
              onChange={handleChange}
              required
              className="login-input"
            />
            <label htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              placeholder="Password"
              value={state.password}
              onChange={handleChange}
              required
              className="login-input"
            />
            <a className="forgot-password" href="#password">Forgot Password?</a>
            <button type="submit" className="login-btn">
              Login
            </button>
            <Link className="create-account" to="/signup">Create an Account</Link>
          </div>
          <Link className="explore-recipes" to="/">Explore Recipes without Logging In</Link>
          {error ? <ErrorMessage message={error} /> : null}
        </form>
      </div>
    </div>
  );
}