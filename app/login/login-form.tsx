"use client";

import { useFormState, useFormStatus } from "react-dom";
import { loginAction } from "./actions";

function SubmitButton() {
  const { pending } = useFormStatus();
  return <button className="primaryButton full" type="submit" disabled={pending}>{pending ? "Masuk..." : "Masuk"}</button>;
}

export function LoginForm({ next }: { next?: string }) {
  const [state, formAction] = useFormState(loginAction, {});

  return (
    <form className="formStack" action={formAction}>
      <input type="hidden" name="next" value={next || ""} />
      <label>
        Username / NIM
        <input name="username" placeholder="NIM mahasiswa atau username dosen" autoComplete="username" />
      </label>
      <label>
        Password
        <input name="password" type="password" placeholder="Masukkan password" autoComplete="current-password" />
      </label>
      {state.error ? <p className="alert danger">{state.error}</p> : null}
      <SubmitButton />
    </form>
  );
}
