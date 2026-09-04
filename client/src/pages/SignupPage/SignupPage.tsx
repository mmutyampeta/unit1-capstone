import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import ErrorMessage from "../../components/ErrorMessage/ErrorMessage";
import "./SignupPage.css";
import { Link, useNavigate } from "react-router-dom";
import userService from "../../utils/userService";
import SpoonfulLogo from "../../components/SpoonfulLogo/SpoonfulLogo";

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
    setError("");

    if (state.password !== state.passwordConf) {
      setError("Passwords do not match.");
      return;
    }

    try {
      await userService.signup({
        email: state.email,
        password: state.password,
      });
      handleSignUpOrLogin();
      navigate("/recipes");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Unable to create account.");
    }
  }

  return (
    <div className="signup-page">
      <div className="signup-form-container">
        <Link className="signup-brand" to="/">
          <SpoonfulLogo />
        </Link>
        <h2 className="signup-header">Create an Account</h2>
        <form
          autoComplete="off"
          onSubmit={handleSubmit}
          className="signup-form"
        >
          <div className="signup-segment">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              name="username"
              placeholder="Username"
              value={state.username}
              onChange={handleChange}
              required
              className="signup-input"
            />
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              name="email"
              placeholder="Email"
              value={state.email}
              onChange={handleChange}
              required
              className="signup-input"
            />
            <label htmlFor="signup-password">Password</label>
            <input
              id="signup-password"
              name="password"
              type="password"
              placeholder="Password"
              value={state.password}
              onChange={handleChange}
              required
              className="signup-input"
            />
            <label htmlFor="password-confirmation">Confirm password</label>
            <input
              id="password-confirmation"
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
            Create Account
          </button>
          <Link className="signup-cancel" to="/login">Cancel</Link>
          {error ? <ErrorMessage message={error} /> : null}
        </form>
      </div>
    </div>
  );
}