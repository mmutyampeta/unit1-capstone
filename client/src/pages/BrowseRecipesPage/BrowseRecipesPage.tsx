import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import recipeService from "../../utils/recipeService";
import type { Recipe } from "../../utils/recipeService";
import userService from "../../utils/userService";
import "./BrowseRecipesPage.css";
import SpoonfulLogo from "../../components/SpoonfulLogo/SpoonfulLogo";

type BrowseRecipesPageProps = {
  onSignOut?: () => void;
};

export default function BrowseRecipesPage({ onSignOut }: BrowseRecipesPageProps) {
  const user = userService.getUser();
  const navigate = useNavigate();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    recipeService.getAll().then(setRecipes).catch(() => setError("Unable to load recipes."));
  }, []);

  const searchTerm = search.trim().toLowerCase();
  const filteredRecipes = recipes.filter((recipe) => [
    recipe.title,
    ...recipe.tags,
    ...recipe.ingredients.map((ingredient) => ingredient.name),
  ].some((value) => value.toLowerCase().includes(searchTerm)));

  return (
    <main className="browse-recipes-page">
      <header className="browse-recipes-header">
        {onSignOut ? <button className="browse-recipes-brand" type="button" onClick={() => { onSignOut(); navigate("/"); }}>
          <SpoonfulLogo />
        </button> : <Link className="browse-recipes-brand" to="/"><SpoonfulLogo /></Link>}
        {user && <Link className="browse-recipes-dashboard-link" to="/recipes">Your recipes</Link>}
      </header>
      <section className="browse-recipes-content" aria-labelledby="browse-recipes-heading">
        <nav className="browse-breadcrumbs" aria-label="Breadcrumb"><Link to={user ? "/recipes" : "/"}>Home</Link><span>&gt;</span><span>Recipe List</span></nav>
        <h1 id="browse-recipes-heading">Recipe List</h1>
        <label className="browse-search-label" htmlFor="recipe-search">Search recipes</label>
        <input id="recipe-search" className="browse-search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search recipes" />
        <aside className="browse-ai-callout" aria-label="AI Assistant">
          <p>Any Questions?</p>
          <span>Ask the Spoonful AI Assistant for recipe ideas and cooking help.</span>
          <Link to="/ai-assistant">Open AI Assistant</Link>
        </aside>
        {error && <p className="browse-recipes-error">{error}</p>}
        {!error && filteredRecipes.length === 0 && (
          <div className="browse-empty-state">
            <p className="browse-empty">We couldn't find any recipes.</p>
          </div>
        )}
        <div className="browse-recipe-list">
          {filteredRecipes.map((recipe) => (
            <Link className="browse-recipe-card" to={`/recipes/${recipe._id}`} key={recipe._id}>
              {recipe.image ? <img src={recipe.image} alt={recipe.title} /> : <div className="browse-recipe-placeholder" aria-hidden="true" />}
              <div className="browse-recipe-card-content">
                <h2>{recipe.title}</h2>
                <div className="browse-recipe-tags">{recipe.tags.map((tag) => <span key={tag}>{tag}</span>)}</div>
                <span className="browse-view-recipe">View Recipe</span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}