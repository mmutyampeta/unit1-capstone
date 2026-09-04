import "./RecipePage.css";
import { Link } from "react-router-dom";
import userService from "../../utils/userService";

export default function RecipePage() {
	const user = userService.getUser();

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
				<div className="recipe-empty-state">
					<p>Your recipes will show up here.</p>
				</div>
				<button className="recipe-create-button" type="button">
					Create Recipe
				</button>
			</section>
		</main>
	);
}

