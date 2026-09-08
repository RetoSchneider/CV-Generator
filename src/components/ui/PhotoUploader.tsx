import { useEffect, useRef, useState } from "react";
import { Camera, Trash2, Upload } from "lucide-react";
import { fileToResizedDataUrl } from "../../utils/photo";
import { useT } from "../../i18n";

interface Props {
  value?: string;
  shape: "circle" | "square" | "rounded";
  onChange: (dataUrl: string | undefined) => void | Promise<void>;
  onShapeChange: (shape: "circle" | "square" | "rounded") => void;
}

export function PhotoUploader({ value, shape, onChange, onShapeChange }: Props) {
  const t = useT();
  const inputRef = useRef<HTMLInputElement>(null);
  const requestId = useRef(0);
  const processing = useRef(false);
  const [busy, setBusy] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => () => { requestId.current++; }, []);

  const handleFile = async (file: File | undefined) => {
    if (!file || processing.current) return;
    const currentRequest = ++requestId.current;
    processing.current = true;
    setBusy(true);
    setError(null);
    try {
      const url = await fileToResizedDataUrl(file, 900);
      if (currentRequest === requestId.current) await onChange(url);
    } catch {
      if (currentRequest === requestId.current) setError(t("photo.error.notImage"));
    } finally {
      processing.current = false;
      if (currentRequest === requestId.current) setBusy(false);
    }
  };

  const radiusClass =
    shape === "circle" ? "rounded-full" : shape === "rounded" ? "rounded-2xl" : "rounded-md";

  const SHAPES: { id: "circle" | "rounded" | "square"; key: string }[] = [
    { id: "circle", key: "photo.shape.circle" },
    { id: "rounded", key: "photo.shape.rounded" },
    { id: "square", key: "photo.shape.square" },
  ];

  return (
    <div className="field" aria-busy={busy}>
      <label>
        {t("photo.label")}
        <span className="text-ink-500 normal-case font-normal tracking-normal ml-1">
          · {t("photo.hint")}
        </span>
      </label>

      <div className="flex items-start gap-3">
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            handleFile(e.dataTransfer.files?.[0]);
          }}
          onClick={() => inputRef.current?.click()}
          className={`relative h-[110px] w-[110px] cursor-pointer overflow-hidden border-2 border-dashed transition ${radiusClass} ${
            dragging
              ? "border-cyan-400 bg-cyan-400/10"
              : value
              ? "border-ink-700"
              : "border-ink-700 hover:border-ink-500 bg-ink-950"
          }`}
        >
          {value ? (
            <img src={value} alt="Profile" className="h-full w-full object-cover" />
          ) : (
            <div className="grid h-full w-full place-items-center text-ink-500">
              <Camera size={20} />
            </div>
          )}
        </div>

        <div className="flex-1 space-y-2">
          <div className="flex flex-wrap gap-1.5">
            <button
              disabled={busy}
              onClick={() => inputRef.current?.click()}
              className="btn btn-ghost !py-1 !px-2 text-[12px]"
            >
              <Upload size={12} />
              {value ? t("photo.replace") : t("photo.upload")}
            </button>
            {value && (
              <button
                disabled={busy}
                onClick={() => onChange(undefined)}
                className="btn btn-danger !py-1 !px-2 text-[12px]"
              >
                <Trash2 size={12} />
                {t("photo.remove")}
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-[10.5px] font-mono uppercase tracking-[0.12em] text-ink-500">
              {t("photo.shape")}
            </span>
            {SHAPES.map((s) => {
              const active = shape === s.id;
              return (
                <button
                  key={s.id}
                  onClick={() => onShapeChange(s.id)}
                  className={`text-[11px] px-2 py-[3px] rounded border transition ${
                    active
                      ? "border-accent bg-accent/10 text-white"
                      : "border-ink-800 bg-ink-950 text-ink-300 hover:border-ink-700"
                  }`}
                >
                  {t(s.key)}
                </button>
              );
            })}
          </div>

          <p className="text-[11px] text-ink-500 leading-snug">{t("photo.help")}</p>
        </div>
      </div>

      {error && (
        <div className="text-[11.5px] text-red-400 font-mono">! {error}</div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          handleFile(e.target.files?.[0]);
          e.target.value = "";
        }}
      />
    </div>
  );
}
