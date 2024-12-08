/** The context each prompt receives about the page. */
export type PageContext = {
  /** The title of the page. */
  title: string

  /** The type of the page content (e.g. page, project, blog post, etc.) */
  type: string

  /** The keywords which describe the content of the page. The first keyword is the focus keyword. */
  keywords: string[]
}
