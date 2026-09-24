"use client";

import { useActionState } from "react";
import { CheckCircle2, LogIn, UserPlus, Save } from "lucide-react";
import { registerAccount, signInAccount, updateAccountName, type AccountFormState } from "@/lib/actions/account";
import { Button } from "@/components/ui/Button";
import { Field, Input, describedBy } from "@/components/ui/form";

function Alert({ state }: { state: AccountFormState }) {
  if (!state.message) return null;
  const success = state.status === "success";
  return (
    <div
      role={success ? "status" : "alert"}
      className={`rounded-xl border px-4 py-3 font-ui text-sm flex gap-2 ${success ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-red-200 bg-red-50 text-red-700"}`}
    >
      {success && <CheckCircle2 className="h-5 w-5 shrink-0" />}
      {state.message}
    </div>
  );
}

export function LoginForm({ next, notice }: { next?: string; notice?: string }) {
  const [state, action, pending] = useActionState<AccountFormState, FormData>(signInAccount, { status: "idle", message: notice });
  const e = state.fieldErrors ?? {};
  return (
    <form action={action} className="space-y-5" noValidate>
      <input type="hidden" name="next" value={next ?? ""} />
      <Alert state={state} />
      <Field id="email" label="البريد الإلكتروني" error={e.email} required>
        <Input {...describedBy("email", e.email)} name="email" type="email" dir="ltr" autoComplete="email" defaultValue={state.email} disabled={pending} required />
      </Field>
      <Field id="password" label="كلمة المرور" error={e.password} required>
        <Input {...describedBy("password", e.password)} name="password" type="password" dir="ltr" autoComplete="current-password" disabled={pending} required />
      </Field>
      <Button type="submit" className="w-full" loading={pending}>
        {!pending && <LogIn className="h-4 w-4" />}
        تسجيل الدخول
      </Button>
    </form>
  );
}

export function RegisterForm() {
  const [state, action, pending] = useActionState<AccountFormState, FormData>(registerAccount, { status: "idle" });
  const e = state.fieldErrors ?? {};
  if (state.status === "success") return <Alert state={state} />;
  return (
    <form action={action} className="space-y-5" noValidate>
      <Alert state={state} />
      <Field id="name" label="الاسم" error={e.name} hint="يظهر مع تعليقاتك غير المجهولة." required>
        <Input {...describedBy("name", e.name, "hint")} name="name" autoComplete="name" maxLength={80} defaultValue={state.name} disabled={pending} required />
      </Field>
      <Field id="email" label="البريد الإلكتروني" error={e.email} required>
        <Input {...describedBy("email", e.email)} name="email" type="email" dir="ltr" autoComplete="email" defaultValue={state.email} disabled={pending} required />
      </Field>
      <Field id="password" label="كلمة المرور" error={e.password} hint="8 أحرف على الأقل." required>
        <Input {...describedBy("password", e.password, "hint")} name="password" type="password" dir="ltr" autoComplete="new-password" disabled={pending} required />
      </Field>
      <Field id="confirm" label="تأكيد كلمة المرور" error={e.confirm} required>
        <Input {...describedBy("confirm", e.confirm)} name="confirm" type="password" dir="ltr" autoComplete="new-password" disabled={pending} required />
      </Field>
      <Button type="submit" className="w-full" loading={pending}>
        {!pending && <UserPlus className="h-4 w-4" />}
        إنشاء الحساب
      </Button>
    </form>
  );
}

export function AccountNameForm({ name }: { name: string }) {
  const [state, action, pending] = useActionState<AccountFormState, FormData>(updateAccountName, { status: "idle", name });
  const e = state.fieldErrors ?? {};
  return (
    <form action={action} className="space-y-4" noValidate>
      <Alert state={state} />
      <Field id="name" label="الاسم المعروض" error={e.name}>
        <Input {...describedBy("name", e.name)} name="name" maxLength={80} defaultValue={state.name ?? name} disabled={pending} />
      </Field>
      <Button type="submit" size="sm" loading={pending}>
        {!pending && <Save className="h-4 w-4" />}
        حفظ
      </Button>
    </form>
  );
}
