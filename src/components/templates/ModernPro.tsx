import {
  Mail,
  MapPin,
  Phone,
  Globe,
  Github,
  Linkedin,
  Sparkles,
} from "lucide-react";
import type { CV } from "../../types";
import { ACCENT_HEX, cleanLink, dateRange, initials, shapeToRadius } from "./shared";
import { useT } from "../../i18n";

export function ModernPro({ cv }: { cv: CV }) {
  const t = useT();
  const accent = ACCENT_HEX[cv.meta.accent];
  const compact = cv.meta.density === "compact";

  const sidebarPad = compact ? "py-5 px-5" : "py-6 px-6";
  const mainPad = compact ? "py-5 px-6" : "py-6 px-7";

  return (
    <div
      className="cv-page shadow-page mx-auto font-sans text-[12.5px] leading-[1.55]"
      style={{
        fontFeatureSettings: '"ss01","cv11"',
        // The accent strip + dark sidebar + white main are all painted as the
        // page's background itself (not overlay elements), so every band ALWAYS
        // bleeds to the true edges of the page regardless of where the content
        // ends. The PDF exporter samples its per-page background strip from
        // any row of the canvas and it is guaranteed to carry these colors —
        // no mid- or end-of-document white-out in the sidebar column.
        background: `linear-gradient(to right,
          ${accent.base} 0px, ${accent.base} 5px,
          #0b0d12 5px, #0b0d12 36%,
          #ffffff 36%, #ffffff 100%)`,
      }}
    >

      <div className="relative flex min-h-[1123px]">
        {/* SIDEBAR ---------------------------------------------------------- */}
        <aside className={`w-[36%] text-white ${sidebarPad}`}>
          {/* avatar — photo if uploaded, otherwise monogram */}
          {cv.meta.showPhotoMonogram && (
            <div className="mb-4 flex flex-col items-start gap-1.5">
              {cv.personal.photo ? (
                <div
                  className="h-40 w-40 overflow-hidden"
                  style={{
                    borderRadius: shapeToRadius(cv.personal.photoShape),
                    border: `2px solid ${accent.base}`,
                    boxShadow: `0 8px 22px -10px ${accent.base}aa`,
                  }}
                >
                  <img
                    src={cv.personal.photo}
                    alt={cv.personal.fullName}
                    className="h-full w-full object-cover"
                  />
                </div>
              ) : (
                <div
                  className="grid h-16 w-16 place-items-center rounded-2xl text-[20px] font-bold tracking-wide"
                  style={{
                    background: `linear-gradient(135deg, ${accent.base}, #1e293b)`,
                    boxShadow: `0 8px 22px -10px ${accent.base}80`,
                  }}
                >
                  {initials(cv.personal.fullName)}
                </div>
              )}
            </div>
          )}

          {/* Contact */}
          <section data-cv-block>
          <SidebarTitle accent={accent.base}>{t("cv.contact")}</SidebarTitle>
          <ul className="cv-contact space-y-2 text-[12px] leading-tight text-white/85">
            {cv.personal.location && (
              <li className="flex items-center gap-2">
                <MapPin size={13} className="shrink-0 opacity-70" />
                <span>{cv.personal.location}</span>
              </li>
            )}
            {cv.personal.email && (
              <li className="flex items-center gap-2">
                <Mail size={13} className="shrink-0 opacity-70" />
                <span className="break-all">{cv.personal.email}</span>
              </li>
            )}
            {cv.personal.phone && (
              <li className="flex items-center gap-2">
                <Phone size={13} className="shrink-0 opacity-70" />
                <span>{cv.personal.phone}</span>
              </li>
            )}
            {cv.personal.website && (
              <li className="flex items-center gap-2">
                <Globe size={13} className="shrink-0 opacity-70" />
                <span className="break-all">{cleanLink(cv.personal.website)}</span>
              </li>
            )}
            {cv.personal.github && (
              <li className="flex items-center gap-2">
                <Github size={13} className="shrink-0 opacity-70" />
                <span className="break-all">{cleanLink(cv.personal.github)}</span>
              </li>
            )}
            {cv.personal.linkedin && (
              <li className="flex items-center gap-2">
                <Linkedin size={13} className="shrink-0 opacity-70" />
                <span className="break-all">{cleanLink(cv.personal.linkedin)}</span>
              </li>
            )}
          </ul>
          </section>

          {/* Skills */}
          {cv.skills.length > 0 && (
            <section className="mt-5" data-cv-block>
              <SidebarTitle accent={accent.base}>{t("cv.skills")}</SidebarTitle>
              <div className="space-y-3">
                {cv.skills.map((g) => (
                  <div key={g.id}>
                    <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-white/55 mb-2">
                      {g.label}
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {g.items.map((s) => (
                        <span
                          key={s}
                          className="cv-chip inline-flex items-center rounded-md px-2.5 py-[4px] text-[11px] leading-none text-white/90 whitespace-nowrap"
                          style={{
                            background: "rgba(255,255,255,0.06)",
                            border: "1px solid rgba(255,255,255,0.10)",
                          }}
                        >
                          <span className="cv-chip-label">{s}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Languages */}
          {cv.languages.length > 0 && (
            <section className="mt-5" data-cv-block>
              <SidebarTitle accent={accent.base}>{t("cv.languages")}</SidebarTitle>
              <ul className="space-y-1.5">
                {cv.languages.map((l) => (
                  <li key={l.id} className="text-[12px] text-white/85">
                    <div className="flex items-center justify-between gap-2">
                      <span>{l.name}</span>
                      <span className="text-[11px] text-white/55 font-mono">
                        {t(`level.${l.level}`)}
                        {l.cefr ? ` · ${l.cefr}` : ""}
                      </span>
                    </div>
                    {l.certificate && (
                      <div className="text-[10.5px] text-white/45 leading-snug">
                        {l.certificate}
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Interests */}
          {cv.interests.length > 0 && (
            <section className="mt-5" data-cv-block>
              <SidebarTitle accent={accent.base}>{t("cv.interests")}</SidebarTitle>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {cv.interests.map((i) => (
                  <span
                    key={i.id}
                    className="cv-chip inline-flex items-center rounded-full px-3 py-[4px] text-[11px] leading-none text-white/85 whitespace-nowrap"
                    style={{
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(255,255,255,0.10)",
                    }}
                  >
                    <span className="cv-chip-label">{i.label}</span>
                  </span>
                ))}
              </div>
            </section>
          )}

          {/* Certifications */}
          {cv.certifications.length > 0 && (
            <section className="mt-5" data-cv-block>
              <SidebarTitle accent={accent.base}>{t("cv.certifications")}</SidebarTitle>
              <ul className="space-y-1.5 text-[12px]">
                {cv.certifications.map((c) => (
                  <li key={c.id} className="text-white/85">
                    <div className="font-medium">{c.name}</div>
                    <div className="text-[11px] text-white/55">
                      {[c.issuer, c.year].filter(Boolean).join(" · ")}
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </aside>

        {/* MAIN ------------------------------------------------------------ */}
        <main className={`flex-1 ${mainPad} text-ink-900 bg-white`}>
          {/* Header */}
          <header className="mb-4" data-cv-block>
            <div
              className="font-mono text-[10.5px] uppercase tracking-[0.28em]"
              style={{ color: accent.deep }}
            >
              {t("cv.label")}
            </div>
            <h1 className="font-display text-[32px] leading-[1.05] font-bold text-ink-900 mt-1">
              {cv.personal.fullName || "Your Name"}
            </h1>
            <div className="mt-1 flex items-center gap-2 text-[13.5px] text-ink-700">
              <span style={{ color: accent.base }}>▍</span>
              <span className="font-medium">{cv.personal.title}</span>
              {cv.personal.pronouns && (
                <span className="text-ink-400 text-[12px] font-mono">
                  ({cv.personal.pronouns})
                </span>
              )}
            </div>
          </header>

          {/* Summary */}
          {cv.summary && (
            <Block accent={accent.base} title={t("cv.profile")} icon={<Sparkles size={13} />}>
              <p className="text-[12.5px] text-ink-700 leading-[1.6]">{cv.summary}</p>
            </Block>
          )}

          {/* Experience */}
          {cv.experience.length > 0 && (
            <Block accent={accent.base} title={t("cv.experience")} mode="split">
              <ol className="relative space-y-3 border-l border-ink-200 pl-4">
                {cv.experience.map((e) => (
                  <li key={e.id} className="relative" data-cv-block>
                    <span
                      className="cv-exp-dot absolute -left-[19px] top-1.5 grid h-2.5 w-2.5 place-items-center rounded-full"
                      style={{
                        background: e.isBreak ? "#9ca3af" : accent.base,
                        boxShadow: `0 0 0 3px ${e.isBreak ? "#e5e7eb" : accent.soft}`,
                      }}
                    />
                    <div className="flex items-baseline justify-between gap-3">
                      <div>
                        <div
                          className={`cv-exp-role text-[13.5px] ${
                            e.isBreak
                              ? "font-medium italic text-ink-500"
                              : "font-semibold text-ink-900"
                          }`}
                        >
                          {e.role}
                        </div>
                        <div className={`text-[12.5px] ${e.isBreak ? "text-ink-400 italic" : "text-ink-600"}`}>
                          {e.company}
                          {e.location && (
                            <span className="text-ink-400"> · {e.location}</span>
                          )}
                        </div>
                      </div>
                      <div className="text-[11px] font-mono text-ink-500 whitespace-nowrap">
                        {dateRange(e.start, e.end)}
                      </div>
                    </div>
                    {e.highlights.filter(Boolean).length > 0 && (
                      <ul className="mt-1.5 space-y-1">
                        {e.highlights.filter(Boolean).map((h, i) => (
                          <li
                            key={i}
                            className={`text-[12px] leading-[1.55] pl-3.5 relative ${
                              e.isBreak ? "text-ink-400" : "text-ink-700"
                            }`}
                          >
                            <span
                              className="cv-bullet-dot absolute left-0 top-[8px] h-[5px] w-[5px] rounded-sm"
                              style={{ background: e.isBreak ? "#9ca3af" : accent.base }}
                            />
                            {h}
                          </li>
                        ))}
                      </ul>
                    )}
                    {e.stack.length > 0 && (
                      <div className="mt-1.5 -mb-1">
                        {e.stack.map((s) => (
                          <span
                            key={s}
                            className="inline-block align-top leading-none mr-1 mb-1 text-[10.5px] font-mono px-1.5 py-[3px] rounded whitespace-nowrap"
                            style={
                              e.isBreak
                                ? { background: "#f1f5f9", color: "#94a3b8" }
                                : { background: accent.soft, color: accent.deep }
                            }
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    )}
                  </li>
                ))}
              </ol>
            </Block>
          )}

          {/* Projects */}
          {cv.projects.length > 0 && (
            <Block accent={accent.base} title={t("cv.projects")} mode="split">
              <div className="space-y-3">
                {cv.projects.map((p) => (
                  <div key={p.id} data-cv-block>
                    <div className="flex items-baseline justify-between gap-2">
                      <div className="text-[13px] font-semibold text-ink-900">
                        {p.name}
                      </div>
                      {p.link && (
                        <div className="text-[11px] font-mono text-ink-500">
                          {cleanLink(p.link)}
                        </div>
                      )}
                    </div>
                    {p.tagline && (
                      <div className="text-[12px] text-ink-600">{p.tagline}</div>
                    )}
                    {p.highlights.filter(Boolean).length > 0 && (
                      <ul className="mt-1 space-y-0.5">
                        {p.highlights.filter(Boolean).map((h, i) => (
                          <li
                            key={i}
                            className="text-[12px] text-ink-700 pl-3.5 relative"
                          >
                            <span
                              className="cv-bullet-dot absolute left-0 top-[8px] h-[5px] w-[5px] rounded-sm"
                              style={{ background: accent.base }}
                            />
                            {h}
                          </li>
                        ))}
                      </ul>
                    )}
                    {p.stack.length > 0 && (
                      <div className="mt-1 -mb-1">
                        {p.stack.map((s) => (
                          <span
                            key={s}
                            className="inline-block align-top leading-none mr-1 mb-1 text-[10.5px] font-mono px-1.5 py-[3px] rounded text-ink-600 border border-ink-200 whitespace-nowrap"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </Block>
          )}

          {/* Education */}
          {cv.education.length > 0 && (
            <Block accent={accent.base} title={t("cv.education")} mode="split">
              <div className="space-y-2.5">
                {cv.education.map((e) => (
                  <div key={e.id} className="flex items-baseline justify-between gap-3" data-cv-block>
                    <div>
                      <div className="text-[13px] font-semibold text-ink-900">
                        {e.credential}
                      </div>
                      <div className="text-[12px] text-ink-600">
                        {e.institution}
                        {e.location && (
                          <span className="text-ink-400"> · {e.location}</span>
                        )}
                      </div>
                      {e.notes && (
                        <div className="text-[11.5px] text-ink-500 mt-0.5">{e.notes}</div>
                      )}
                    </div>
                    <div className="text-[11px] font-mono text-ink-500 whitespace-nowrap">
                      {dateRange(e.start, e.end)}
                    </div>
                  </div>
                ))}
              </div>
            </Block>
          )}

        </main>
      </div>
    </div>
  );
}

function SidebarTitle({
  children,
  accent,
  className = "",
}: {
  children: React.ReactNode;
  accent: string;
  className?: string;
}) {
  return (
    <div className={`mb-2 flex items-center gap-2 ${className}`}>
      <span className="cv-rule-grow h-px flex-1" style={{ background: "rgba(255,255,255,0.18)" }} />
      <span
        className="cv-title-label font-mono text-[10.5px] uppercase leading-none tracking-[0.22em]"
        style={{ color: accent }}
      >
        {children}
      </span>
      <span className="h-px w-4" style={{ background: "rgba(255,255,255,0.18)" }} />
    </div>
  );
}

function Block({
  title,
  accent,
  icon,
  children,
  mode = "atomic",
}: {
  title: string;
  accent: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  /**
   * "atomic": the whole section is one un-splittable page-break unit (short
   * sections). "split": only the heading is a unit; children carry their own
   * `data-cv-block` so the section can break between them (long lists).
   */
  mode?: "atomic" | "split";
}) {
  return (
    <section className="mb-4" {...(mode === "atomic" ? { "data-cv-block": "" } : {})}>
      <div
        className="cv-heading mb-1.5 flex items-center gap-2"
        {...(mode === "split" ? { "data-cv-block": "" } : {})}
      >
        <span
          className="grid h-5 w-5 place-items-center rounded text-white"
          style={{ background: accent }}
        >
          {icon ?? <span className="block h-1.5 w-1.5 rounded-sm bg-white" />}
        </span>
        <h2 className="cv-heading-label font-display text-[15px] font-bold tracking-[-0.01em] text-ink-900">
          {title}
        </h2>
        <span className="ml-2 h-px flex-1 bg-ink-200" />
      </div>
      {children}
    </section>
  );
}
