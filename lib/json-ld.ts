/** Serialises JSON-LD for a <script> tag, escaping "<" so content cannot close the tag. */
export function jsonLdScript(data: object) {
  return { __html: JSON.stringify(data).replace(/</g, "\u003c") };
}
