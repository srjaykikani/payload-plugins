/** A transformer that picks and transforms the relevant fields from a document. */
export type CollectionDocContentTransformer = (
  doc: any
) => Promise<Record<string, string>> | Record<string, string>;
