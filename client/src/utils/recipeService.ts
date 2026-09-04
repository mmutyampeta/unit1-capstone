import axios from "axios";
import tokenService from "./tokenService";

const BASE_URL = "http://localhost:3000/api/recipes";

export type Recipe = {
  _id: string;
  title: string;
  image?: string;
  ingredients: { name: string; quantity: string }[];
  instructions: { step: number; description: string }[];
  tags: string[];
  ownerId: string;
  createdAt?: string;
};

type CreateRecipeData = Omit<Recipe, "_id" | "ownerId">;

function getAuthorizationHeader() {
  return { Authorization: `Bearer ${tokenService.getToken()}` };
}

async function getAll(): Promise<Recipe[]> {
  const response = await axios.get<Recipe[]>(BASE_URL);
  return response.data;
}

async function create(recipe: CreateRecipeData): Promise<Recipe> {
  const response = await axios.post<Recipe>(BASE_URL, recipe, {
    headers: getAuthorizationHeader(),
  });
  return response.data;
}

async function getOne(recipeId: string): Promise<Recipe> {
  const response = await axios.get<Recipe>(`${BASE_URL}/${recipeId}`);
  return response.data;
}

async function update(recipeId: string, recipe: CreateRecipeData): Promise<Recipe> {
  const response = await axios.put<Recipe>(`${BASE_URL}/${recipeId}`, recipe, {
    headers: getAuthorizationHeader(),
  });
  return response.data;
}

async function remove(recipeId: string): Promise<void> {
  await axios.delete(`${BASE_URL}/${recipeId}`, { headers: getAuthorizationHeader() });
}

export default { create, getAll, getOne, update, remove };