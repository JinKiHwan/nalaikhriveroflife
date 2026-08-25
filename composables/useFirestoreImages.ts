import { addDoc, collection, deleteDoc, doc, getDoc, type Firestore } from 'firebase/firestore'
import { sanitizeRichText } from '~/utils/richText'

interface StoredImageResult {
  id: string
  dataUrl: string
  width: number
  height: number
}

const imageCache = new Map<string, string>()
const MAX_SOURCE_MB = 30
const MAX_SOURCE_BYTES = MAX_SOURCE_MB * 1024 * 1024
// Firestore stores the image as a Base64 data URL. Keeping the binary below 700KB
// leaves room for Base64 expansion and metadata within the 1MiB document limit.
const MAX_STORED_WEBP_BYTES = 700 * 1024

const fileSizeInMb = (bytes: number) => `${(bytes / 1024 / 1024).toFixed(2)}MB`

const validateImageFile = (file: File) => {
  if (!file.type.startsWith('image/')) throw new Error('이미지 파일만 업로드할 수 있습니다.')
  if (file.size > MAX_SOURCE_BYTES) {
    throw new Error(`원본 이미지는 ${MAX_SOURCE_MB}MB 이하만 사용할 수 있습니다. (선택한 파일: ${fileSizeInMb(file.size)})`)
  }
}

const blobToDataUrl = (blob: Blob) => new Promise<string>((resolve, reject) => {
  const reader = new FileReader()
  reader.onload = () => resolve(String(reader.result || ''))
  reader.onerror = () => reject(reader.error)
  reader.readAsDataURL(blob)
})

const canvasToBlob = (canvas: HTMLCanvasElement, quality: number) => new Promise<Blob>((resolve, reject) => {
  canvas.toBlob(blob => {
    if (!blob) return reject(new Error('이미지를 변환하지 못했습니다.'))
    if (blob.type !== 'image/webp') return reject(new Error('이 브라우저에서는 WebP 이미지 변환을 지원하지 않습니다.'))
    resolve(blob)
  }, 'image/webp', quality)
})

const compressImage = async (file: File, variant: 'thumbnail' | 'body') => {
  validateImageFile(file)

  let bitmap: ImageBitmap
  try {
    bitmap = await createImageBitmap(file)
  } catch {
    throw new Error('이미지를 불러오지 못했습니다. JPG, PNG 또는 WebP 파일인지 확인해 주세요.')
  }
  const maxWidth = variant === 'thumbnail' ? 1400 : 1600
  const maxHeight = variant === 'thumbnail' ? 1000 : 1800
  const maxBytes = variant === 'thumbnail' ? 360 * 1024 : 620 * 1024
  const initialScale = Math.min(1, maxWidth / bitmap.width, maxHeight / bitmap.height)
  let width = Math.max(1, Math.round(bitmap.width * initialScale))
  let height = Math.max(1, Math.round(bitmap.height * initialScale))
  let quality = .86
  let blob: Blob

  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d', { alpha: false })
  if (!context) throw new Error('이미지 편집 기능을 사용할 수 없습니다.')

  do {
    canvas.width = width
    canvas.height = height
    context.fillStyle = '#ffffff'
    context.fillRect(0, 0, width, height)
    context.drawImage(bitmap, 0, 0, width, height)
    blob = await canvasToBlob(canvas, quality)
    if (blob.size <= maxBytes) break
    if (quality > .54) quality -= .1
    else {
      width = Math.max(640, Math.round(width * .84))
      height = Math.max(360, Math.round(height * .84))
    }
  } while (blob.size > maxBytes && width > 640)

  bitmap.close()
  if (blob.size > MAX_STORED_WEBP_BYTES) throw new Error('이미지를 1MB 이하로 줄이지 못했습니다. 더 작은 이미지를 선택해 주세요.')
  return { dataUrl: await blobToDataUrl(blob), width, height, size: blob.size }
}

const webpFileName = (fileName: string) => `${fileName.replace(/\.[^.]+$/, '') || 'image'}.webp`

export const useFirestoreImages = () => {
  const { $firebaseDb } = useNuxtApp()
  const { user, runWithAuthRetry } = useAuth()
  const db = $firebaseDb as Firestore | null

  const uploadImage = async (file: File, folder: string, variant: 'thumbnail' | 'body' = 'body'): Promise<StoredImageResult> => {
    if (!db || !user.value) throw new Error('로그인과 Firebase 연결 상태를 확인해 주세요.')
    const compressed = await compressImage(file, variant)
    const imageDoc = await addDoc(collection(db, 'content_images'), {
      dataUrl: compressed.dataUrl,
      fileName: webpFileName(file.name),
      contentType: 'image/webp',
      size: compressed.size,
      width: compressed.width,
      height: compressed.height,
      folder,
      createdAt: new Date().toISOString(),
      createdBy: user.value.uid,
    })
    imageCache.set(imageDoc.id, compressed.dataUrl)
    return { id: imageDoc.id, dataUrl: compressed.dataUrl, width: compressed.width, height: compressed.height }
  }

  const getImage = async (imageId: string) => {
    if (!imageId || !db) return ''
    if (imageCache.has(imageId)) return imageCache.get(imageId) || ''
    const snapshot = await runWithAuthRetry(() => getDoc(doc(db, 'content_images', imageId)))
    if (!snapshot.exists()) return ''
    const dataUrl = String(snapshot.data().dataUrl || '')
    if (dataUrl) imageCache.set(imageId, dataUrl)
    return dataUrl
  }

  const deleteImage = async (imageId: string) => {
    if (!imageId || !db) return
    await deleteDoc(doc(db, 'content_images', imageId))
    imageCache.delete(imageId)
  }

  const resolveRichTextImages = async (html: string) => {
    if (!import.meta.client || !html) return html || ''
    const template = document.createElement('template')
    template.innerHTML = sanitizeRichText(html)
    const images = Array.from(template.content.querySelectorAll<HTMLImageElement>('img[data-image-id]'))
    await Promise.all(images.map(async image => {
      const imageId = image.dataset.imageId || ''
      const dataUrl = await getImage(imageId)
      if (dataUrl) image.src = dataUrl
      else image.remove()
    }))
    return template.innerHTML
  }

  return { uploadImage, getImage, deleteImage, resolveRichTextImages, validateImageFile }
}
