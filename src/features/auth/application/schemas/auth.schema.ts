import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Mínimo 6 caracteres"),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    firstName: z.string().min(2, "Nombre requerido"),
    lastName: z.string().min(2, "Apellido requerido"),
    email: z.string().email("Email inválido"),
    phone: z
      .string()
      .min(8, "Teléfono requerido")
      .max(20, "Teléfono demasiado largo"),
    password: z.string().min(6, "Mínimo 6 caracteres"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

export type RegisterInput = z.infer<typeof registerSchema>;

export const photographerOnboardingSchema = z.object({
  displayName: z.string().min(2, "Nombre requerido"),
  bio: z.string().max(500).optional(),
  websiteUrl: z.string().url().optional().or(z.literal("")),
  instagramHandle: z.string().max(50).optional(),
});

export type PhotographerOnboardingInput = z.infer<
  typeof photographerOnboardingSchema
>;
