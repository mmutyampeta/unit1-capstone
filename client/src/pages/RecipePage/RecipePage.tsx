import { useEffect, useState } from "react";
import "./RecipePage.css";
import { Link, useNavigate } from "react-router-dom";
import { Pencil, Trash2 } from "lucide-react";
import userService from "../../utils/userService";
import recipeService from "../../utils/recipeService";
import type { Recipe } from "../../utils/recipeService";

export default function RecipePage() {
	const user = userService.getUser();
	const [recipes, setRecipes] = useState<Recipe[]>([]);
	const [error, setError] = useState("");
	const navigate = useNavigate();

	useEffect(() => {
		recipeService.getAll()
			.then((allRecipes) => setRecipes(allRecipes.filter((recipe) => recipe.ownerId === user?._id)))
			.catch(() => setError("Unable to load recipes."));
	}, [user?._id]);

	async function handleDelete(recipe: Recipe) {
		if (!window.confirm(`Delete ${recipe.title}?`)) return;
		setError("");
		try {
			await recipeService.remove(recipe._id);
			setRecipes((current) => current.filter((currentRecipe) => currentRecipe._id !== recipe._id));
		} catch {
			setError("Unable to delete recipe.");
		}
	}

	return (
		<main className="recipe-page">
			<header className="recipe-header">
				<Link className="recipe-brand" to="/">
					<span className="recipe-brand-mark" aria-hidden="true">⌇</span>
					spoonful
				</Link>
				<span className="recipe-user" title={user?.email}>Account</span>
			</header>

			<section className="recipe-dashboard" aria-labelledby="recipes-heading">
				<p className="recipe-welcome">
					Welcome back! Manage your recipes or add a new one.
				</p>
				<h1 id="recipes-heading">Your Recipes</h1>
				{error && <p className="recipe-error">{error}</p>}
				{recipes.length === 0 ? (
					<div className="recipe-empty-state">
						<p>Your recipes will show up here.</p>
					</div>
				) : (
					<div className="recipe-list">
						{recipes.map((recipe) => (
							<article className="recipe-card" key={recipe._id}>
								{recipe.image ? (
									<img className="recipe-card-image" src={recipe.image} alt={recipe.title} />
								) : (
									<div className="recipe-card-image recipe-card-placeholder" aria-hidden="true" />
								)}
								<div className="recipe-card-content">
									<h2>{recipe.title}</h2>
									<p className="recipe-card-date">
										Created on {recipe.createdAt ? new Date(recipe.createdAt).toLocaleDateString() : "today"}
									</p>
									<div className="recipe-card-tags">
										{recipe.tags.map((tag) => <span key={tag}>{tag}</span>)}
									</div>
									<div className="recipe-card-actions">
										<button type="button" aria-label={`Delete ${recipe.title}`} title="Delete recipe" onClick={() => handleDelete(recipe)}>
											<Trash2 size={18} strokeWidth={2.5} aria-hidden="true" />
										</button>
										<button type="button" aria-label={`Edit ${recipe.title}`} title="Edit recipe" onClick={() => navigate(`/recipes/${recipe._id}/edit`)}>
											<Pencil size={18} strokeWidth={2.5} aria-hidden="true" />
										</button>
									</div>
								</div>
							</article>
						))}
					</div>
				)}
				<div className="recipe-dashboard-actions">
					<Link className="recipe-create-button" to="/recipes/new">Create Recipe</Link>
					<Link className="recipe-browse-button" to="/">Browse Recipes</Link>
				</div>
			</section>
		</main>
	);
}

