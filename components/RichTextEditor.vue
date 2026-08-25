<template>
  <div class="rich-editor-field">
    <div class="editor-label-row">
      <label>{{ label }}</label>
      <span>{{ isUploading ? (language === 'mn' ? 'Зураг оруулж байна...' : '이미지 삽입 중...') : (language === 'mn' ? 'WebP · 1 МБ-аас бага' : 'WebP · 1MB 이하 자동 변환') }}</span>
    </div>

    <div class="rich-editor" :class="{ uploading: isUploading }">
      <div class="editor-toolbar" role="toolbar" :aria-label="language === 'mn' ? 'Бичвэр засварлагч' : '본문 편집 도구'">
        <button type="button" title="제목" :class="{ active: activeFormats.h2 }" :aria-pressed="activeFormats.h2" @mousedown.prevent="toggleBlock('h2')">H2</button>
        <button type="button" title="소제목" :class="{ active: activeFormats.h3 }" :aria-pressed="activeFormats.h3" @mousedown.prevent="toggleBlock('h3')">H3</button>
        <span class="toolbar-divider"></span>
        <button type="button" title="굵게" :class="{ active: activeFormats.bold }" :aria-pressed="activeFormats.bold" @mousedown.prevent="runCommand('bold')"><strong>B</strong></button>
        <button type="button" title="기울임" :class="{ active: activeFormats.italic }" :aria-pressed="activeFormats.italic" @mousedown.prevent="runCommand('italic')"><em>I</em></button>
        <button type="button" title="밑줄" :class="{ active: activeFormats.underline }" :aria-pressed="activeFormats.underline" @mousedown.prevent="runCommand('underline')"><u>U</u></button>
        <span class="toolbar-divider"></span>
        <button type="button" title="글머리 목록" :class="{ active: activeFormats.unorderedList }" :aria-pressed="activeFormats.unorderedList" @mousedown.prevent="runCommand('insertUnorderedList')">• List</button>
        <button type="button" title="번호 목록" :class="{ active: activeFormats.orderedList }" :aria-pressed="activeFormats.orderedList" @mousedown.prevent="runCommand('insertOrderedList')">1. List</button>
        <button type="button" title="인용문 · Enter로 종료" :class="{ active: activeFormats.blockquote }" :aria-pressed="activeFormats.blockquote" @mousedown.prevent="toggleBlock('blockquote')">“ ”</button>
        <button type="button" title="링크" :class="{ active: activeFormats.link }" :aria-pressed="activeFormats.link" @mousedown.prevent="insertLink">Link</button>
        <button type="button" class="image-tool" title="본문 이미지 삽입" :disabled="isUploading" @mousedown.prevent="openImagePicker">
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 5h16v14H4V5zm0 10l4-4 3 3 2-2 7 7M15.5 9a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>
          {{ language === 'mn' ? 'Зураг' : '이미지' }}
        </button>
      </div>

      <div
        ref="editor"
        class="editor-content"
        contenteditable="true"
        :data-placeholder="placeholder"
        @input="emitContent"
        @keyup="rememberSelection"
        @mouseup="rememberSelection"
        @focus="rememberSelection"
        @paste="handlePaste"
        @keydown="handleEditorKeydown"
      ></div>
    </div>

    <input ref="imageInput" class="hidden-input" type="file" accept="image/jpeg,image/png,image/webp,image/gif" @change="handleImageFile" />
    <p v-if="errorMessage" class="editor-error">{{ errorMessage }}</p>
  </div>
</template>

<script setup lang="ts">
import { sanitizeRichText } from '~/utils/richText'

const props = defineProps<{
  modelValue: string
  label: string
  placeholder?: string
  uploadFolder: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
  'image-uploaded': [imageId: string]
}>()

const { language } = useLanguage()
const { uploadImage, validateImageFile } = useFirestoreImages()
const editor = ref<HTMLElement | null>(null)
const imageInput = ref<HTMLInputElement | null>(null)
const isUploading = ref(false)
const errorMessage = ref('')
const activeFormats = reactive({
  h2: false,
  h3: false,
  bold: false,
  italic: false,
  underline: false,
  unorderedList: false,
  orderedList: false,
  blockquote: false,
  link: false,
})
let savedRange: Range | null = null

const selectionElement = () => {
  const selection = window.getSelection()
  const node = selection?.anchorNode
  if (!node || !editor.value?.contains(node)) return null
  return node.nodeType === Node.ELEMENT_NODE ? node as Element : node.parentElement
}

const resetActiveFormats = () => {
  Object.keys(activeFormats).forEach(key => { activeFormats[key as keyof typeof activeFormats] = false })
}

const commandState = (command: string) => {
  try { return document.queryCommandState(command) } catch { return false }
}

