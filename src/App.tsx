import { useEffect, useRef, useState } from "react";
import {
  Download,
  FileText,
  FolderOpen,
  Github,
  FileDown,
  Maximize2,
  Minus,
  Plus,
  RefreshCcw,
  Save,
  Sparkles,
  Terminal,
  Trash2,
} from "lucide-react";
import { useStore } from "./store";
import { ModernPro } from "./components/templates/ModernPro";
import { PersonalForm } from "./components/forms/PersonalForm";
import { ExperienceForm } from "./components/forms/ExperienceForm";
import {
  CertificationsForm,
  EducationForm,
  InterestsForm,
  LanguagesForm,
  ProjectsForm,
  SkillsForm,
} from "./components/forms/OtherForms";
import { MetaForm } from "./components/forms/MetaForm";
import { exportPdf } from "./utils/exportPdf";
import { exportDocx } from "./utils/exportDocx";
import { exportData, importData, hasContent } from "./utils/dataFile";
import { ConfirmDialog } from "./components/ui/ConfirmDialog";
import { LOCALES, useT } from "./i18n";
import { useConfirm } from "./ui-state/useConfirm";
import type { Locale } from "./i18n/translations";

const ZOOM_STEP = 0.1;
const MIN_ZOOM = 0.4;
const MAX_ZOOM = 1.4;

export default function App() {
  const t = useT();
  const ask = useConfirm((s) => s.ask);
  const cv = useStore((s) => s.cv);
  const reset = useStore((s) => s.reset);
  const resetToSample = useStore((s) => s.resetToSample);
  const setCV = useStore((s) => s.setCV);
  const setLocale = useStore((s) => s.setLocale);
  const currentLocale: Locale = cv.meta.locale ?? "en";

  const [zoom, setZoom] = useState(0.75);
  const [busy, setBusy] = useState<null | "pdf" | "docx">(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fit = () => {
      const w = window.innerWidth;
      const previewWidth = Math.max(420, w - 480 - 64);
      const next = Math.min(1, Math.max(MIN_ZOOM, previewWidth / 794));
      setZoom(Number(next.toFixed(2)));
    };
    fit();
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, []);

  const fileBase = (cv.personal.fullName || "cv")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-_]/g, "");

  // PDF is generated in-app (no browser print dialog) so there is never a
  // URL/date/page-number header or footer, colors fill the whole sheet, and
  // every page gets identical top & bottom margins.
  const downloadPdf = async () => {
    if (!previewRef.current) return;
    setBusy("pdf");
    try {
      await exportPdf(previewRef.current, `${fileBase || "cv"}.pdf`);
    } finally {
      setBusy(null);
    }
  };

  const downloadDocx = async () => {
    setBusy("docx");
    try {
      await exportDocx(cv, `${fileBase || "cv"}.docx`);
    } finally {
      setBusy(null);
    }
  };

  const handleSample = async () => {
    const ok = await ask({
      title: t("confirm.resetSample.title"),
      message: t("confirm.resetSample.message"),
      confirmLabel: t("confirm.resetSample.action"),
      cancelLabel: t("btn.cancel"),
    });
    if (ok) resetToSample();
  };

  const handleClear = async () => {
    const ok = await ask({
      title: t("confirm.clearAll.title"),
      message: t("confirm.clearAll.message"),
      confirmLabel: t("confirm.clearAll.action"),
      cancelLabel: t("btn.cancel"),
      danger: true,
    });
    if (ok) reset();
  };

  const handleSaveData = () => exportData(cv, fileBase || "cv");

  const handleOpenFile = async (file: File | undefined) => {
    if (!file) return;
    let next;
    try {
      next = await importData(file);
    } catch {
      await ask({
        title: t("import.error.title"),
        message: t("import.error.message"),
        confirmLabel: t("import.error.ok"),
        cancelLabel: t("import.error.ok"),
      });
      return;
    }
    if (hasContent(cv)) {
      const ok = await ask({
        title: t("confirm.import.title"),
        message: t("confirm.import.message"),
        confirmLabel: t("confirm.import.action"),
        cancelLabel: t("btn.cancel"),
        danger: true,
      });
      if (!ok) return;
    }
    setCV(next);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Top bar -------------------------------------------------------- */}
      <header className="flex items-center justify-between gap-3 px-4 py-2.5 border-b border-ink-800 bg-ink-950/70 backdrop-blur">
        <div className="flex items-center gap-2.5">
          <div className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-cyan-400 to-violet-500 text-ink-950 font-bold">
            <Terminal size={16} />
          </div>
          <div className="leading-tight">
            <div className="text-[13.5px] font-semibold text-white">
              {t("app.title")}
            </div>
            <div className="text-[10.5px] font-mono text-ink-400 tracking-wider">
              {t("app.tagline")}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Language switcher (compact) */}
          <div className="flex items-center gap-0.5 rounded-lg border border-ink-800 bg-ink-950/60 p-0.5 mr-1">
            {LOCALES.map((l) => {
              const active = currentLocale === l.id;
              return (
                <button
                  key={l.id}
                  onClick={() => setLocale(l.id)}
                  title={l.native}
                  className={`flex items-center gap-1 rounded-md px-1.5 py-1 text-[11px] font-mono transition ${
                    active
                      ? "bg-cyan-500/15 text-cyan-300"
                      : "text-ink-400 hover:text-ink-200"
                  }`}
                >
                  <span className="text-[12px] leading-none">{l.flag}</span>
                  <span>{l.label}</span>
                </button>
              );
            })}
          </div>

          <button
            onClick={handleSample}
            className="btn btn-ghost"
            title={t("bar.tooltip.sample")}
          >
            <Sparkles size={14} />
            {t("bar.sample")}
          </button>
          <button
            onClick={handleClear}
            className="btn btn-ghost"
            title={t("bar.tooltip.clear")}
          >
            <Trash2 size={14} />
            {t("bar.clear")}
          </button>
          <div className="w-px h-6 bg-ink-800 mx-1" />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="btn btn-ghost"
            title={t("bar.tooltip.open")}
          >
            <FolderOpen size={14} />
            {t("bar.open")}
          </button>
          <button
            onClick={handleSaveData}
            className="btn btn-ghost"
            title={t("bar.tooltip.save")}
          >
            <Save size={14} />
            {t("bar.save")}
          </button>
          <div className="w-px h-6 bg-ink-800 mx-1" />
          <button
            onClick={downloadDocx}
            disabled={!!busy}
            className="btn btn-ghost"
            title={t("bar.tooltip.word")}
          >
            <FileText size={14} />
            {busy === "docx" ? t("bar.savingDocx") : t("bar.word")}
          </button>
          <button
            onClick={downloadPdf}
            disabled={!!busy}
            className="btn btn-primary"
            title={t("bar.tooltip.pdf")}
          >
            <FileDown size={14} />
            {busy === "pdf" ? t("bar.savingPdf") : t("bar.pdf")}
          </button>
        </div>
      </header>

      {/* Body ---------------------------------------------------------- */}
      <div className="flex-1 grid grid-cols-[480px_1fr] min-h-0">
        <aside className="border-r border-ink-800 bg-ink-950/40 overflow-y-auto scroll-thin px-3 py-3 space-y-3">
          <PaneHint />
          <MetaForm />
          <PersonalForm />
          <ExperienceForm />
          <SkillsForm />
          <ProjectsForm />
          <EducationForm />
          <CertificationsForm />
          <LanguagesForm />
          <InterestsForm />
          <Footer />
        </aside>

        <main className="relative overflow-auto scroll-thin">
          <div className="sticky top-0 z-10 flex items-center justify-between gap-3 px-4 py-2 border-b border-ink-800 bg-ink-950/70 backdrop-blur">
            <div className="font-mono text-[11px] text-ink-400">
              <span className="text-ink-500">{t("preview.preview")}</span>{" "}
              <span className="text-cyan-400">●</span>{" "}
              <span>ModernPro.tsx</span>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                className="btn btn-ghost !py-1 !px-2"
                onClick={() => setZoom((z) => Math.max(MIN_ZOOM, +(z - ZOOM_STEP).toFixed(2)))}
              >
                <Minus size={13} />
              </button>
              <div className="font-mono text-[11px] text-ink-300 w-12 text-center">
                {Math.round(zoom * 100)}%
              </div>
              <button
                className="btn btn-ghost !py-1 !px-2"
                onClick={() => setZoom((z) => Math.min(MAX_ZOOM, +(z + ZOOM_STEP).toFixed(2)))}
              >
                <Plus size={13} />
              </button>
              <button
                className="btn btn-ghost !py-1 !px-2"
                onClick={() => setZoom(1)}
                title={t("preview.actualSize")}
              >
                <Maximize2 size={13} />
              </button>
              <button
                className="btn btn-ghost !py-1 !px-2"
                onClick={() => setZoom(0.75)}
                title={t("preview.reset")}
              >
                <RefreshCcw size={13} />
              </button>
            </div>
          </div>

          <div className="flex justify-center py-8 px-6">
            <div style={{ transform: `scale(${zoom})`, transformOrigin: "top center" }}>
              <div ref={previewRef}>
                <ModernPro cv={cv} />
              </div>
            </div>
          </div>
        </main>
      </div>

      <ConfirmDialog />

      <input
        ref={fileInputRef}
        type="file"
        accept=".json,application/json"
        className="hidden"
        onChange={(e) => {
          handleOpenFile(e.target.files?.[0]);
          e.target.value = "";
        }}
      />
    </div>
  );
}

