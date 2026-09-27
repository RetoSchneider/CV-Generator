import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';
import { createServer } from 'vite';

const server = await createServer({ server: { host: '127.0.0.1', port: 0, open: false } });
let browser;
try {
  await server.listen();
  const url = server.resolvedUrls.local[0];
  browser = await chromium.launch(process.env.CHROME_PATH
    ? { executablePath: process.env.CHROME_PATH }
    : { channel: 'chrome' });
  const page = await browser.newPage({ viewport: { width: 1400, height: 1400 } });
  const printPage = await browser.newPage();
  await page.goto(url);
  for (const fixture of ['en', 'de', 'fr', 'it', 'comfortable', 'long', 'oversized', 'paragraph', 'minimal']) {
    const prepared = await page.evaluate(async fixture => {
      const { useStore } = await import('/src/store.ts');
      const { buildSampleCV } = await import('/src/data/sampleData.ts');
      const { normalizeCV } = await import('/src/data/normalizeCV.ts');
      const { preparePdfDocument } = await import('/src/utils/exportPdf.ts');
      const cv = fixture === 'minimal' ? normalizeCV({ personal: { fullName: 'QAName' } }) : buildSampleCV(['de','fr','it'].includes(fixture) ? fixture : 'en');
      cv.personal.fullName = 'QAName';
      cv.personal.title = 'Software Test Engineer';
      if (fixture !== 'minimal') cv.summary = 'QAProfile: Gränichen, Zürich, français, qualità, Prüfung & C#.';
      if (fixture === 'comfortable') cv.meta.density = 'comfortable';
      if (fixture === 'long') {
        cv.experience = Array.from({length:24}, (_,i) => ({...cv.experience[0],id:'exp'+i}));
        cv.skills = Array.from({length:28}, (_,i) => ({...cv.skills[0],id:'skill'+i}));
      }
      cv.experience.forEach((e,i) => { e.role = `QARole${i}END`; e.highlights = [`QABullet${i}END tested releases and analysed defects.`]; });
      cv.skills.forEach((g,i) => { g.label = `QASkillGroup${i}END`; g.items = [`QASkill${i}END`, 'TypeScript', 'Playwright']; });
      cv.education.forEach((e,i) => { e.credential = `QAEducation${i}END`; });
      cv.certifications.forEach((c,i) => { c.name = `QACertificate${i}END`; });
      if (fixture === 'oversized') cv.experience[0].highlights = Array.from({length:100}, (_,i) => `QALongBullet${i}END validates a separate regression scenario.`);
      if (fixture === 'paragraph') cv.summary += ' ' + Array.from({length:150}, (_,i) => `QAParagraph${i}END validates a long text across page boundaries.`).join(' ');
      useStore.getState().setCV(cv);
      await new Promise(resolve => requestAnimationFrame(resolve));
      const node = document.querySelector('.cv-page');
      const before = node.outerHTML;
      const markers = node.textContent.match(/QA(?:Name|Profile|[A-Za-z]+\d+END)/g);
      const frame = await preparePdfDocument(node.cloneNode(true), 'QA <safe>.pdf');
      const doc = frame.contentDocument;
      const result = { html: doc.documentElement.outerHTML, count: doc.querySelectorAll('.cv-print-sheet').length, markers, unchanged: before === node.outerHTML, title: doc.title };
      frame.remove();
      return result;
    }, fixture);
    assert(prepared.unchanged, 'Export must not change the preview');
    assert.equal(prepared.title, 'QA <safe>');
    await printPage.setContent(prepared.html, { waitUntil: 'networkidle' });
    await printPage.evaluate(() => document.fonts.ready);
    const dotErrors = await printPage.locator('.cv-exp-dot').evaluateAll(dots => dots
      .filter(dot => getComputedStyle(dot).visibility !== 'hidden')
      .map(dot => {
        const list = dot.closest('ol');
        const rect = dot.getBoundingClientRect();
        const listRect = list.getBoundingClientRect();
        const scale = rect.width / parseFloat(getComputedStyle(dot).width);
        return Math.abs((rect.left + rect.right) / 2 - listRect.left - parseFloat(getComputedStyle(list).borderLeftWidth) * scale / 2);
      }));
    assert(dotErrors.every(error => error < 0.1), `${fixture}: timeline dots centred on border`);
    const data = await printPage.pdf({preferCSSPageSize:true, printBackground:true, tagged:true});
    const loadingTask = getDocument({data: new Uint8Array(data)});
    const pdf = await loadingTask.promise;
    assert.equal(pdf.numPages, prepared.count, `${fixture}: no extra or missing pages`);
    let allText = '';
    for (let i=1; i<=pdf.numPages; i++) {
      const pdfPage = await pdf.getPage(i);
      const content = await pdfPage.getTextContent();
      assert(content.items.length > 0, `${fixture}: page ${i} contains real text`);
      allText += content.items.map(item => item.str ?? '').join(' ');
      for (const scale of [1, 1.5, 2]) {
        const viewport = pdfPage.getViewport({scale});
        const raster = pdf.canvasFactory.create(Math.ceil(viewport.width), Math.ceil(viewport.height));
        await pdfPage.render({canvasContext: raster.context, viewport}).promise;
        const edgeX = Math.floor(viewport.width * 0.36);
        const pixels = raster.context.getImageData(edgeX - 8, 0, 16, raster.canvas.height).data;
        const edges = [];
        for (let y = 2; y < raster.canvas.height - 2; y++) {
          let edge = -1;
          for (let x = 0; x < 16; x++) {
            if (pixels[(y * 16 + x) * 4] > 128) { edge = x; break; }
          }
          edges.push(edge);
        }
        assert(edges.every(edge => edge >= 0), `${fixture}: sidebar boundary is visible`);
        assert.equal(Math.max(...edges) - Math.min(...edges), 0, `${fixture}: straight sidebar on page ${i} at scale ${scale}`);
        pdf.canvasFactory.destroy(raster);
      }
    }
    const normalized = allText.replace(/\s/g, '');
    for (const marker of prepared.markers) {
      assert.equal(normalized.toLowerCase().split(marker.toLowerCase()).length - 1, 1, `${fixture}: ${marker} must appear exactly once`);
    }
    if (fixture !== 'minimal') for(const word of ['Gränichen', 'Zürich', 'français', 'qualità', 'Prüfung']) assert(normalized.includes(word), `${fixture}: Unicode ${word}`);
    if (fixture === 'long') assert(pdf.numPages > 2);
    await loadingTask.destroy();
    console.log(`${fixture}: ${prepared.count} pages, all text markers present exactly once, preview unchanged`);
  }
  const lifecycle = await page.evaluate(async () => {
    const { exportPdf, preparePdfDocument } = await import('/src/utils/exportPdf.ts');
    const originalTitle = document.title;
    let calls = 0;
    let retainedUntilAfterprint = true;
    const observer = new MutationObserver(records => {
      for (const record of records) for (const node of record.addedNodes) if (node instanceof HTMLIFrameElement) {
        node.contentWindow.print = () => {
          calls++;
          setTimeout(() => {
            retainedUntilAfterprint &&= node.isConnected;
            node.contentWindow.dispatchEvent(new Event('afterprint'));
          }, 20);
        };
      }
    });
    observer.observe(document.body, {childList:true});
    try {
      for(let i=0;i<2;i++) await exportPdf(document.querySelector('.cv-page').cloneNode(true));
    } finally { observer.disconnect(); }
    let rejected = false;
    try { await preparePdfDocument(document.createElement('div')); } catch { rejected = true; }
    return { calls, retainedUntilAfterprint, rejected, titleRestored: originalTitle === document.title, frames: document.querySelectorAll('iframe[title="CV PDF"]').length };
  });
  assert.deepEqual(lifecycle, {calls:2,retainedUntilAfterprint:true,rejected:true,titleRestored:true,frames:0});
  console.log('Print close/cancel, repeat export and error cleanup passed.');

  await page.route('**/pdf-test-styles.css', route => route.abort());
  const failedStyles = await page.evaluate(async () => {
    const { preparePdfDocument } = await import('/src/utils/exportPdf.ts');
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = '/pdf-test-styles.css';
    document.head.appendChild(link);
    try {
      await preparePdfDocument(document.querySelector('.cv-page'));
      return { rejected: false };
    } catch (error) {
      return { rejected: error.message === 'print-styles-unavailable', frames: document.querySelectorAll('iframe[title="CV PDF"]').length };
    } finally {
      link.remove();
    }
  });
  assert.deepEqual(failedStyles, { rejected: true, frames: 0 });
  console.log('Missing app stylesheet fails cleanly instead of exporting a broken layout.');
} finally {
  await browser?.close();
  await server.close();
}
