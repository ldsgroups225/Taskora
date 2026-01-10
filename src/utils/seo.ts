/**
 * Builds an array of meta tag descriptors for SEO and social sharing.
 *
 * When `image` is provided, additional Twitter and Open Graph image tags and a
 * large-card twitter card are included.
 *
 * @param title - The page title used for the `title`, `twitter:title`, and `og:title` tags
 * @param description - Optional page description used for `description`, `twitter:description`, and `og:description`
 * @param image - Optional image URL; when present adds `twitter:image`, `twitter:card` (`summary_large_image`), and `og:image`
 * @param keywords - Optional keywords string used for the `keywords` tag
 * @returns An array of tag descriptor objects; each object contains either a `title` or a `name` and a `content` property
 */
export function seo({
  title,
  description,
  keywords,
  image,
}: {
  title: string
  description?: string
  image?: string
  keywords?: string
}) {
  const tags = [
    { title },
    { name: 'description', content: description },
    { name: 'keywords', content: keywords },
    { name: 'twitter:title', content: title },
    { name: 'twitter:description', content: description },
    { name: 'twitter:creator', content: '@tannerlinsley' },
    { name: 'twitter:site', content: '@tannerlinsley' },
    { name: 'og:type', content: 'website' },
    { name: 'og:title', content: title },
    { name: 'og:description', content: description },
    ...(image
      ? [
          { name: 'twitter:image', content: image },
          { name: 'twitter:card', content: 'summary_large_image' },
          { name: 'og:image', content: image },
        ]
      : []),
  ]

  return tags
}