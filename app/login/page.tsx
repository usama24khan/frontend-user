"use client";
import { useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import type { RootState } from "../../store";
import { setCredentials } from "../../store/slices/authSlice";
import { userLogin } from "../../services";
import { getAppMode, type AppMode } from "../../services/configService";

export default function LoginPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const dispatch = useDispatch();
  const isAuthenticated = useSelector((s: RootState) => s.auth.isAuthenticated);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [appMode, setAppMode] = useState<AppMode | null>(null);

  useEffect(() => {
    if (isAuthenticated) router.replace("/");
  }, [isAuthenticated, router]);

  useEffect(() => {
    getAppMode().then(setAppMode);
  }, []);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email.trim() || !password) {
      setError(t("userLogin.fillAll"));
      return;
    }
    setSubmitting(true);
    try {
      const result = await userLogin({ email: email.trim(), password });
      dispatch(setCredentials({ user: result.user, token: result.accessToken }));
      router.replace("/");
    } catch (err: any) {
      setError(err?.message || t("userLogin.failed"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50/60 px-4 py-10">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl border border-gray-100 shadow-xl shadow-emerald-900/5 p-7 sm:p-9">
          <div className="flex items-center gap-3 mb-6">
            <img src="/icons/logo.png" alt="KKB4" className="w-12 h-12 rounded-2xl object-contain shrink-0" />
            <div>
              <div className="flex items-center gap-2">
                <p className="text-[11px] font-bold uppercase tracking-widest text-emerald-700">
                  {t("app.residentPortal")}
                </p>
                {appMode === "test" && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide bg-amber-100 text-amber-700 border border-amber-300 select-none">
                    TEST
                  </span>
                )}
              </div>
              <h1 className="text-[18px] font-extrabold text-gray-900 leading-tight">
                {t("userLogin.title")}
              </h1>
            </div>
          </div>

          <p className="text-[13px] text-gray-500 mb-6">
            {t("userLogin.subtitle")}
          </p>

          <form onSubmit={submit} className="flex flex-col gap-4">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                {t("userLogin.email")}
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t("userLogin.emailPlaceholder")}
                className="w-full h-11 px-3 rounded-xl border-1.5 border-gray-200 bg-gray-50 text-[14px] font-semibold text-gray-900 outline-none focus:border-emerald-500 focus:bg-white focus:ring-3 focus:ring-emerald-100 transition"
                dir="ltr"
                autoComplete="username"
                autoCapitalize="none"
                spellCheck={false}
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                {t("userLogin.password")}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-11 pl-3 pr-16 rounded-xl border-1.5 border-gray-200 bg-gray-50 text-[14px] font-semibold text-gray-900 outline-none focus:border-emerald-500 focus:bg-white focus:ring-3 focus:ring-emerald-100 transition"
                  dir="ltr"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute inset-y-0 right-0 px-3 text-[11px] font-bold uppercase tracking-wider text-gray-400 hover:text-emerald-700 transition"
                >
                  {showPassword ? t("userLogin.hide") : t("userLogin.show")}
                </button>
              </div>
            </div>

            {error && (
              <div className="px-3 py-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-[12.5px] font-medium">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="mt-2 h-12 rounded-xl bg-linear-to-br from-emerald-500 to-emerald-600 text-white font-bold text-[14px] shadow-md shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:opacity-95 disabled:opacity-60 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <span className="inline-block w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                  <span>{t("userLogin.signingIn")}</span>
                </>
              ) : (
                t("userLogin.signIn")
              )}
            </button>
          </form>

          <p className="text-[11px] text-gray-400 text-center mt-6">
            {t("userLogin.contactAdmin")}
          </p>
        </div>
      </div>
    </div>
  );
}
