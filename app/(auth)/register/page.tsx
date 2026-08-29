import type { Metadata } from "next";
import { RegisterForm } from "./register-form";

export const metadata: Metadata = { title: "Sign up — Expenso" };

export default function RegisterPage() {
  return <RegisterForm />;
}
