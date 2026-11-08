"use client";

import Link from "next/link";
import { useActionState } from "react";
import { login, register, updateProfile, type ActionState } from "@/app/actions/auth";
import { DISTRICTS } from "@/lib/constants";

export function LoginForm({ next }: { next?: string }) {
  const [state, action, pending] = useActionState(login, undefined as ActionState);
  return (
    <form action={action} className="authForm">
      {state?.error ? <p className="notice error">{state.error}</p> : null}
      <input type="hidden" name="next" value={next ?? ""} />
      <label>
        Email
        <input name="email" type="email" required autoComplete="email" placeholder="you@email.com" />
      </label>
      <label>
        Password
        <input name="password" type="password" required autoComplete="current-password" />
      </label>
      <button className="btn dark" disabled={pending}>
        {pending ? "Please wait…" : "Log in"}
      </button>
      <p>
        New here? <Link href={`/register${next ? `?next=${encodeURIComponent(next)}` : ""}`}>Create an account</Link>
      </p>
    </form>
  );
}

export function RegisterForm({ next }: { next?: string }) {
  const [state, action, pending] = useActionState(register, undefined as ActionState);
  return (
    <form action={action} className="authForm">
      {state?.error ? <p className="notice error">{state.error}</p> : null}
      <input type="hidden" name="next" value={next ?? ""} />
      <label>
        Full name
        <input name="name" required minLength={2} placeholder="Your name" />
      </label>
      <label>
        Email
        <input name="email" type="email" required autoComplete="email" />
      </label>
      <label>
        Mobile
        <input name="phone" required inputMode="numeric" pattern="01[3-9][0-9]{8}" placeholder="01XXXXXXXXX" />
      </label>
      <label>
        Password
        <input name="password" type="password" required minLength={8} autoComplete="new-password" />
      </label>
      <label>
        District
        <select name="district" defaultValue="">
          <option value="">Select district</option>
          {DISTRICTS.map((district) => (
            <option key={district}>{district}</option>
          ))}
        </select>
      </label>
      <label>
        Address
        <textarea name="address" rows={3} placeholder="House, road, area" />
      </label>
      <button className="btn dark" disabled={pending}>
        {pending ? "Creating account…" : "Create account"}
      </button>
      <p>
        Already registered? <Link href={`/login${next ? `?next=${encodeURIComponent(next)}` : ""}`}>Log in</Link>
      </p>
    </form>
  );
}

export function ProfileForm({
  user,
}: {
  user: { name: string; phone: string; district: string; address: string; email: string };
}) {
  const [state, action, pending] = useActionState(updateProfile, undefined as ActionState);
  return (
    <form action={action} className="authForm">
      {state?.error ? <p className="notice error">{state.error}</p> : null}
      {state?.ok ? <p className="notice ok">{state.ok}</p> : null}
      <label>
        Full name
        <input name="name" required defaultValue={user.name} />
      </label>
      <label>
        Email
        <input value={user.email} disabled />
      </label>
      <label>
        Mobile
        <input name="phone" required defaultValue={user.phone} pattern="01[3-9][0-9]{8}" />
      </label>
      <label>
        District
        <select name="district" defaultValue={user.district}>
          <option value="">Select district</option>
          {DISTRICTS.map((district) => (
            <option key={district}>{district}</option>
          ))}
        </select>
      </label>
      <label>
        Address
        <textarea name="address" rows={3} defaultValue={user.address} />
      </label>
      <label>
        Current password
        <input name="currentPassword" type="password" autoComplete="current-password" />
      </label>
      <label>
        New password
        <input name="newPassword" type="password" minLength={8} autoComplete="new-password" placeholder="Leave blank to keep the current password" />
      </label>
      <button className="btn dark" disabled={pending}>
        {pending ? "Saving…" : "Save profile"}
      </button>
    </form>
  );
}
