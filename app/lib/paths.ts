// basePath rewrites Next asset URLs, but NOT runtime fetch() calls.
// Every fetch of /data/*.json must go through withBase().
const BASE = process.env.NODE_ENV === "production" ? "/emotion-dimensions" : "";

export function withBase(path: string): string {
  return `${BASE}${path}`;
}
