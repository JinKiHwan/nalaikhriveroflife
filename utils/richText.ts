const allowedTags = new Set(['P', 'BR', 'STRONG', 'B', 'EM', 'I', 'U', 'H2', 'H3', 'BLOCKQUOTE', 'UL', 'OL', 'LI', 'A', 'IMG', 'HR'])
const blockedTags = new Set(['SCRIPT', 'STYLE', 'IFRAME', 'OBJECT', 'EMBED', 'FORM', 'INPUT', 'BUTTON', 'SVG'])

const isSafeLink = (value: string) => /^(https?:\/\/|mailto:|tel:)/i.test(value)
const isSafeImage = (value: string, allowDataImages: boolean) => /^https:\/\//i.test(value) || (allowDataImages && /^data:image\/(webp|jpeg|png|gif);base64,/i.test(value))
const normalizeNonBreakingSpaces = (value: string) => value.replace(/&amp;nbsp;|&nbsp;|&#0*160;|&#x0*a0;/gi, '\u00a0')

export const sanitizeRichText = (html: string, allowDataImages = false) => {
  if (!import.meta.client || !html) return html || ''

  const template = document.createElement('template')
  template.innerHTML = normalizeNonBreakingSpaces(html)

  const cleanNode = (node: Node) => {
    for (const child of Array.from(node.childNodes)) {
      if (child.nodeType === Node.COMMENT_NODE) {
        child.remove()
        continue
      }
      if (!(child instanceof HTMLElement)) continue

      const tag = child.tagName
      if (blockedTags.has(tag)) {
        child.remove()
        continue
      }
      if (!allowedTags.has(tag)) {
        child.replaceWith(...Array.from(child.childNodes))
        cleanNode(node)
        continue
      }

      const originalHref = tag === 'A' ? (child as HTMLAnchorElement).getAttribute('href') || '' : ''
      const originalSource = tag === 'IMG' ? (child as HTMLImageElement).getAttribute('src') || '' : ''
      const originalImageId = tag === 'IMG' ? (child as HTMLImageElement).getAttribute('data-image-id') || '' : ''
      const originalAlt = tag === 'IMG' ? (child as HTMLImageElement).getAttribute('alt') || '' : ''
      for (const attribute of Array.from(child.attributes)) child.removeAttribute(attribute.name)

      if (tag === 'A') {
        if (isSafeLink(originalHref)) {
          child.setAttribute('href', originalHref)
          child.setAttribute('target', '_blank')
          child.setAttribute('rel', 'noopener noreferrer')
        }
      }

      if (tag === 'IMG') {
        const image = child as HTMLImageElement
        if (originalImageId) image.setAttribute('data-image-id', originalImageId.replace(/[^a-zA-Z0-9_-]/g, ''))
        if (isSafeImage(originalSource, allowDataImages)) image.setAttribute('src', originalSource)
        image.setAttribute('alt', originalAlt)
        if (!originalImageId && !isSafeImage(originalSource, allowDataImages)) image.remove()
      }

      cleanNode(child)
    }
  }

  cleanNode(template.content)
  return template.innerHTML
}

export const prepareRichTextForSave = (html: string) => {
  if (!import.meta.client || !html) return html || ''
  const template = document.createElement('template')
  template.innerHTML = sanitizeRichText(html, true)
  template.content.querySelectorAll<HTMLImageElement>('img[data-image-id]').forEach(image => image.removeAttribute('src'))
  return template.innerHTML
}

export const richTextExcerpt = (html: string, maxLength = 180) => {
  if (!html) return ''
  if (!import.meta.client) return normalizeNonBreakingSpaces(html).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, maxLength)
  const container = document.createElement('div')
  container.innerHTML = sanitizeRichText(html)
  const text = (container.textContent || '').replace(/\s+/g, ' ').trim()
  return text.length > maxLength ? `${text.slice(0, maxLength).trim()}…` : text
}

export const richTextImageIds = (html: string) => {
  if (!import.meta.client || !html) return []
  const template = document.createElement('template')
  template.innerHTML = html
  return Array.from(new Set(Array.from(template.content.querySelectorAll<HTMLElement>('[data-image-id]')).map(item => item.dataset.imageId || '').filter(Boolean)))
}
