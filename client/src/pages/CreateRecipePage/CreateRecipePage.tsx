import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import "./CreateRecipePage.css";
import recipeService from "../../utils/recipeService";
import ErrorMessage from "../../components/ErrorMessage/ErrorMessage";

type CreateRecipePageProps = {
	onSignOut: () => void;
};

export default function CreateRecipePage({ onSignOut }: CreateRecipePageProps) {
	const navigate = useNavigate();
	const { recipeId } = useParams();
	const [error, setError] = useState("");
	const [recipe, setRecipe] = useState<{
		title: string;
		image: string;
		ingredients: string;
		instructions: string;
		tags: string;
	} | null>(null);

	useEffect(() => {
		if (!recipeId) return;
		recipeService.getOne(recipeId)
			.then((existingRecipe) => setRecipe({
				title: existingRecipe.title,
				image: existingRecipe.image ?? "",
				ingredients: existingRecipe.ingredients.map((ingredient) => ingredient.name).join("\n"),
				instructions: existingRecipe.instructions.map((instruction) => instruction.description).join("\n"),
				tags: existingRecipe.tags.join(", "),
			}))
			.catch(() => setError("Unable to load this recipe."));
	}, [recipeId]);

	async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();
		setError("");
		const formData = new FormData(event.currentTarget);
		const ingredients = String(formData.get("ingredients"))
			.split("\n")
			.map((line) => line.trim())
			.filter(Boolean)
			.map((line) => ({ name: line, quantity: "As listed" }));
		const instructions = String(formData.get("instructions"))
			.split("\n")
			.map((line) => line.trim())
			.filter(Boolean)
			.map((description, index) => ({ step: index + 1, description: description.trim() }));
		const tags = String(formData.get("tags"))
			.split(",")
			.map((tag) => tag.trim())
			.filter(Boolean);

		try {
			const recipeData = {
				title: String(formData.get("title")).trim(),
				image: String(formData.get("image")).trim(),
				ingredients,
				instructions,
				tags,
			};
			if (recipeId) {
				await recipeService.update(recipeId, recipeData);
			} else {
				await recipeService.create(recipeData);
			}
			navigate("/recipes");
		} catch {
			setError("Unable to save your recipe. Please try again.");
		}
	}

	return (
		<main className="create-recipe-page">
			<header className="create-recipe-header">
				<button className="create-recipe-brand" type="button" onClick={() => { onSignOut(); navigate("/"); }}>
					<span className="create-recipe-brand-mark" aria-hidden="true">⌇</span>
					spoonful
				</button>
				<Link className="create-recipe-back" to="/recipes">Back to recipes</Link>
			</header>

			<section className="create-recipe-content" aria-labelledby="create-recipe-heading">
				<h1 id="create-recipe-heading">{recipeId ? "Edit Recipe" : "Create Recipe"}</h1>
				<form key={recipeId ? recipe?.title ?? "loading" : "new"} className="recipe-form" onSubmit={handleSubmit}>
					<label htmlFor="recipe-title">Title</label>
					<input id="recipe-title" name="title" defaultValue={recipe?.title} required />

					<label htmlFor="recipe-ingredients">Ingredients</label>
					<textarea
						id="recipe-ingredients"
						name="ingredients"
						defaultValue={recipe?.ingredients}
						rows={3}
						required
					/>

					<label htmlFor="recipe-instructions">Instructions</label>
					<textarea
						id="recipe-instructions"
						name="instructions"
						defaultValue={recipe?.instructions}
						rows={3}
						required
					/>

					<label htmlFor="recipe-tags">Tags</label>
					<input id="recipe-tags" name="tags" defaultValue={recipe?.tags} />

					<label htmlFor="recipe-image">Image URL</label>
					<input id="recipe-image" name="image" type="url" defaultValue={recipe?.image} />

					<div className="recipe-form-actions">
						<button className="recipe-save-button" type="submit">Save</button>
						<Link className="recipe-cancel-button" to="/recipes">Cancel</Link>
					</div>
					{error && <ErrorMessage message={error} />}
				</form>
			</section>
		</main>
	);
}
