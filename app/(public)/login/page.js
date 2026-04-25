"use client";

import Link from "next/link";
import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Login failed");
        setLoading(false);
        return;
      }

      // Redirect: use ?redirect param if present, else role-based
      if (redirectTo) {
        window.location.href = redirectTo;
      } else if (data.user?.role === "admin") {
        window.location.href = "/admin";
      } else {
        window.location.href = "/";
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  return (
    <main className="flex-grow flex flex-col md:flex-row min-h-[calc(100vh-10rem)]">
      {/* Image Side: Left */}
      <section className="hidden md:flex w-1/2 relative overflow-hidden bg-surface-container-low">
        <img
          className="absolute inset-0 w-full h-full object-cover grayscale-[20%] contrast-[1.1]"
          alt="Architectural handwritten notes and sketches on cream paper"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuDqX-cCYwQ66IPGlrZK6QG2HvQPasVPoq8Hga9o6nDWq3773KH3bQuVikCVAlsjb88cHVC9QlD8xPrrhunkiVy0pYYuFBMpgPHbPymJxX_q0nN-z1CM-Av8f2pS4ceS6BK-bAnu_n7R-IBBOONplLGs4fOQ8CnNbd1WQ81tT0KnjxOZayV6xXxBOpmC4X4SH_hJ_5UhikeW4aEgrMSyv5DqdRfhnFmX7U-gT9y0ot-hMpL6PqsZjTqPnLGx1vDQXo9iV_-8VeQR6CwH"
        />
        <div className="absolute inset-0 bg-primary/10 mix-blend-multiply"></div>

        {/* Branding Overlay */}
        <div className="relative z-10 m-12 mt-auto p-10 bg-surface/80 backdrop-blur-xl rounded-xl max-w-lg">
          <h2 className="text-3xl font-extrabold tracking-tight text-primary mb-4 font-headline">
            Elevating the art of learning.
          </h2>
          <p className="text-on-surface-variant leading-relaxed font-medium">
            Join a community of scholars dedicated to architectural excellence
            and precision. Access exclusive study guides and curated paths.
          </p>
          <div className="mt-8 flex gap-4">
            <div className="flex -space-x-3">
              <div className="w-10 h-10 rounded-full border-2 border-surface bg-primary-container flex items-center justify-center text-white text-xs font-bold">
                JD
              </div>
              <div className="w-10 h-10 rounded-full border-2 border-surface bg-tertiary-container flex items-center justify-center text-white text-xs font-bold">
                AS
              </div>
              <div className="w-10 h-10 rounded-full border-2 border-surface bg-secondary-fixed-dim flex items-center justify-center text-white text-xs font-bold">
                ML
              </div>
            </div>
            <p className="text-sm self-center text-on-surface-variant font-medium">
              Over 10,000+ students joined this month
            </p>
          </div>
        </div>
      </section>

      {/* Form Side: Right */}
      <section className="w-full md:w-1/2 flex items-center justify-center p-8 md:p-16 bg-surface">
        <div className="w-full max-w-md">
          {/* Mobile Branding */}
          <div className="md:hidden mb-12 flex flex-col items-center">
            <span className="text-2xl font-bold tracking-tight text-primary font-headline">
              Architectural Academy
            </span>
          </div>

          <div className="mb-10 text-center md:text-left">
            <h1 className="text-4xl font-extrabold tracking-tighter text-on-surface mb-2 font-headline">
              Welcome Back
            </h1>
            <p className="text-on-surface-variant font-medium">
              Please enter your details to sign in.
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-6 p-4 bg-error-container text-on-error-container rounded-xl text-sm font-medium flex items-center gap-2">
              <span className="material-symbols-outlined text-lg">error</span>
              {error}
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label
                className="block text-sm font-semibold text-on-surface-variant ml-1"
                htmlFor="email"
              >
                Email Address
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline">
                  mail
                </span>
                <input
                  className="w-full pl-12 pr-4 py-4 bg-surface-container-high border-none rounded-xl focus:ring-2 focus:ring-primary/20 focus:bg-surface-container-lowest transition-all duration-200 outline-none"
                  id="email"
                  placeholder="name@architectural.com"
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <label
                  className="block text-sm font-semibold text-on-surface-variant"
                  htmlFor="password"
                >
                  Password
                </label>
                <a
                  className="text-xs font-bold text-primary hover:underline decoration-2 underline-offset-4"
                  href="#"
                >
                  Forgot Password?
                </a>
              </div>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline">
                  lock
                </span>
                <input
                  className="w-full pl-12 pr-4 py-4 bg-surface-container-high border-none rounded-xl focus:ring-2 focus:ring-primary/20 focus:bg-surface-container-lowest transition-all duration-200 outline-none"
                  id="password"
                  placeholder="••••••••"
                  required
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <div className="flex items-center space-x-2 px-1">
              <input
                className="w-4 h-4 text-primary bg-surface-container-high border-none rounded focus:ring-primary cursor-pointer"
                id="remember"
                type="checkbox"
              />
              <label
                className="text-sm font-medium text-on-surface-variant cursor-pointer"
                htmlFor="remember"
              >
                Keep me signed in
              </label>
            </div>

            <button
              className="w-full py-4 bg-signature-gradient text-white font-bold rounded-xl hover:opacity-90 transform active:scale-[0.98] transition-all duration-200 shadow-lg shadow-primary/10 disabled:opacity-60 disabled:cursor-not-allowed"
              type="submit"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="material-symbols-outlined animate-spin text-lg">
                    progress_activity
                  </span>
                  Signing In...
                </span>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          {/* Social Login Divider */}
          <div className="mt-10">
            <div className="relative flex items-center py-4">
              <div className="flex-grow border-t border-surface-container-highest"></div>
              <span className="flex-shrink mx-4 text-xs font-bold text-outline uppercase tracking-widest">
                Or continue with
              </span>
              <div className="flex-grow border-t border-surface-container-highest"></div>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-6">
              <button className="flex items-center justify-center gap-2 py-3 px-4 bg-surface-container-lowest border border-surface-container-highest rounded-xl hover:bg-surface-container-low transition-colors duration-200">
                <img
                  alt="Google"
                  className="w-5 h-5"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDgQj8yIxfTFk3paV9hmC_Bk1nuzu2zJVWUe-m_1BKB1DKlcYsT84eyu86s9gFWwtUAjAuEF1gmb2IMPJq4Z31SzY9DkQWJenYBRMHUvOJItlS-5dJJteRD8AekdIsJibDGBHpow4dDtxBa5g1e-TOD-2TNu2HugqRLMoi_UuZ-27FP6GBAa7k3ANHCOx8o2gP078pFRdMcmg-UrmAbeHYx28lrjdq_0l5F0OUGVEz8Ez8EF5o6MVQRRbTDveNs46N35KHQt4-KIPP6"
                />
                <span className="text-sm font-semibold">Google</span>
              </button>
              <button className="flex items-center justify-center gap-2 py-3 px-4 bg-surface-container-lowest border border-surface-container-highest rounded-xl hover:bg-surface-container-low transition-colors duration-200">
                <img
                  alt="Facebook"
                  className="w-5 h-5"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBIFLxFyFTRsR5ydMrf6paP_7tgJk8OkU3wK8jIKgATiTUyefyQDY9pKcC-PGb2n0eHOcdpuXtP10lVOUNr-XG82DdCk4s7K2-C9WprjsE_QobuQRtzCnhVwOv9PKq36kD9cuoed6VncCV1W8-CNWzYaIINn39QHna1RyWai7yq8vJhTfapnACGvOIh2Oa59YpJR3GdXv6MzU4QmLbWW6Xpwz4LGPbVd1gqrMohzu1_X-6ZZ9ljsxB0IplcWzbiw4HJT2iPepHU9Vw3"
                />
                <span className="text-sm font-semibold">Facebook</span>
              </button>
            </div>
          </div>

          <p className="mt-10 text-center text-on-surface-variant font-medium">
            Don&apos;t have an account?
            <Link
              className="text-primary font-bold hover:underline decoration-2 underline-offset-4 ml-1"
              href="/signup"
            >
              Get Started
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
