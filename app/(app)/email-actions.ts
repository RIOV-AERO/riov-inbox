"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth/session";

const REVALIDATE_PATHS = ["/inbox", "/sent", "/archived", "/trash"];

function revalidateAll() {
  for (const path of REVALIDATE_PATHS) revalidatePath(path);
}

export async function markReadAction(emailId: string, read: boolean): Promise<void> {
  await requireUser();
  await prisma.email.update({ where: { id: emailId }, data: { read } });
  revalidateAll();
}

export async function archiveEmailAction(emailId: string): Promise<void> {
  await requireUser();
  await prisma.email.update({ where: { id: emailId }, data: { archived: true } });
  revalidateAll();
}

export async function unarchiveEmailAction(emailId: string): Promise<void> {
  await requireUser();
  await prisma.email.update({ where: { id: emailId }, data: { archived: false } });
  revalidateAll();
}

export async function trashEmailAction(emailId: string): Promise<void> {
  await requireUser();
  await prisma.email.update({
    where: { id: emailId },
    data: { deletedAt: new Date(), archived: false },
  });
  revalidateAll();
}

export async function restoreEmailAction(emailId: string): Promise<void> {
  await requireUser();
  await prisma.email.update({ where: { id: emailId }, data: { deletedAt: null } });
  revalidateAll();
}