const updateActiveFormats = () => {
  const element = selectionElement()
  if (!element) { resetActiveFormats(); return }
  activeFormats.h2 = !!element.closest('h2')
  activeFormats.h3 = !!element.closest('h3')
  activeFormats.bold = !!element.closest('strong,b') || commandState('bold')
  activeFormats.italic = !!element.closest('em,i') || commandState('italic')
  activeFormats.underline = !!element.closest('u') || commandState('underline')
  activeFormats.unorderedList = !!element.closest('ul') || commandState('insertUnorderedList')
  activeFormats.orderedList = !!element.closest('ol') || commandState('insertOrderedList')
  activeFormats.blockquote = !!element.closest('blockquote')
  activeFormats.link = !!element.closest('a')
}

const rememberSelection = () => {
  const selection = window.getSelection()
  if (!selection?.rangeCount || !editor.value?.contains(selection.anchorNode)) return
  savedRange = selection.getRangeAt(0).cloneRange()
  updateActiveFormats()
}

const restoreSelection = () => {
  editor.value?.focus()
  if (!savedRange) return
  const selection = window.getSelection()
  selection?.removeAllRanges()
  selection?.addRange(savedRange)
}

const emitContent = () => {
  if (!editor.value) return
  emit('update:modelValue', sanitizeRichText(editor.value.innerHTML, true))
  rememberSelection()
}

const escapePlainText = (value: string) => {
  const container = document.createElement('div')
  container.textContent = value
  return container.innerHTML.replace(/\r?\n/g, '<br>')
}

const cleanPastedHtml = (html: string) => {
  const template = document.createElement('template')
  template.innerHTML = html

  Array.from(template.content.querySelectorAll('div')).reverse().forEach(block => {
    const paragraph = document.createElement('p')
    while (block.firstChild) paragraph.appendChild(block.firstChild)
    block.replaceWith(paragraph)
  })

  return sanitizeRichText(template.innerHTML, true)
}

const handlePaste = (event: ClipboardEvent) => {
  const clipboard = event.clipboardData
  if (!clipboard) return

  event.preventDefault()
  const sourceHtml = clipboard.getData('text/html')
  const sanitizedHtml = sourceHtml ? cleanPastedHtml(sourceHtml) : ''
  const cleanHtml = sanitizedHtml || escapePlainText(clipboard.getData('text/plain'))

  document.execCommand('insertHTML', false, cleanHtml)
  emitContent()
  requestAnimationFrame(updateActiveFormats)
}

const runCommand = (command: string, value?: string) => {
  restoreSelection()
  document.execCommand(command, false, value)
  emitContent()
  requestAnimationFrame(updateActiveFormats)
}

const placeCaret = (element: HTMLElement) => {
  const range = document.createRange()
  range.selectNodeContents(element)
  range.collapse(false)
  const selection = window.getSelection()
  selection?.removeAllRanges()
  selection?.addRange(range)
  savedRange = range.cloneRange()
}

const replaceWithParagraph = (block: HTMLElement) => {
  const childNodes = Array.from(block.childNodes)
  const hasBlockChildren = Array.from(block.children).some(child => ['P', 'H2', 'H3', 'UL', 'OL'].includes(child.tagName))
  if (hasBlockChildren) {
    const caretTarget = [...childNodes].reverse().find(node => node instanceof HTMLElement) as HTMLElement | undefined
    block.replaceWith(...childNodes)
    if (caretTarget) placeCaret(caretTarget)
    emitContent()
    return
  }
  const paragraph = document.createElement('p')
  while (block.firstChild) paragraph.appendChild(block.firstChild)
  if (!paragraph.childNodes.length) paragraph.appendChild(document.createElement('br'))
  block.replaceWith(paragraph)
  placeCaret(paragraph)
  emitContent()
}

const toggleBlock = (tag: 'h2' | 'h3' | 'blockquote') => {
  restoreSelection()
  const element = selectionElement()
  if (tag === 'blockquote') {
    const quote = element?.closest('blockquote') as HTMLElement | null
    if (quote) { replaceWithParagraph(quote); return }
    runCommand('formatBlock', '<blockquote>')
    return
  }
  runCommand('formatBlock', activeFormats[tag] ? '<p>' : `<${tag}>`)
}

const handleEditorKeydown = (event: KeyboardEvent) => {
  const element = selectionElement()
  const quote = element?.closest('blockquote') as HTMLElement | null
  if (!quote) return

  if (event.key === 'Backspace' && !(quote.textContent || '').replace(/\u200b/g, '').trim()) {
    event.preventDefault()
    replaceWithParagraph(quote)
    return
  }

  if (event.key !== 'Enter' || event.shiftKey) return
  event.preventDefault()
  if (!(quote.textContent || '').replace(/\u200b/g, '').trim()) {
    replaceWithParagraph(quote)
    return
  }
  const paragraph = document.createElement('p')
  paragraph.appendChild(document.createElement('br'))
  quote.insertAdjacentElement('afterend', paragraph)
  placeCaret(paragraph)
  emitContent()
}

