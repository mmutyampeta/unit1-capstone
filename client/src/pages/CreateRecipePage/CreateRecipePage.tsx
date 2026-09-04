import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./CreateRecipePage.css";

export default function CreateRecipePage() {
	const navigate = useNavigate();
	const [imagePreview, setImagePreview] = useState<string | null>(null);

	function handleImageChange(event: React.ChangeEvent<HTMLInputElement>) {
		const image = event.target.files?.[0];
		setImagePreview(image ? URL.createObjectURL(image) : null);
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
				<h1 id="create-recipe-heading">Create Recipe</h1>
				<form className="recipe-form" onSubmit={(event) => { event.preventDefault(); navigate("/recipes"); }}>
					<label htmlFor="recipe-title">Title</label>
					<input id="recipe-title" name="title" placeholder="Spicy Chickpea Soup" required />

					<label htmlFor="recipe-ingredients">Ingredients</label>
					<textarea
						id="recipe-ingredients"
						name="ingredients"
						placeholder="1 tbsp Olive Oil, 1 Onion, 2 Cloves Garlic, 1 Can Chickpeas, 1 Can Diced Tomatoes, 1 tsp Cumin, 1/2 tsp Chili Flakes, Salt to taste"
						rows={3}
						required
					/>

					<label htmlFor="recipe-instructions">Instructions</label>
					<textarea
						id="recipe-instructions"
						name="instructions"
						placeholder="Saute onions in garlic. Add chickpeas and tomatoes, simmer for 20 mins"
						rows={3}
						required
					/>

					<label htmlFor="recipe-tags">Tags</label>
					<input id="recipe-tags" name="tags" placeholder="Vegan, Gluten Free, Dinner" />

					<label htmlFor="recipe-image">Image</label>
					<label className={`recipe-image-upload${imagePreview ? " has-image" : ""}`} htmlFor="recipe-image">
						{imagePreview ? <img src={imagePreview} alt="Selected recipe" /> : <span>Choose an image</span>}
					</label>
					<input id="recipe-image" className="recipe-image-input" name="image" type="file" accept="image/png,image/jpeg" onChange={handleImageChange} />

					<div className="recipe-form-actions">
						<button className="recipe-save-button" type="submit">Save</button>
						<Link className="recipe-cancel-button" to="/recipes">Cancel</Link>
					</div>
				</form>
			</section>
		</main>
	);
}
