// pdfjs-dist v4 has no "exports" map, so the deep `?url` worker import needs an
// explicit ambient declaration for `tsc --noEmit` to resolve it.
declare module "pdfjs-dist/build/pdf.worker.mjs?url" {
  const src: string;
  export default src;
}
