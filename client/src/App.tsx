import { Link, Route, Routes, Navigate } from "react-router-dom";
import { useState } from "react";
import "./App.css";
import SignUpPage from "./pages/SignupPage/SignupPage";
import LoginPage from "./pages/LoginPage/LoginPage";
import RecipePage from "./pages/RecipePage/RecipePage";
import CreateRecipePage from "./pages/CreateRecipePage/CreateRecipePage";
import RecipeDetailPage from "./pages/RecipeDetailPage/RecipeDetailPage";
import BrowseRecipesPage from "./pages/BrowseRecipesPage/BrowseRecipesPage";
import userService from "./utils/userService";
import type { User } from "./shared.types";

function App() {
  const [user, setUser] = useState<User | null>(userService.getUser());

  function handleSignUpOrLogin() {
    setUser(userService.getUser());
  }

  function handleSignOut() {
    userService.logout();
    setUser(null);
  }

  return (
    <Routes>
      <Route
        path="/"
        element={
          <main className="landing-page">
            <header className="landing-header">
              <Link className="landing-brand" to="/">spoonful</Link>
              <Link className="landing-login" to="/login">Log in</Link>
            </header>
            <section className="landing-content">
              <p className="landing-kicker">A place for home cooking</p>
              <h1>Recipes worth sharing.</h1>
              <p>Browse recipes from home cooks and save inspiration for your next meal.</p>
            </section>
          </main>
        }
      />
      <Route
        path="/login"
        element={<LoginPage handleSignUpOrLogin={handleSignUpOrLogin} />}
      />
      <Route
        path="/signup"
        element={<SignUpPage handleSignUpOrLogin={handleSignUpOrLogin} />}
      />
      <Route
        path="/recipes"
        element={user ? <RecipePage onSignOut={handleSignOut} /> : <Navigate to="/login" replace />}
      />
      <Route
        path="/recipes/new"
        element={user ? <CreateRecipePage onSignOut={handleSignOut} /> : <Navigate to="/login" replace />}
      />
      <Route
        path="/recipes/:recipeId/edit"
        element={user ? <CreateRecipePage onSignOut={handleSignOut} /> : <Navigate to="/login" replace />}
      />
      <Route
        path="/recipes/:recipeId"
        element={<RecipeDetailPage onSignOut={user ? handleSignOut : undefined} />}
      />
      <Route path="/browse-recipes" element={<BrowseRecipesPage onSignOut={user ? handleSignOut : undefined} />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;