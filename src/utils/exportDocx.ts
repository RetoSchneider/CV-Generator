import {
  AlignmentType,
  BorderStyle,
  Document,
  HeadingLevel,
  ImageRun,
  Packer,
  Paragraph,
  TextRun,
  TabStopType,
} from "docx";
import { saveAs } from "file-saver";
import type { CV } from "../types";
import { ACCENT_HEX, cleanLink, dateRange } from "../components/templates/shared";
import { dataUrlToBytes, dataUrlSize } from "./photo";
import { translate } from "../i18n/translations";

/**
 * Generates a clean, ATS-friendly Word document.
 * The DOCX intentionally trades the on-screen visual flair for maximum
 * compatibility with applicant tracking systems and recruiter-side tooling.
 * The on-screen design lives in the PDF; the DOCX is the bullet-proof option.
 */
export async function exportDocx(cv: CV, fileName = "cv.docx") {
  const accent = ACCENT_HEX[cv.meta.accent].deep.replace("#", "");
  const loc = cv.meta.locale ?? "en";
  const t = (key: string, vars?: Record<string, string>) => translate(loc, key, vars);

  const children: Paragraph[] = [];

  // Photo (optional) — sits above the name, right-aligned to keep the
  // text block left-aligned and ATS-readable.
  if (cv.meta.showPhotoMonogram && cv.personal.photo) {
    try {
      const bytes = dataUrlToBytes(cv.personal.photo);
      const { w, h } = await dataUrlSize(cv.personal.photo);
      const targetW = 140;
      const targetH = Math.round((targetW * h) / w);
      const isPng = cv.personal.photo.startsWith("data:image/png");
      children.push(
        new Paragraph({
          alignment: AlignmentType.RIGHT,
          children: [
            new ImageRun({
              data: bytes,
              transformation: { width: targetW, height: targetH },
              type: isPng ? "png" : "jpg",
            } as ConstructorParameters<typeof ImageRun>[0]),
          ],
        })
      );
    } catch {
      // Silently skip photo if decoding fails — the rest of the CV still exports.
    }
  }

  // Name
  children.push(
    new Paragraph({
      alignment: AlignmentType.LEFT,
      children: [
        new TextRun({
          text: cv.personal.fullName || "Your Name",
          bold: true,
          size: 44, // 22pt
        }),
      ],
    })
  );

  // Title
  if (cv.personal.title) {
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: cv.personal.title,
            color: accent,
            size: 24, // 12pt
            bold: true,
          }),
        ],
      })
    );
  }

  // Contact line
  const contact = [
    cv.personal.location,
    cv.personal.email,
    cv.personal.phone,
    cv.personal.website && cleanLink(cv.personal.website),
    cv.personal.github && cleanLink(cv.personal.github),
    cv.personal.linkedin && cleanLink(cv.personal.linkedin),
  ]
    .filter(Boolean)
    .join("  ·  ");
  if (contact) {
    children.push(
      new Paragraph({
        spacing: { after: 200 },
        children: [new TextRun({ text: contact, size: 20, color: "555555" })],
      })
    );
  }

  // Summary
  if (cv.summary) {
    sectionHeader(children, t("cv.profile"), accent);
    children.push(
      new Paragraph({
        spacing: { after: 200 },
        children: [new TextRun({ text: cv.summary, size: 22 })],
      })
    );
  }

  // Experience
  if (cv.experience.length > 0) {
    sectionHeader(children, t("cv.experience"), accent);
    for (const e of cv.experience) {
      // Role @ Company  ........... date
      children.push(
        new Paragraph({
          tabStops: [{ type: TabStopType.RIGHT, position: 9000 }],
          children: [
            new TextRun({
              text: `${e.role}${e.company ? `  ·  ${e.company}` : ""}`,
              bold: true,
              size: 22,
            }),
            ...(e.location
              ? [new TextRun({ text: `  ·  ${e.location}`, color: "777777", size: 20 })]
              : []),
            new TextRun({ text: "\t", size: 20 }),
            new TextRun({
              text: dateRange(e.start, e.end),
              color: "555555",
              size: 20,
            }),
          ],
        })
      );
      if (e.isBreak) {
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: t("cv.breakNote"),
                italics: true,
                color: "888888",
                size: 18,
              }),
            ],
          })
        );
      }
      for (const h of e.highlights.filter(Boolean)) {
        children.push(
          new Paragraph({
            bullet: { level: 0 },
            children: [new TextRun({ text: h, size: 22 })],
          })
        );
      }
      if (e.stack.length > 0) {
        children.push(
          new Paragraph({
            spacing: { after: 160 },
            children: [
              new TextRun({
                text: `${t("cv.tech")}: ${e.stack.join(", ")}`,
                italics: true,
                color: "555555",
                size: 20,
              }),
            ],
          })
        );
      } else {
        children.push(new Paragraph({ spacing: { after: 160 }, children: [] }));
      }
    }
  }

  // Skills
  if (cv.skills.length > 0) {
    sectionHeader(children, t("cv.skills"), accent);
    for (const g of cv.skills) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({ text: `${g.label}: `, bold: true, size: 22 }),
            new TextRun({ text: g.items.join(", "), size: 22 }),
          ],
        })
      );
    }
    children.push(new Paragraph({ spacing: { after: 160 }, children: [] }));
  }

  // Projects
  if (cv.projects.length > 0) {
    sectionHeader(children, t("cv.projects"), accent);
    for (const p of cv.projects) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({ text: p.name, bold: true, size: 22 }),
            ...(p.tagline
              ? [new TextRun({ text: ` — ${p.tagline}`, size: 22 })]
              : []),
            ...(p.link
              ? [
                  new TextRun({
                    text: `   ${cleanLink(p.link)}`,
                    color: "555555",
                    size: 20,
                  }),
                ]
              : []),
          ],
        })
      );
      for (const h of p.highlights.filter(Boolean)) {
        children.push(
          new Paragraph({
            bullet: { level: 0 },
            children: [new TextRun({ text: h, size: 22 })],
          })
        );
      }
      if (p.stack.length > 0) {
        children.push(
          new Paragraph({
            spacing: { after: 140 },
            children: [
              new TextRun({
                text: `${t("cv.stackPrefix")}: ${p.stack.join(", ")}`,
                italics: true,
                color: "555555",
                size: 20,
              }),
            ],
          })
        );
      } else {
        children.push(new Paragraph({ spacing: { after: 140 }, children: [] }));
      }
    }
  }

  // Education
  if (cv.education.length > 0) {
    sectionHeader(children, t("cv.education"), accent);
    for (const e of cv.education) {
      children.push(
        new Paragraph({
          tabStops: [{ type: TabStopType.RIGHT, position: 9000 }],
          children: [
            new TextRun({ text: e.credential, bold: true, size: 22 }),
            new TextRun({
              text: `  ·  ${e.institution}${e.location ? ` · ${e.location}` : ""}`,
              size: 22,
              color: "555555",
            }),
            new TextRun({ text: "\t", size: 20 }),
            new TextRun({
              text: dateRange(e.start, e.end),
              size: 20,
              color: "555555",
            }),
          ],
        })
      );
      if (e.notes) {
        children.push(
          new Paragraph({
            spacing: { after: 120 },
            children: [
              new TextRun({ text: e.notes, size: 20, color: "555555", italics: true }),
            ],
          })
        );
      } else {
        children.push(new Paragraph({ spacing: { after: 120 }, children: [] }));
      }
    }
  }

  // Certifications
  if (cv.certifications.length > 0) {
    sectionHeader(children, t("cv.certifications"), accent);
    for (const c of cv.certifications) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({ text: `• ${c.name}`, size: 22 }),
            new TextRun({
              text: `  —  ${[c.issuer, c.year].filter(Boolean).join(" · ")}`,
              color: "555555",
              size: 20,
            }),
          ],
        })
      );
    }
    children.push(new Paragraph({ spacing: { after: 140 }, children: [] }));
  }

  // Languages
  if (cv.languages.length > 0) {
    sectionHeader(children, t("cv.languages"), accent);
    children.push(
      new Paragraph({
        spacing: { after: 140 },
        children: [
          new TextRun({
            text: cv.languages
              .map(
                (l) =>
                  `${l.name} (${t(`level.${l.level}`)}${l.cefr ? `, ${l.cefr}` : ""})${
                    l.certificate ? ` — ${l.certificate}` : ""
                  }`
              )
              .join(" · "),
            size: 22,
          }),
        ],
      })
    );
  }

  // Interests
  if (cv.interests.length > 0) {
    sectionHeader(children, t("cv.interests"), accent);
    children.push(
      new Paragraph({
        spacing: { after: 140 },
        children: [
          new TextRun({
            text: cv.interests.map((i) => i.label).join(" · "),
            size: 22,
          }),
        ],
      })
    );
  }

  const doc = new Document({
    creator: cv.personal.fullName || "CV Generator",
    title: `${cv.personal.fullName || "CV"} — Curriculum Vitae`,
    description: "Generated by cv-generator",
    styles: {
      default: {
        document: {
          run: {
            font: "Calibri",
            size: 22, // 11pt
          },
        },
      },
    },
    sections: [
      {
        properties: {
          page: {
            margin: { top: 720, bottom: 720, left: 900, right: 900 },
          },
        },
        children,
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, fileName);
}

function sectionHeader(out: Paragraph[], title: string, color: string) {
  out.push(
    new Paragraph({
      spacing: { before: 240, after: 80 },
      heading: HeadingLevel.HEADING_2,
      border: {
        bottom: { color, size: 6, style: BorderStyle.SINGLE, space: 2 },
      },
      children: [
        new TextRun({
          text: title.toUpperCase(),
          bold: true,
          size: 22,
          color,
          characterSpacing: 60,
        }),
      ],
    })
  );
}
