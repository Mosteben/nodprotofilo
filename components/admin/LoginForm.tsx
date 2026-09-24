"use client";

import { useActionState } from "react";
import { LogIn } from "lucide-react";
import { signIn, type LoginState } from "@/lib/actions/auth";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/form";

export function LoginForm({ next }: { next?: string }) {
  const [state, action, pending] = useActionState<LoginState, FormData>(signIn, {});

  return (
    <form action={action} className="space-y-5" noValidate>
      <input type="hidden" name="next" value={next ?? ""} />

      {state.error && (
        <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 font-ui text-sm text-red-700">
          {state.error}
        </div>
      )}

      <Field id="email" label="البريد الإلكتروني" required>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          dir="ltr"
          required
          defaultValue={state.email}
          disabled={pending}
        />
      </Field>

      <Field id="password" label="كلمة المرور" required>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          dir="ltr"
          required
          disabled={pending}
        />
      </Field>

      <Button type="submit" size="md" className="w-full" loading={pending}>
        {!pending && <LogIn className="h-4 w-4" />}
        {pending ? "جارٍ تسجيل الدخول..." : "تسجيل الدخول"}
      </Button>
    </form>
  );
}
