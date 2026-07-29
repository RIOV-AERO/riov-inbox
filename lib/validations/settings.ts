import { z } from "zod";

export const settingsSchema = z.object({
  name: z.string().trim().min(1, "Informe um nome"),
  density: z.enum(["COMPACT", "COMFORTABLE", "SPACIOUS"]),
  loadExternalImages: z.boolean(),
  desktopNotifications: z.boolean(),
  signature: z.string().trim().max(2000, "Assinatura muito longa").optional(),
});

export type SettingsInput = z.infer<typeof settingsSchema>;

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Informe a senha atual"),
    newPassword: z.string().min(8, "A nova senha precisa de ao menos 8 caracteres"),
    confirmPassword: z.string().min(1, "Confirme a nova senha"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  });

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
