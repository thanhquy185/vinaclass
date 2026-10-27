import type { ReactNode } from "react";
import {
  ArrowUpRight,
  BookOpenCheck,
  GraduationCap,
  Sparkles,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import Logo from "@/shared/components/ui/Logo/Logo";
import "@/features/auth/components/auth.css";

type Props = {
  children: ReactNode;
  compact?: boolean;
};

export default function AuthTemplate({ children, compact = false }: Props) {
  const { t } = useTranslation();

  return (
    <main className="auth-shell">
      <section className="auth-story" aria-label="VinaClass">
        <div className="auth-story__top">
          <Logo large />
          <span className="auth-story__badge">
            <Sparkles size={14} aria-hidden="true" />
            {t("auth.badge")}
          </span>
        </div>
        <div className="auth-story__copy">
          <p className="auth-eyebrow">{t("auth.eyebrow")}</p>
          <h1>
            {t("auth.heroTitle")}
            <br />
            <span>{t("auth.heroHighlight")}</span>
          </h1>
          <p className="auth-story__description">{t("auth.description")}</p>
        </div>
        <div className="auth-visual" aria-hidden="true">
          <div className="auth-visual__orb auth-visual__orb--one" />
          <div className="auth-visual__orb auth-visual__orb--two" />
          <div className="auth-visual__card auth-visual__card--main">
            <div className="auth-visual__card-heading">
              <span className="auth-visual__icon">
                <BookOpenCheck size={20} />
              </span>
              <span className="auth-visual__overline">
                {t("auth.visualLabel")}
              </span>
              <ArrowUpRight size={17} className="auth-visual__arrow" />
            </div>
            <strong>{t("auth.visualTitle")}</strong>
            <span className="auth-visual__muted">
              {t("auth.visualDescription")}
            </span>
            <div className="auth-visual__progress">
              <span />
            </div>
            <div className="auth-visual__meta">
              <span>{t("auth.progressLabel")}</span>
              <b>{t("auth.progressValue")}</b>
            </div>
          </div>
          <div className="auth-visual__floating">
            <span className="auth-visual__floating-icon">
              <GraduationCap size={20} />
            </span>
            <span>
              <strong>{t("auth.floatingTitle")}</strong>
              <small>{t("auth.floatingSubtitle")}</small>
            </span>
          </div>
          <div className="auth-visual__dot auth-visual__dot--one" />
          <div className="auth-visual__dot auth-visual__dot--two" />
        </div>
        <p className="auth-story__footer">{t("auth.storyFooter")}</p>
      </section>
      <section className={`auth-panel ${compact ? "auth-panel--compact" : ""}`}>
        <div className="auth-panel__mobile-brand">
          <Logo large />
        </div>
        <div className={`auth-card ${compact ? "auth-card--compact" : ""}`}>
          {children}
        </div>
        <p className="auth-panel__footer">
          © {new Date().getFullYear()} VinaClass
          <span aria-hidden="true">·</span>
          {t("auth.copyrightCaption")}
        </p>
      </section>
    </main>
  );
}
