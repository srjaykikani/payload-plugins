'use client'
import {
  TextField,
  useAllFormFields,
  useConfig,
  useField,
  useForm,
  useFormFields,
  useLocale,
} from '@payloadcms/ui'
import { TextFieldClientComponent } from 'payload'
import { Breadcrumb } from '../../types/Breadcrumb.js'
import { Locale } from '../../types/Locale.js'
import { getBreadcrumbs as getBreadcrumbsForDoc } from '../../utils/getBreadcrumbs.js'
import { pathFromBreadcrumbs } from '../../utils/pathFromBreadcrumbs.js'
import { useDidUpdateEffect } from '../../utils/useDidUpdateEffect.js'
import { usePageCollectionConfigAttributes } from './hooks/usePageCollectionConfigAtrributes.js'

// useFormFields is not used for the breadcrumbs because of the following payload issue:
// see https://github.com/payloadcms/payload/issues/8146
const useBreadcrumbs = () => {
  const [fields, dispatchFields] = useAllFormFields()
  const { getData } = useForm()

  const getBreadcrumbs = (): Breadcrumb[] => {
    return getData().breadcrumbs || []
  }

  const setBreadcrumbs = (newBreadcrumbs: Breadcrumb[]) => {
    const existingRowCount = fields.breadcrumbs?.rows?.length || 0

    newBreadcrumbs.forEach((breadcrumb, index) => {
      if (index < existingRowCount) {
        // Update existing row
        // NOTE: it is necessary to update each field individually
        dispatchFields({
          type: 'UPDATE',
          path: `breadcrumbs.${index}.label`,
          value: breadcrumb.label,
        })
        dispatchFields({
          type: 'UPDATE',
          path: `breadcrumbs.${index}.slug`,
          value: breadcrumb.slug,
        })

        dispatchFields({
          type: 'UPDATE',
          path: `breadcrumbs.${index}.path`,
          value: breadcrumb.path,
        })
      } else {
        // Add new row
        dispatchFields({
          type: 'ADD_ROW',
          path: 'breadcrumbs',
          rowIndex: index,
          subFieldState: {
            label: { value: breadcrumb.label, initialValue: breadcrumb.label, valid: true },
            slug: { value: breadcrumb.slug, initialValue: breadcrumb.slug, valid: true },
            path: { value: breadcrumb.path, initialValue: breadcrumb.path, valid: true },
          },
        })
      }
    })

    // Remove any extra rows
    for (let i = newBreadcrumbs.length; i < existingRowCount; i++) {
      dispatchFields({
        type: 'REMOVE_ROW',
        path: 'breadcrumbs',
        rowIndex: newBreadcrumbs.length,
      })
    }
  }

  return {
    getBreadcrumbs,
    setBreadcrumbs,
  }
}

