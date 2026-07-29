import { z } from "zod";

const emailListField = z
  .string()
  .trim()
  .min(1, "Informe ao menos um destinatário")
  .transform((value) =>
    value
      .split(/[,;\n]/)
      .map((part) => part.trim())
      .filter(Boolean),
  )
  .pipe(
    z
      .array(z.string().email("Endereço de e-mail inválido"))
      .min(1, "Informe ao menos um destinatário"),
  );

export const composeSchema = z.object({
  to: emailListField,
  cc: z
    .string()
    .trim()
    .transform((value) =>
      value
        ? value
            .split(/[,;\n]/)
            .map((part) => part.trim())
            .filter(Boolean)
        : [],
    )
    .pipe(z.array(z.string().email("Endereço de e-mail inválido em Cc")))
    .optional(),
  subject: z.string().trim().min(1, "Informe o assunto"),
  body: z.string().trim().min(1, "Escreva uma mensagem"),
  replyToEmailId: z.string().cuid().optional(),
});

export type ComposeInput = z.infer<typeof composeSchema>;
