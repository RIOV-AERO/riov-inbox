"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth/session";
import {
  settingsSchema,
  changePasswordSchema,
  addRegisteredEmailSchema,
} from "@/lib/validations/settings";
import { hashPassword, verifyPassword } from "@/lib/auth/password";

export type ProfileState = { error?: string; success?: boolean };

export async function updateProfileAction(
  _prev: ProfileState,
  formData: FormData,
): Promise<ProfileState> {
  const user = await requireUser();

  const parsed = settingsSchema
    .pick({ name: true, signature: true })
    .safeParse({
      name: formData.get("name"),
      signature: formData.get("signature") ?? "",
    });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { name: parsed.data.name, signature: parsed.data.signature || null },
  });

  revalidatePath("/settings");
  return { success: true };
}

const densityEnum = z.enum(["COMPACT", "COMFORTABLE", "SPACIOUS"]);

export async function setDensityAction(density: string): Promise<void> {
  const user = await requireUser();
  const parsed = densityEnum.safeParse(density);
  if (!parsed.success) return;

  await prisma.user.update({
    where: { id: user.id },
    data: { density: parsed.data },
  });
  revalidatePath("/settings");
}

export async function setLoadExternalImagesAction(
  value: boolean,
): Promise<void> {
  const user = await requireUser();
  await prisma.user.update({
    where: { id: user.id },
    data: { loadExternalImages: value },
  });
  revalidatePath("/settings");
}

export async function setDesktopNotificationsAction(
  value: boolean,
): Promise<void> {
  const user = await requireUser();
  await prisma.user.update({
    where: { id: user.id },
    data: { desktopNotifications: value },
  });
  revalidatePath("/settings");
}

export type ChangePasswordState = { error?: string; success?: boolean };

export async function changePasswordAction(
  _prev: ChangePasswordState,
  formData: FormData,
): Promise<ChangePasswordState> {
  const user = await requireUser();

  const parsed = changePasswordSchema.safeParse({
    currentPassword: formData.get("currentPassword"),
    newPassword: formData.get("newPassword"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  }

  const record = await prisma.user.findUniqueOrThrow({
    where: { id: user.id },
    select: { passwordHash: true },
  });

  const valid = await verifyPassword(
    parsed.data.currentPassword,
    record.passwordHash,
  );
  if (!valid) return { error: "Senha atual incorreta" };

  const passwordHash = await hashPassword(parsed.data.newPassword);
  await prisma.user.update({ where: { id: user.id }, data: { passwordHash } });

  return { success: true };
}

export type ActionState = { error?: string; success?: boolean };

export async function addRegisteredEmailAction(
  email: string,
): Promise<ActionState> {
  const user = await requireUser();

  const parsed = addRegisteredEmailSchema.safeParse({ email });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Endereço inválido" };
  }

  const target = parsed.data.email;
  const currentEmails = user.registeredEmails || [];

  if (target === user.email.toLowerCase() || currentEmails.includes(target)) {
    return { error: "Este endereço já está cadastrado em sua conta." };
  }

  const updatedEmails = [...currentEmails, target];

  await prisma.user.update({
    where: { id: user.id },
    data: { registeredEmails: updatedEmails },
  });

  revalidatePath("/(app)", "layout");
  return { success: true };
}

export async function removeRegisteredEmailAction(
  email: string,
): Promise<ActionState> {
  const user = await requireUser();

  const target = email.trim().toLowerCase();
  const currentEmails = user.registeredEmails || [];

  const updatedEmails = currentEmails.filter((e) => e !== target);

  await prisma.user.update({
    where: { id: user.id },
    data: { registeredEmails: updatedEmails },
  });

  revalidatePath("/(app)", "layout");
  return { success: true };
}

export async function setReceiveUnregisteredEmailsAction(
  value: boolean,
): Promise<void> {
  const user = await requireUser();
  await prisma.user.update({
    where: { id: user.id },
    data: { receiveUnregisteredEmails: value },
  });
  revalidatePath("/(app)", "layout");
}
