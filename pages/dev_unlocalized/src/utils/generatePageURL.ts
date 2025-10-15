/**
 * Generate the full URL to a frontend page.
 * This is a helper function used by the dev environment.
 */
export const generatePageURL = ({
  path,
  preview,
}: {
  path: string
  preview: boolean
}): string => {
  const domain = process.env.NEXT_PUBLIC_FRONTEND_URL

  if (!domain) {
    throw new Error('NEXT_PUBLIC_FRONTEND_URL environment variable is required')
  }

  if (!path) {
    console.error('generatePageURL received an empty path:', path)
    return ''
  }

  if (!path.startsWith('/')) {
    throw new Error('Path must start with a slash: ' + path)
  }

  return `${domain}${preview ? '/preview' : ''}${path}`
}
