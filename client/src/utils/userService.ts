import tokenService from "./tokenService";
import type { User } from "../shared.types";
import axios from "axios";

const BASE_URL = "http://localhost:3000/api/users/";

type LoginCredentials = {
  email: string;
  password: string;
};

type SignupData = {
  email: string;
  password: string;
};

async function signup(user: SignupData): Promise<void> {
  try {
    const res = await axios.post(BASE_URL + "signup", user);
    tokenService.setToken(res.data.token);
  } catch (err) {
    console.log(err, " this is err");
    throw new Error("Email already taken!");
  }
}

function getUser(): User | null {
  return tokenService.getUserFromToken();
}

function logout(): void {
  tokenService.removeToken();
}

async function login(creds: LoginCredentials): Promise<void> {
  try {
    const res = await axios.post(BASE_URL + "login", creds);
    console.log("User Authentication Successful");
    tokenService.setToken(res.data.token);
  } catch (err) {
    console.log("err", "this is error", err);
    throw new Error("Bad Credentials!");
  }
}

async function updateProfile(user: SignupData): Promise<void> {
  try {
    const res = await axios.put(BASE_URL + "me", user, {
      headers: { Authorization: `Bearer ${tokenService.getToken()}` },
    });
    tokenService.setToken(res.data.token);
  } catch {
    throw new Error("Unable to update your profile.");
  }
}

async function deleteProfile(): Promise<void> {
  try {
    await axios.delete(BASE_URL + "me", {
      headers: { Authorization: `Bearer ${tokenService.getToken()}` },
    });
  } catch {
    throw new Error("Unable to delete your account.");
  }
}

export default {
  signup,
  getUser,
  logout,
  login,
  updateProfile,
  deleteProfile,
};
