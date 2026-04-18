import { http, unwrapData } from "../lib/http";

export type AuthUser = { id: string; name: string; email: string };

type LoginResponse = {
  message: string;
  token: string;
  user: AuthUser;
};

type SignupResponse = {
  message: string;
  user: AuthUser;
};

export async function login(email: string, password: string): Promise<LoginResponse> {
  const { data } = await http.post<{ data: LoginResponse }>("/user/login", { email, password });
  return unwrapData(data);
}

export async function signup(name: string, email: string, password: string): Promise<SignupResponse> {
  const { data } = await http.post<{ data: SignupResponse }>("/user/signup", { name, email, password });
  return unwrapData(data);
}
