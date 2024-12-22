'use client'
import {
  TextField,
  useAllFormFields,
  useConfig,
  useDocumentInfo,
  useField,
  useForm,
  useFormFields,
  useLocale,
} from '@payloadcms/ui'
import { SanitizedCollectionConfig, TextFieldClientComponent } from 'payload'
import { asPageCollectionConfigOrThrow } from '../collections/PageCollectionConfig'
import { Breadcrumb } from '../types/Breadcrumb'
import { Locale } from '../types/Locale'
import { getBreadcrumbs as getBreadcrumbsForDoc } from '../utils/getBreadcrumbs'
import { pathFromBreadcrumbs } from '../utils/pathFromBreadcrumbs'
import { useDidUpdateEffect } from '../utils/useDidUpdateEffect'

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
  const { collectionSlug } = useDocumentInfo()
  const {
    config: { collections },
  } = useConfig()

  // TODO: find a solution without using the unknown type, pass fallbackSlug directly to this component instead?
  const collection = collections.find(
    (c) => c.slug === collectionSlug,
  ) as unknown as SanitizedCollectionConfig
  const {
    parentCollection,
    parentField,
    breadcrumbLabelField: breadcrumbLabelFieldRaw,
  } = asPageCollectionConfigOrThrow(collection).page
  const breadcrumbLabelField = breadcrumbLabelFieldRaw!
  const { code: locale } = useLocale() as unknown as { code: Locale }
  const { getBreadcrumbs, setBreadcrumbs: setBreadcrumbsRaw } = useBreadcrumbs()
  const { setValue: setPathRaw, value: path } = useField<string>({ path: fieldPath! })
  const slug = useFormFields(([fields, _]) => fields.slug)?.value as string | undefined
  const breadcrumbLabel = useFormFields(([fields, _]) => fields[breadcrumbLabelField])?.value as
    | string
    | undefined
  const parent = useFormFields(([fields, _]) => fields[parentField])?.value as string | undefined

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

  // update the breadcrumbs and path when
  //  - the parent changes
  useDidUpdateEffect(() => {
    const fetchAndSetData = async () => {
      // the parent was added:
      if (parent) {
        const doc: Record<string, any> = {
          slug: slug,
        }
        doc[parentField] = parent
        doc[breadcrumbLabelField] = breadcrumbLabel

        const fechtchedBreadcrumbs = (await getBreadcrumbsForDoc({
          req: undefined, // payload req is not available here
          collection: collection,
          parentField: parentField,
          parentCollection: parentCollection,
          data: doc,
          locale: locale,
        })) as Breadcrumb[]

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
    let breadcrumbs = getBreadcrumbs() as Breadcrumb[]

    if (!breadcrumbs || breadcrumbs.length === 0) {
      // there should always be at least one breadcrumb
      breadcrumbs = [
        {
          label: '',
          slug: '',
          path: '',
        },
      ]
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
    const updatedPath = pathFromBreadcrumbs({ locale: locale, breadcrumbs: updatedBreadcrumbsSlug })

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

    // this effect should only be executed when the slug or the breadcrumb label changes:
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug, breadcrumbLabel])

  return <TextField field={field} path={fieldPath} schemaPath={schemaPath} readOnly />
}
