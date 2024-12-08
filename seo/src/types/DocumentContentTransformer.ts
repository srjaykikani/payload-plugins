/** A transformer that picks and transforms the relevant fields from a document and returns a structured object with only the necessary content fields. */
export type DocumentContentTransformer = (
  doc: any,
  lexicalToPlainText: (doc: any) => Promise<string | undefined>,
) => Promise<Record<string, string>> | Record<string, string>
