import { z } from "zod";

/** Optional text: trimmed, empty → null. */
const optional = (max: number, message: string) =>
  z
    .string()
    .trim()
    .max(max, message)
    .transform((v) => v || null);

/**
 * Contact form input. Only the message is required; name and e-mail are optional
 * (without an e-mail the owner simply cannot reply).
 */
export const contactSchema = z.object({
  name: optional(100, "الاسم طويل جدًا."),
  email: z
    .string()
    .trim()
    .max(254, "البريد الإلكتروني طويل جدًا.")
    .refine((v) => v === "" || z.email().safeParse(v).success, "هذا البريد الإلكتروني غير صحيح — صحّحه/يه أو اتركه فارغًا.")
    .transform((v) => v.toLowerCase() || null),
  message: z.string().trim().min(1, "اكتب/ي رسالتك أولًا.").max(5000, "الرسالة طويلة جدًا (5000 حرف كحد أقصى)."),
});

export type ContactInput = z.input<typeof contactSchema>;
