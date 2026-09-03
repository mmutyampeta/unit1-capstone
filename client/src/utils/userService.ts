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

export default {
  signup,
  getUser,
  logout,
  login,
};
