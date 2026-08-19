// FR-SEO-SD-01/02 — renders one connected @graph as server-side JSON-LD.
// Escaping "<" stops a value containing "</script>" (a group name, a short
// description, ...) from breaking out of the tag.
export function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}
