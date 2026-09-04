import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import "./CreateRecipePage.css";
import recipeService from "../../utils/recipeService";
import ErrorMessage from "../../components/ErrorMessage/ErrorMessage";

export default function CreateRecipePage() {
	const navigate = useNavigate();
	const { recipeId } = useParams();
	const [imagePreview, setImagePreview] = useState<string | null>(null);
	const [error, setError] = useState("");
	const [recipe, setRecipe] = useState<{
		title: string;
		ingredients: string;
		instructions: string;
		tags: string;
	} | null>(null);

	useEffect(() => {
		if (!recipeId) return;
		recipeService.getOne(recipeId)
			.then((existingRecipe) => setRecipe({
				title: existingRecipe.title,
				ingredients: existingRecipe.ingredients.map((ingredient) => ingredient.name).join("\n"),
				instructions: existingRecipe.instructions.map((instruction) => instruction.description).join("\n"),
				tags: existingRecipe.tags.join(", "),
			}))
			.catch(() => setError("Unable to load this recipe."));
	}, [recipeId]);

	function handleImageChange(event: React.ChangeEvent<HTMLInputElement>) {
		const image = event.target.files?.[0];
		setImagePreview(image ? URL.createObjectURL(image) : null);
	}

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
				<Link className="create-recipe-brand" to="/recipes">
					<span className="create-recipe-brand-mark" aria-hidden="true">⌇</span>
					spoonful
				</Link>
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

					<label htmlFor="recipe-image">Image</label>
					<label className={`recipe-image-upload${imagePreview ? " has-image" : ""}`} htmlFor="recipe-image">
						{imagePreview ? <img src={imagePreview} alt="Selected recipe" /> : <span>Choose an image</span>}
					</label>
					<input id="recipe-image" className="recipe-image-input" name="image" type="file" accept="image/png,image/jpeg" onChange={handleImageChange} />

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
