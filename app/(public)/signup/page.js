"use client";

import Link from "next/link";
import { useState } from "react";

export default function SignupPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [termsAgreed, setTermsAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!termsAgreed) {
      setError("You must agree to the Terms of Service and Privacy Policy.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, fullName }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Signup failed");
        setLoading(false);
        return;
      }

      // Auto-login after signup
      const loginRes = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (loginRes.ok) {
        window.location.href = "/";
      } else {
        window.location.href = "/login";
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  return (
    <main className="flex-grow flex flex-col lg:flex-row min-h-[calc(100vh-10rem)]">
      {/* Brand Narrative & Visual Section */}
      <section className="hidden lg:flex lg:w-1/2 bg-surface-container-low relative overflow-hidden flex-col justify-center px-16 xl:px-24">
        <div className="relative z-10">
          <div className="mb-12">
            <h1 className="font-headline text-5xl xl:text-6xl text-primary font-extrabold tracking-tight leading-tight">
              Elevate the Art <br />
              of Learning.
            </h1>
            <p className="mt-6 text-on-surface-variant text-lg max-w-md leading-relaxed">
              Join a community of scholars where architectural precision meets
              editorial elegance. Your journey to mastery begins here.
            </p>
          </div>

          {/* Featured Image */}
          <div className="relative group">
            <div className="absolute -inset-4 bg-primary/5 rounded-xl rotate-2 transition-transform group-hover:rotate-1"></div>
            <div className="relative bg-surface-container-lowest p-4 rounded-xl shadow-sm overflow-hidden transform transition-transform group-hover:-translate-y-2">
              <img
                alt="Study Notes Preview"
                className="w-full h-[400px] object-cover rounded-lg"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAk6FMktYgPLW17IMEaprHE2dlp3fFeDzcp9oP19ZQ9Y2YCO0y2rXpBZzzu3u9GjLbp5mWu73H7o6sosaj6tOCnvZ-ikWtyrThjfOXU30a188uGIGOwvfd3r3fRkNH0bhM2acpEcn3iAycxBnUxZcrgW6Y3JnFIRwmTyFBldJGZHojglG-_B1TAIZCiRFV0oHc_XHFPDa3izc0BWbXQlidr9NTImkvm5-U7lzDxyWQDKoSKOo1Vl2H_B3iHpzfmaNgMYUnLkjVd2L_d"
              />
              <div className="mt-4 flex items-center justify-between">
                <span className="text-xs font-medium text-primary tracking-widest uppercase">
                  Signature Course Materials
                </span>
                <div className="flex -space-x-2">
                  <div className="w-8 h-8 rounded-full border-2 border-surface-container-lowest bg-surface-container-high"></div>
                  <div className="w-8 h-8 rounded-full border-2 border-surface-container-lowest bg-surface-container-high"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Atmospheric blur */}
        <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-primary/10 blur-[120px] rounded-full"></div>
      </section>

      {/* Sign Up Form Section */}
      <section className="w-full lg:w-1/2 flex flex-col justify-center px-6 py-12 md:px-12 xl:px-24 bg-surface">
        <div className="max-w-md mx-auto w-full">
          {/* Mobile Logo */}
          <div className="lg:hidden mb-8">
            <span className="font-headline text-2xl font-bold tracking-tight text-primary">
              Architectural Academy
            </span>
          </div>

          <header className="mb-10">
            <h2 className="font-headline text-3xl font-bold text-on-surface tracking-tight">
              Create your account
            </h2>
            <p className="text-on-surface-variant mt-2">
              Enter your details to start your academic journey.
            </p>
          </header>

          {/* Error Alert */}
          {error && (
            <div className="mb-6 p-4 bg-error-container text-on-error-container rounded-xl text-sm font-medium flex items-center gap-2">
              <span className="material-symbols-outlined text-lg">error</span>
              {error}
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Name Field */}
            <div className="space-y-1.5">
              <label
                className="block text-sm font-medium text-on-surface-variant"
                htmlFor="name"
              >
                Full Name
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline text-[20px]">
                  person
                </span>
                <input
                  className="block w-full pl-12 pr-4 py-3.5 bg-surface-container-high border-none rounded-xl focus:ring-2 focus:ring-primary/20 focus:bg-surface-container-lowest transition-all text-on-surface placeholder:text-outline outline-none"
                  id="name"
                  placeholder="John Doe"
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>
            </div>

            {/* Email Field */}
            <div className="space-y-1.5">
              <label
                className="block text-sm font-medium text-on-surface-variant"
                htmlFor="email"
              >
                Email Address
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline text-[20px]">
                  mail
                </span>
                <input
                  className="block w-full pl-12 pr-4 py-3.5 bg-surface-container-high border-none rounded-xl focus:ring-2 focus:ring-primary/20 focus:bg-surface-container-lowest transition-all text-on-surface placeholder:text-outline outline-none"
                  id="email"
                  placeholder="scholar@example.com"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            {/* Phone Field */}
            <div className="space-y-1.5">
              <label
                className="block text-sm font-medium text-on-surface-variant"
                htmlFor="phone"
              >
                Phone Number
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline text-[20px]">
                  call
                </span>
                <input
                  className="block w-full pl-12 pr-4 py-3.5 bg-surface-container-high border-none rounded-xl focus:ring-2 focus:ring-primary/20 focus:bg-surface-container-lowest transition-all text-on-surface placeholder:text-outline outline-none"
                  id="phone"
                  placeholder="+91 XXXXX XXXXX"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <label
                className="block text-sm font-medium text-on-surface-variant"
                htmlFor="password"
              >
                Password
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline text-[20px]">
                  lock
                </span>
                <input
                  className="block w-full pl-12 pr-12 py-3.5 bg-surface-container-high border-none rounded-xl focus:ring-2 focus:ring-primary/20 focus:bg-surface-container-lowest transition-all text-on-surface placeholder:text-outline outline-none"
                  id="password"
                  placeholder="••••••••"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-outline hover:text-primary transition-colors"
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {showPassword ? "visibility_off" : "visibility"}
                  </span>
                </button>
              </div>
              <p className="text-[11px] text-on-surface-variant pt-1 px-1">
                Must be at least 8 characters with one special symbol.
              </p>
            </div>

            {/* Terms Agreement */}
            <div className="flex items-start gap-3 px-1 py-2">
              <div className="flex items-center h-5">
                <input
                  className="h-4 w-4 rounded border-outline-variant text-primary focus:ring-primary"
                  id="terms"
                  type="checkbox"
                  checked={termsAgreed}
                  onChange={(e) => setTermsAgreed(e.target.checked)}
                />
              </div>
              <label
                className="text-xs text-on-surface-variant leading-normal"
                htmlFor="terms"
              >
                I agree to the{" "}
                <a
                  className="text-primary font-semibold hover:underline"
                  href="#"
                >
                  Terms of Service
                </a>{" "}
                and{" "}
                <a
                  className="text-primary font-semibold hover:underline"
                  href="#"
                >
                  Privacy Policy
                </a>
                .
              </label>
            </div>

            {/* Primary Action */}
            <button
              className="bg-signature-gradient w-full py-4 rounded-xl text-on-primary font-bold text-lg shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
              type="submit"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="material-symbols-outlined animate-spin text-lg">
                    progress_activity
                  </span>
                  Creating Account...
                </span>
              ) : (
                <>
                  Get Started
                  <span className="material-symbols-outlined text-[20px]">
                    arrow_forward
                  </span>
                </>
              )}
            </button>
          </form>

          <footer className="mt-10 text-center">
            <p className="text-on-surface-variant text-sm">
              Already have an account?
              <Link
                className="text-primary font-bold hover:underline ml-1"
                href="/login"
              >
                Sign In
              </Link>
            </p>
          </footer>
        </div>
      </section>
    </main>
  );
}
