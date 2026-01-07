import { z } from "zod";

export const registerSchema = z.object({
  email: z.string({required_error: "L'adresse e-mail est requise" }).email("Format d'email invalide"),
  password: z.string({required_error: "Le mot de passe est requis"}).min(8, "Le mot de passe doit avoir minimum 8 caractères"),
  firstName: z.string({required_error: "Le prénom est requis"}).min(2, "Le prénom doit avoir au moins 2 caractères").optional(),
  lastName: z.string({required_error: "Le nom est requis"}).min(2, "Le nom doit avoir au moins 2 caractères").optional(),
});

export const loginSchema = z.object({
  email: z.string({required_error: "L'adresse e-mail est requise" }).email("Format d'email invalide"),
  password: z.string({required_error: "Le mot de passe est requis"}).min(1, "Le mot de passe ne peut pas être vide"),
});

