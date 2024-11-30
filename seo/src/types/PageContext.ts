/** The context each prompt receives about the page. */
export type PageContext = {
  title: string
  type: string

  /** The keywords which describe the content of the page. The first keyword is the focus keyword. */
  keywords: string[]
}
