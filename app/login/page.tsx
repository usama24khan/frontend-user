"use client";
import { useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import type { RootState } from "../../store";
import { setCredentials } from "../../store/slices/authSlice";
import { setLanguage } from "../../store/slices/uiSlice";
import { residentLogin } from "../../services";

const BLOCKS = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "P"];

export default function LoginPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const dispatch = useDispatch();
  const language = useSelector((s: RootState) => s.ui.language);
  const isAuthenticated = useSelector((s: RootState) => s.auth.isAuthenticated);

  const [plotNumber, setPlotNumber] = useState("");
  const [block, setBlock] = useState("A");
  const [credential, setCredential] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated) router.replace("/");
  }, [isAuthenticated, router]);

  const toggleLanguage = () => {
    const next = language === "en" ? "ur" : "en";
    dispatch(setLanguage(next));
    if (typeof document !== "undefined") {
      document.documentElement.dir = next === "ur" ? "rtl" : "ltr";
    }
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!plotNumber.trim() || !block || !credential.trim()) {
      setError(t("residentLogin.fillAll"));
      return;
    }
    setSubmitting(true);
    try {
      const result = await residentLogin({
        plotNumber: plotNumber.trim(),
        block,
        credential: credential.trim(),
      });
      dispatch(setCredentials({ resident: result.plot, token: result.accessToken }));
      router.replace("/");
    } catch (err: any) {
      setError(err?.message || t("residentLogin.failed"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50/60 px-4 py-10">
      <div className="w-full max-w-md">
        <div className="flex justify-end mb-3">
          <button
            type="button"
            onClick={toggleLanguage}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-gray-200 bg-white text-[12.5px] font-semibold text-gray-700 hover:border-emerald-300 hover:text-emerald-700 hover:bg-emerald-50 transition"
          >
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.9" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="9" />
              <path d="M3 12h18M12 3a14 14 0 010 18M12 3a14 14 0 000 18" />
            </svg>
            <span>{language === "en" ? "اردو" : "EN"}</span>
          </button>
        </div>

        <div className="bg-white rounded-3xl border border-gray-100 shadow-xl shadow-emerald-900/5 p-7 sm:p-9">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-linear-to-br from-emerald-500 to-emerald-600 text-white flex items-center justify-center font-bold text-base shadow-md shadow-emerald-500/25">
              K4
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-widest text-emerald-700">
                {t("app.residentPortal")}
              </p>
              <h1 className="text-[18px] font-extrabold text-gray-900 leading-tight">
                {t("residentLogin.title")}
              </h1>
            </div>
          </div>

          <p className="text-[13px] text-gray-500 mb-6">
            {t("residentLogin.subtitle")}
          </p>

          <form onSubmit={submit} className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                  {t("residentLogin.plotNumber")}
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={plotNumber}
                  onChange={(e) => setPlotNumber(e.target.value)}
                  placeholder="e.g. 374"
                  className="w-full h-11 px-3 rounded-xl border-1.5 border-gray-200 bg-gray-50 text-[14px] font-semibold text-gray-900 outline-none focus:border-emerald-500 focus:bg-white focus:ring-3 focus:ring-emerald-100 transition"
                  dir="ltr"
                  autoComplete="off"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                  {t("residentLogin.block")}
                </label>
                <select
                  value={block}
                  onChange={(e) => setBlock(e.target.value)}
                  className="w-full h-11 px-3 rounded-xl border-1.5 border-gray-200 bg-gray-50 text-[14px] font-semibold text-gray-900 outline-none focus:border-emerald-500 focus:bg-white focus:ring-3 focus:ring-emerald-100 transition cursor-pointer"
                >
                  {BLOCKS.map((b) => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                {t("residentLogin.credential")}
              </label>
              <input
                type="text"
                value={credential}
                onChange={(e) => setCredential(e.target.value)}
                placeholder={t("residentLogin.credentialPlaceholder")}
                className="w-full h-11 px-3 rounded-xl border-1.5 border-gray-200 bg-gray-50 text-[14px] font-semibold text-gray-900 outline-none focus:border-emerald-500 focus:bg-white focus:ring-3 focus:ring-emerald-100 transition"
                dir="ltr"
                autoComplete="off"
              />
              <p className="text-[11px] text-gray-400 mt-1.5">
                {t("residentLogin.credentialHint")}
              </p>
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
                  <span>{t("residentLogin.signingIn")}</span>
                </>
              ) : (
                t("residentLogin.signIn")
              )}
            </button>
          </form>

          <p className="text-[11px] text-gray-400 text-center mt-6">
            {t("residentLogin.contactAdmin")}
          </p>
        </div>
      </div>
    </div>
  );
}