function PaneHint() {
  const t = useT();
  // Replace the placeholders {{pdf}} / {{word}} with styled chips.
  const body = t("hint.pane.body").split(/(\{\{pdf\}\}|\{\{word\}\})/g);
  return (
    <div className="rounded-xl border border-ink-800 bg-gradient-to-br from-cyan-500/5 to-violet-500/5 px-3 py-2.5 flex items-start gap-2.5">
      <Sparkles size={14} className="text-cyan-400 shrink-0 mt-0.5" />
      <div className="text-[12px] text-ink-300 leading-snug">
        <span className="text-ink-200 font-medium">{t("hint.pane.title")}</span>{" "}
        {body.map((part, i) => {
          if (part === "{{pdf}}") return <span key={i} className="kbd">PDF</span>;
          if (part === "{{word}}") return <span key={i} className="kbd">Word</span>;
          return <span key={i}>{part}</span>;
        })}
      </div>
    </div>
  );
}

function Footer() {
  const t = useT();
  return (
    <div className="rounded-xl border border-ink-800 bg-ink-950/40 px-3 py-2.5 text-[11.5px] text-ink-400 leading-relaxed">
      <div className="flex items-center gap-1.5 mb-1 text-ink-300">
        <Github size={13} />
        <span className="font-mono text-[11px] uppercase tracking-wider">
          {t("hint.footer.title")}
        </span>
      </div>
      {t("hint.footer.body")}
      <div className="mt-2 flex items-center gap-1.5 text-ink-500">
        <Download size={12} />
        {t("hint.footer.note")}
      </div>
    </div>
  );
}
