import { getEnabledNodes } from '@payloadcms/richtext-lexical'

import { defaultEditorConfig, sanitizeServerEditorConfig } from '@payloadcms/richtext-lexical'
import { $getRoot } from '@payloadcms/richtext-lexical/lexical'
import { createHeadlessEditor } from '@payloadcms/richtext-lexical/lexical/headless'
import { SanitizedConfig } from 'payload'

/** Converts the given lexical data to plain text */
export async function lexicalToPlainText(
  data: any,
  payloadConfig: SanitizedConfig,
): Promise<string | undefined> {
  if (!data) {
    console.warn('No data to convert to plain text. Returning undefined.')
    return undefined
  }

  if (!data.root && typeof data === 'string') {
    console.warn('Plaintext passed to lexicalToPlainText. Returning string.')
    return data
  }

  // Docs: https://payloadcms.com/docs/lexical/converters#headless-editor

  try {
    const headlessEditor = createHeadlessEditor({
      nodes: getEnabledNodes({
        editorConfig: await sanitizeServerEditorConfig(defaultEditorConfig, payloadConfig),
      }),
    })

    const parsedEditorState = headlessEditor.parseEditorState(data)

    headlessEditor.update(
      () => headlessEditor.setEditorState(parsedEditorState),
      { discrete: true }, // This should commit the editor state immediately
    )

    let plainTextContent = headlessEditor.getEditorState().read(() => $getRoot().getTextContent())

    // Remove linebreaks and multiple spaces
    plainTextContent = plainTextContent
      .replace(/(\r\n|\n|\r)/gm, ' ')
      .replace(/\s+/g, ' ')
      .trim()

    // Returning undefined if the text is empty, so that we can use the ?? operator in the excerpt transformer
    return plainTextContent ? plainTextContent : undefined
  } catch (e) {
    console.error({
      message: 'ERROR parsing lexical to plaintext.',
      error: e,
    })
    return undefined
  }
}