const insertLink = () => {
  rememberSelection()
  const message = language.value === 'mn' ? 'Холбоосын хаягийг оруулна уу.' : '연결할 주소를 입력해 주세요.'
  const url = prompt(message, 'https://')?.trim()
  if (!url || !/^https?:\/\//i.test(url)) return
  runCommand('createLink', url)
}

const openImagePicker = () => {
  rememberSelection()
  imageInput.value?.click()
}

const handleImageFile = async (event: Event) => {
  const input = event.currentTarget as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  try {
    validateImageFile(file)
  } catch (error: any) {
    errorMessage.value = error.message || '이미지를 확인해 주세요.'
    input.value = ''
    window.alert(errorMessage.value)
    return
  }
  isUploading.value = true
  errorMessage.value = ''
  try {
    const uploaded = await uploadImage(file, props.uploadFolder, 'body')
    restoreSelection()
    const imageHtml = `<p><img src="${uploaded.dataUrl}" data-image-id="${uploaded.id}" alt=""></p><p><br></p>`
    document.execCommand('insertHTML', false, imageHtml)
    emit('image-uploaded', uploaded.id)
    emitContent()
  } catch (error: any) {
    errorMessage.value = error.message || '이미지를 삽입하지 못했습니다.'
  } finally {
    isUploading.value = false
    input.value = ''
  }
}

watch(() => props.modelValue, value => {
  if (!editor.value || document.activeElement === editor.value) return
  if (editor.value.innerHTML !== value) editor.value.innerHTML = value || ''
})

onMounted(() => {
  if (editor.value) editor.value.innerHTML = props.modelValue || ''
  document.addEventListener('selectionchange', updateActiveFormats)
})

onBeforeUnmount(() => document.removeEventListener('selectionchange', updateActiveFormats))
</script>

<style lang="scss" scoped>
.rich-editor-field { display: flex; flex-direction: column; gap: 7px; }
.editor-label-row { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
.editor-label-row label { color: $text-secondary; font-size: 13px; font-weight: 700; }
.editor-label-row span { color: $mn-blue; font-size: 13px; font-weight: 700; }
.rich-editor { overflow: hidden; background: #fff; border: 1px solid #cfd8d2; border-radius: 8px; }
.rich-editor:focus-within { border-color: $mn-blue; box-shadow: 0 0 0 3px rgba($mn-blue, .1); }
.rich-editor.uploading { opacity: .72; }
.editor-toolbar { display: flex; flex-wrap: wrap; align-items: center; gap: 4px; padding: 8px; background: #f3f6f4; border-bottom: 1px solid #dce4df; }
.editor-toolbar button { min-width: 34px; height: 32px; display: inline-flex; align-items: center; justify-content: center; gap: 5px; padding: 0 9px; color: #405249; background: #fff; border: 1px solid #d0dad4; border-radius: 5px; cursor: pointer; font-family: $font-body; font-size: 12px; }
.editor-toolbar button:hover,
.editor-toolbar button.active { color: #fff; background: $mn-blue; border-color: $mn-blue; }
.editor-toolbar button.active { box-shadow: inset 0 0 0 1px rgba(#fff, .22), 0 0 0 2px rgba($mn-blue, .12); }
.editor-toolbar button:disabled { cursor: wait; opacity: .5; }
.editor-toolbar svg { width: 16px; height: 16px; }
.toolbar-divider { width: 1px; height: 20px; margin: 0 3px; background: #d1dad5; }
.image-tool { margin-left: auto; font-weight: 800; }
.editor-content { min-height: 300px; padding: 24px; color: #34433c; outline: 0; font-size: 18px; line-height: 1.85; }
.editor-content:empty::before { content: attr(data-placeholder); color: #a0aaa4; pointer-events: none; }
.editor-content :deep(h2) { margin: 24px 0 12px; font-size: 28px; }
.editor-content :deep(h3) { margin: 20px 0 10px; font-size: 22px; }
.editor-content :deep(p) { margin: 0 0 14px; }
.editor-content :deep(ul), .editor-content :deep(ol) { margin: 12px 0; padding-left: 28px; }
.editor-content :deep(blockquote) { margin: 18px 0; padding: 12px 18px; color: #52665c; background: #f2f6f4; border-left: 4px solid $mn-blue; }
.editor-content :deep(img) { max-width: min(100%, 820px); height: auto; display: block; margin: 24px auto; }
.hidden-input { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); }
.editor-error { color: #9b3129; font-size: 13px; }
@media(max-width:640px) { .editor-content { min-height: 240px; padding: 18px 14px; } .image-tool { margin-left: 0; } }
</style>
