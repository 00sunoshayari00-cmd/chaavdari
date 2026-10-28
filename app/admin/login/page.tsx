// app/admin/login/page.tsx
import { AuthError } from "next-auth";
import { redirect } from "next/navigation";
import { signIn } from "@/auth";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  async function login(formData: FormData) {
    "use server";
    try {
      await signIn("credentials", {
        email: formData.get("email"),
        password: formData.get("password"),
        redirectTo: "/admin",
      });
    } catch (e) {
      if (e instanceof AuthError) redirect("/admin/login?error=1");
      throw e; // lets the successful-login redirect go through
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-neutral-50 px-4">
      <form
        action={login}
        className="w-full max-w-sm space-y-4 rounded-2xl bg-white p-8 shadow"
      >
        <h1 className="text-2xl font-semibold">Admin login</h1>

        {error && (
          <p
            role="alert"
            className="rounded-md bg-red-50 p-3 text-sm text-red-700"
          >
            Invalid email or password.
          </p>
        )}

        <label className="block text-sm font-medium">
          Email
          <input
            name="email"
            type="email"
            required
            autoComplete="email"
            className="mt-1 w-full rounded-md border px-3 py-2"
          />
        </label>

        <label className="block text-sm font-medium">
          Password
          <input
            name="password"
            type="password"
            required
            minLength={8}
            autoComplete="current-password"
            className="mt-1 w-full rounded-md border px-3 py-2"
          />
        </label>

        <button
          type="submit"
          className="w-full rounded-full bg-[#F26A0F] py-2.5 font-semibold text-white hover:bg-[#D95B08]"
        >
          Sign in
        </button>
      </form>
    </main>
  );
}