export const PathField: TextFieldClientComponent = ({ field, path: fieldPath, schemaPath }) => {
  const { config } = useConfig()
  const {
    parent: { name: parentField, collection: parentCollection },
    breadcrumbs: { labelField: breadcrumbLabelFieldName },
  } = usePageCollectionConfigAttributes()
  const { code: locale } = useLocale() as unknown as { code: Locale }
  const { getBreadcrumbs, setBreadcrumbs: setBreadcrumbsRaw } = useBreadcrumbs()
  const { setValue: setPathRaw, value: path } = useField<string>({ path: fieldPath! })
  const { setValue: setSlugRaw, value: slug } = useField<string>({ path: 'slug' })
  const breadcrumbLabel = useFormFields(([fields, _]) => fields[breadcrumbLabelFieldName])
    ?.value as string | undefined
  const parent = useFormFields(([fields, _]) => fields[parentField])?.value as string | undefined
  const isRootPage = useFormFields(([fields, _]) => fields.isRootPage)?.value as boolean | undefined

  /**
   * Sets the path, but only if the new path is different from the current path.
   * This prevents the "leave without saving" warning from being shown every time a document is opened without it being actually modified.
   * */
  const setPath = (newPath: string) => {
    if (newPath !== path) {
      setPathRaw(newPath)
    }
  }

  /**
   * Sets the slug, but only if the new slug is different from the current slug.
   * This prevents the "leave without saving" warning from being shown every time a document is opened without it being actually modified.
   */
  const setSlug = (newSlug: string) => {
    if (newSlug !== slug) {
      setSlugRaw(newSlug)
    }
  }

  /**
   * Sets the breadcrumbs, but only if the new breadcrumbs are different from the current breadcrumbs.
   * This prevents the "leave without saving" warning from being shown every time a document is opened without it being actually modified.
   */
  const setBreadcrumbs = (newBreadcrumbs: Breadcrumb[]) => {
    let breadcrumbs = getBreadcrumbs() as Breadcrumb[]

    // Compare breadcrumbs ignoring id field since it's not relevant for equality
    const areBreadcrumbsEqual = (a: Breadcrumb[], b: Breadcrumb[]) => {
      if (a.length !== b.length) return false
      return a.every((breadcrumb, i) => {
        // Sort keys to ensure consistent order when comparing
        const sortObject = (obj: any) => {
          return Object.keys(obj)
            .sort()
            .reduce((result: any, key) => {
              result[key] = obj[key]
              return result
            }, {})
        }

        const aWithoutId = sortObject({ ...breadcrumb, id: undefined })
        const bWithoutId = sortObject({ ...b[i], id: undefined })

        return JSON.stringify(aWithoutId) === JSON.stringify(bWithoutId)
      })
    }

    // Only update if breadcrumbs have actually changed
    if (!areBreadcrumbsEqual(breadcrumbs, newBreadcrumbs)) {
      setBreadcrumbsRaw(newBreadcrumbs)
    }
  }

  /**
   * Fetches the the full list of breadcrumbs for the current document.
   */
  async function fetchBreadcrumbs(): Promise<Breadcrumb[]> {
    // Construct the document with all necessary fields
    const doc: Record<string, any> = {
      slug: slug,
      isRootPage: isRootPage,
    }
    doc[parentField] = parent
    doc[breadcrumbLabelFieldName] = breadcrumbLabel

    const fechtchedBreadcrumbs = (await getBreadcrumbsForDoc({
      req: undefined, // payload req is not available here
      locales: (config.localization as { localeCodes: Locale[] }).localeCodes,
      breadcrumbLabelField: breadcrumbLabelFieldName,
      parentField: parentField,
      parentCollection: parentCollection,
      data: doc,
      locale: locale,
    })) as Breadcrumb[]

    return fechtchedBreadcrumbs
  }

  // update the breadcrumbs and path when
  //  - the parent changes
  useDidUpdateEffect(() => {
    const fetchAndSetData = async () => {
      // the parent was added:
      if (parent) {
        const fechtchedBreadcrumbs = await fetchBreadcrumbs()

        const updatedPath = pathFromBreadcrumbs({
          locale: locale,
          breadcrumbs: fechtchedBreadcrumbs,
        })

        setBreadcrumbs(fechtchedBreadcrumbs)
        setPath(updatedPath)
        // the parent was removed:
      } else {
        const breadcrumbs = getBreadcrumbs() ?? []

        // remove all breadcrumbs except the last one of this doc if the parent was removed
        const updatedBreadcrumbs = breadcrumbs.length >= 2 ? breadcrumbs.slice(-1) : []
        const updatedPath = pathFromBreadcrumbs({ locale: locale, breadcrumbs: updatedBreadcrumbs })

        setPath(updatedPath)
        setBreadcrumbs(updatedBreadcrumbs)
      }
    }
    fetchAndSetData()

    // This effect should only be executed when the parent changes:
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [parent])

  // Update the breadcrumbs and path when
  //  - the slug changes
  //  - the field used for the breadcrumb label changes
  useDidUpdateEffect(() => {
    const fetchAndSetData = async () => {
      let breadcrumbs = getBreadcrumbs()

      if (!breadcrumbs || breadcrumbs.length === 0) {
        if (parent) {
          // Fetching the virtual breadcrumbs field in this case fixes the issue that when creating a localized version of an existing document
          // with a parent set, the breadcrumbs do not show the parent breadcrumbs in the UI when setting the slug.
          const fechtchedBreadcrumbs = await fetchBreadcrumbs()
          breadcrumbs = fechtchedBreadcrumbs
        } else {
          // there should always be at least one breadcrumb
          breadcrumbs = [
            {
              label: '',
              slug: '',
              path: '',
            },
          ]
        }
      }

      // update the slug and title in the breadcrumbs
      const updatedBreadcrumbsSlug: Breadcrumb[] = breadcrumbs.map((breadcrumb, index) =>
        index === breadcrumbs.length - 1
          ? {
              path: breadcrumb.path,
              slug: slug as string,
              label: breadcrumbLabel as string,
            }
          : {
              path: breadcrumb.path,
              slug: breadcrumb.slug,
              label: breadcrumb.label,
            },
      )

      // generate the path
      const updatedPath = pathFromBreadcrumbs({
        locale: locale,
        breadcrumbs: updatedBreadcrumbsSlug,
      })

      // update the path in the breadcrumbs
      const updatedBreadcrumbsPath: Breadcrumb[] = updatedBreadcrumbsSlug.map((breadcrumb, index) =>
        index === breadcrumbs.length - 1
          ? {
              path: updatedPath,
              slug: breadcrumb.slug,
              label: breadcrumb.label,
            }
          : {
              path: breadcrumb.path,
              slug: breadcrumb.slug,
              label: breadcrumb.label,
            },
      )

      setPath(updatedPath)
      setBreadcrumbs(updatedBreadcrumbsPath)
    }

    fetchAndSetData()

    // this effect should only be executed when the slug or the breadcrumb label changes:
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug, breadcrumbLabel])

  // Update the breadcrumbs and path, when
  // - the page was set to be the root page
  useDidUpdateEffect(() => {
    if (isRootPage === true) {
      setSlug('')
      setPath('/' + locale + '/')
      setBreadcrumbs([{ label: breadcrumbLabel ?? '', slug: '', path: '/' + locale }])
    }

    // this effect should only be executed when the slug or the breadcrumb label changes:
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRootPage])

  return <TextField field={field} path={fieldPath} schemaPath={schemaPath} readOnly />
}
