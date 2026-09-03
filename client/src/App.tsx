import { Link, Route, Routes, Navigate } from "react-router-dom";
import { useState } from "react";
import "./App.css";
import SignUpPage from "./pages/SignupPage/SignupPage";
import LoginPage from "./pages/LoginPage/LoginPage";
import userService from "./utils/userService";
import type { User } from "./shared.types";

function App() {
  const [user, setUser] = useState<User | null>(userService.getUser());

  function handleSignUpOrLogin() {
    setUser(userService.getUser());
  }

  return (
    <Routes>
      <Route
        path="/"
        element={
          <main className="landing-page">
            <p className="landing-kicker">Spoonful</p>
            <h1>Recipes worth sharing.</h1>
            <p>Browse recipes from home cooks and save inspiration for your next meal.</p>
            <Link className="landing-login" to="/login">
              Log in
            </Link>
          </main>
        }
      />
      <Route
        path="/login"
        element={
          user ? <Navigate to="/" replace /> : <LoginPage handleSignUpOrLogin={handleSignUpOrLogin} />
        }
      />
      <Route
        path="/signup"
        element={
          user ? <Navigate to="/" replace /> : <SignUpPage handleSignUpOrLogin={handleSignUpOrLogin} />
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;