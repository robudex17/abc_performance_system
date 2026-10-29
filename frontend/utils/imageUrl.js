// The url of a picture stored in MinIO: <NUXT_IMAGE_BASE_URL><filename>, served by the image proxy (server/routes/api/images).
// image_link in the database can be the bare filename, an older '/images/<filename>' path or a full url of the old storage:
// only the filename is used, so every form shows the same picture. Empty image_link: no url.
export const imageUrlOf = (imageLink) => {
  if (!imageLink) return ''
  if (imageLink.startsWith('data:image')) return imageLink
  return `${useRuntimeConfig().public.imageBaseUrl}${imageLink.split('/').pop()}`
}
