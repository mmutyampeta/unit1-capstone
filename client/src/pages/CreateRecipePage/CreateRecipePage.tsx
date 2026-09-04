import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import "./CreateRecipePage.css";
import recipeService from "../../utils/recipeService";
import ErrorMessage from "../../components/ErrorMessage/ErrorMessage";
import SpoonfulLogo from "../../components/SpoonfulLogo/SpoonfulLogo";

type CreateRecipePageProps = {
	onSignOut: () => void;
};

type PendingNavigation = {
	path: string;
	signOut: boolean;
};

export default function CreateRecipePage({ onSignOut }: CreateRecipePageProps) {
	const navigate = useNavigate();
	const { recipeId } = useParams();
	const formRef = useRef<HTMLFormElement>(null);
	const [error, setError] = useState("");
	const [isDirty, setIsDirty] = useState(false);
	const [pendingNavigation, setPendingNavigation] = useState<PendingNavigation | null>(null);
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

	function completeNavigation({ path, signOut }: PendingNavigation) {
		if (signOut) onSignOut();
		navigate(path);
	}

	function requestNavigation(path: string, signOut = false) {
		const navigation = { path, signOut };
		if (recipeId && isDirty) {
			setPendingNavigation(navigation);
			return;
		}
		completeNavigation(navigation);
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
			const destination = pendingNavigation ?? { path: "/recipes", signOut: false };
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
			setIsDirty(false);
			setPendingNavigation(null);
			completeNavigation(destination);
		} catch {
			setError("Unable to save your recipe. Please try again.");
		}
	}

	return (
		<main className="create-recipe-page">
			<header className="create-recipe-header">
				<button className="create-recipe-brand" type="button" onClick={() => requestNavigation("/", true)}>
					<SpoonfulLogo />
				</button>
				<Link className="create-recipe-back" to="/recipes" onClick={(event) => { event.preventDefault(); requestNavigation("/recipes"); }}>Back to recipes</Link>
			</header>

			<section className="create-recipe-content" aria-labelledby="create-recipe-heading">
				<h1 id="create-recipe-heading">{recipeId ? "Edit Recipe" : "Create Recipe"}</h1>
				<form key={recipeId ? recipe?.title ?? "loading" : "new"} ref={formRef} className="recipe-form" onChange={() => { if (recipeId) setIsDirty(true); }} onSubmit={handleSubmit}>
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
						<Link className="recipe-cancel-button" to="/recipes" onClick={(event) => { event.preventDefault(); requestNavigation("/recipes"); }}>Cancel</Link>
					</div>
					{error && <ErrorMessage message={error} />}
				</form>
			</section>
			{pendingNavigation && (
				<div className="unsaved-changes-backdrop" role="presentation">
					<section className="unsaved-changes-modal" role="dialog" aria-modal="true" aria-labelledby="unsaved-changes-heading">
						<h2 id="unsaved-changes-heading">You have unsaved changes.</h2>
						<p>Do you want to proceed without saving your changes?</p>
						<button className="unsaved-changes-save" type="button" onClick={() => formRef.current?.requestSubmit()}>Save Changes</button>
						<button className="unsaved-changes-discard" type="button" onClick={() => { completeNavigation(pendingNavigation); setPendingNavigation(null); }}>Continue with Saving</button>
						<button className="unsaved-changes-cancel" type="button" onClick={() => setPendingNavigation(null)}>Cancel</button>
					</section>
				</div>
			)}
		</main>
	);
}
