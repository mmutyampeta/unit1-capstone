import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import recipeService from "../../utils/recipeService";
import type { Recipe } from "../../utils/recipeService";
import "./RecipeDetailPage.css";
import SpoonfulLogo from "../../components/SpoonfulLogo/SpoonfulLogo";

type RecipeDetailPageProps = {
  onSignOut?: () => void;
};

export default function RecipeDetailPage({ onSignOut }: RecipeDetailPageProps) {
  const { recipeId } = useParams();
  const navigate = useNavigate();
  const homePath = onSignOut ? "/recipes" : "/";
  const recipeListPath = onSignOut ? "/recipes" : "/browse-recipes";
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!recipeId) return;
    recipeService.getOne(recipeId)
      .then(setRecipe)
      .catch(() => setError("Unable to load this recipe."));
  }, [recipeId]);

  if (error) return <main className="recipe-detail-page"><p className="recipe-detail-error">{error}</p></main>;
  if (!recipe) return <main className="recipe-detail-page"><p>Loading recipe...</p></main>;

  return (
    <main className="recipe-detail-page">
      <header className="recipe-detail-header">
        {onSignOut ? <button className="recipe-detail-brand" type="button" onClick={() => { onSignOut(); navigate("/"); }}>
          <SpoonfulLogo />
        </button> : <Link className="recipe-detail-brand" to="/"><SpoonfulLogo /></Link>}
      </header>
      <article className="recipe-detail-content">
        <nav className="recipe-breadcrumbs" aria-label="Breadcrumb">
          <Link to={homePath}>Home</Link><span>&gt;</span><Link to={recipeListPath}>Recipe List</Link><span>&gt;</span><span>{recipe.title}</span>
        </nav>
        {recipe.image ? <img className="recipe-detail-image" src={recipe.image} alt={recipe.title} /> : <div className="recipe-detail-image recipe-detail-placeholder" aria-hidden="true" />}
        <h1>{recipe.title}</h1>
        <section>
          <h2>Ingredients</h2>
          <ul>{recipe.ingredients.map((ingredient, index) => <li key={`${ingredient.name}-${index}`}>{ingredient.name}</li>)}</ul>
        </section>
        <section>
          <h2>Instructions</h2>
          {recipe.instructions.map((instruction) => <p key={instruction.step}>{instruction.description}</p>)}
        </section>
        {recipe.tags.length > 0 && <section>
          <h2>Tags</h2>
          <div className="recipe-detail-tags">{recipe.tags.map((tag) => <span key={tag}>{tag}</span>)}</div>
        </section>}
      </article>
    </main>
  );
}