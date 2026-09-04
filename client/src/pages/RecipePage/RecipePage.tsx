import { useEffect, useState } from "react";
import "./RecipePage.css";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { CircleUserRound, Pencil, Trash2 } from "lucide-react";
import userService from "../../utils/userService";
import recipeService from "../../utils/recipeService";
import type { Recipe } from "../../utils/recipeService";
import SpoonfulLogo from "../../components/SpoonfulLogo/SpoonfulLogo";

type RecipePageProps = {
	onSignOut: () => void;
};

export default function RecipePage({ onSignOut }: RecipePageProps) {
	const user = userService.getUser();
	const location = useLocation();
	const [recipes, setRecipes] = useState<Recipe[]>([]);
	const [error, setError] = useState("");
	const [successMessage, setSuccessMessage] = useState(() => location.state?.successMessage ?? "");
	const [recipeToDelete, setRecipeToDelete] = useState<Recipe | null>(null);
	const navigate = useNavigate();

	useEffect(() => {
		recipeService.getAll()
			.then((allRecipes) => setRecipes(allRecipes.filter((recipe) => recipe.ownerId === user?._id)))
			.catch(() => setError("Unable to load recipes."));
	}, [user?._id]);

	async function handleDelete() {
		if (!recipeToDelete) return;
		setError("");
		setSuccessMessage("");
		try {
			await recipeService.remove(recipeToDelete._id);
			setRecipes((current) => current.filter((recipe) => recipe._id !== recipeToDelete._id));
			setSuccessMessage("Your recipe was successfully deleted.");
			setRecipeToDelete(null);
		} catch {
			setError("Unable to delete recipe.");
		}
	}

	return (
		<main className="recipe-page">
			<header className="recipe-header">
				<button className="recipe-brand" type="button" onClick={() => { onSignOut(); navigate("/"); }}>
					<SpoonfulLogo />
				</button>
				<div className="recipe-header-actions">
					<Link className="recipe-user" to="/profile" aria-label="Your profile" title="Your profile"><CircleUserRound size={19} strokeWidth={2.5} aria-hidden="true" /></Link>
					<button className="recipe-sign-out" type="button" onClick={() => { onSignOut(); navigate("/"); }}>Sign out</button>
				</div>
			</header>

			<div className="recipe-dashboard-layout">
				<section className="recipe-dashboard" aria-labelledby="recipes-heading">
					{successMessage && <p className="recipe-success-message" role="status">{successMessage}</p>}
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
								<Link className="recipe-card-link" to={`/recipes/${recipe._id}`}>
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
									</div>
								</Link>
								<div className="recipe-card-content recipe-card-controls">
									<div className="recipe-card-actions">
										<button type="button" aria-label={`Delete ${recipe.title}`} title="Delete recipe" onClick={() => setRecipeToDelete(recipe)}>
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
						<Link className="recipe-browse-button" to="/browse-recipes">Browse Recipes</Link>
					</div>
				</section>
			</div>
			{recipeToDelete && (
				<div className="delete-recipe-backdrop" role="presentation">
					<section className="delete-recipe-modal" role="dialog" aria-modal="true" aria-labelledby="delete-recipe-heading">
						<h2 id="delete-recipe-heading">Delete recipe?</h2>
						<p>Do you want to delete this recipe? This action cannot be undone.</p>
						<button className="delete-recipe-confirm" type="button" onClick={handleDelete}>Yes, Delete Recipe</button>
						<button className="delete-recipe-cancel" type="button" onClick={() => setRecipeToDelete(null)}>Nevermind</button>
					</section>
				</div>
			)}
		</main>
	);
}

