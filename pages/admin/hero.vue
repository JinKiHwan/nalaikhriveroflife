<template>
  <div class="hero-admin-page">
    <header class="admin-header">
      <div>
        <span>MAIN VISUAL SETTINGS</span>
        <h1>{{ t('admin.heroTitle') }}</h1>
        <p>{{ t('admin.heroSubtitle') }}</p>
      </div>
      <button type="button" class="save-button" :disabled="isSaving || isLoading" @click="save">
        {{ isSaving ? (language === 'mn' ? 'Хадгалж байна...' : '저장 중...') : (language === 'mn' ? 'Хадгалах' : '변경사항 저장') }}
      </button>
    </header>

    <p v-if="message" :class="['message', { error: hasError }]">{{ message }}</p>

    <div v-if="isLoading" class="loading-card">{{ language === 'mn' ? 'Уншиж байна...' : '불러오는 중...' }}</div>
    <template v-else>
      <section class="preview-card">
        <div class="hero-preview">
          <img :src="imagePreview" alt="메인 비주얼 미리보기" @error="useDefaultPreview" />
          <div class="preview-shade"></div>
          <div class="preview-copy">
            <p>{{ form.verseMn }}</p>
            <span></span>
            <p>{{ form.verseKo }}</p>
            <small>{{ form.referenceMn }} · {{ form.referenceKo }}</small>
          </div>
        </div>
      </section>

      <section class="settings-card">
        <div class="card-heading">
          <h2>{{ language === 'mn' ? 'Эшлэл ба дэвсгэр зураг' : '말씀 및 배경 이미지' }}</h2>
          <p>{{ language === 'mn' ? 'Нүүр хуудсан дээр монгол эшлэл эхэнд харагдана.' : '메인 화면에서는 선택된 사이트 언어의 말씀이 먼저 표시됩니다.' }}</p>
        </div>

        <div class="language-panel">
          <div class="panel-title"><span>MN</span><strong>Монгол хэл</strong></div>
          <label for="hero-verse-mn">{{ language === 'mn' ? 'Монгол эшлэл' : '몽골어 말씀' }}</label>
          <textarea id="hero-verse-mn" v-model.trim="form.verseMn" rows="4" class="text-field" />
          <label for="hero-reference-mn">{{ language === 'mn' ? 'Эшлэлийн тэмдэглэгээ' : '몽골어 구절 표시' }}</label>
          <input id="hero-reference-mn" v-model.trim="form.referenceMn" class="text-field input-height" placeholder="Иохан 4:14" />
        </div>

        <div class="language-panel">
          <div class="panel-title"><span>KO</span><strong>한국어</strong></div>
          <label for="hero-verse-ko">한국어 말씀</label>
          <textarea id="hero-verse-ko" v-model.trim="form.verseKo" rows="4" class="text-field" />
          <label for="hero-reference-ko">한국어 구절 표시</label>
          <input id="hero-reference-ko" v-model.trim="form.referenceKo" class="text-field input-height" placeholder="요한복음 4:14" />
        </div>

        <div class="image-panel">
          <div class="image-copy">
            <strong>{{ language === 'mn' ? 'Дэвсгэр зураг' : '메인 비주얼 이미지' }}</strong>
            <span>{{ language === 'mn' ? 'WebP болгон автоматаар шахна. Эх зураг 30MB-аас бага байна.' : 'WebP로 자동 압축하며 원본은 30MB 이하까지 선택할 수 있습니다.' }}</span>
          </div>
          <label class="image-picker">
            <input ref="fileInput" type="file" accept="image/jpeg,image/png,image/webp" @change="handleImageFile" />
            <span>{{ language === 'mn' ? 'Зураг сонгох' : '이미지 선택' }}</span>
          </label>
          <button type="button" class="reset-image-button" @click="removeCustomImage">{{ language === 'mn' ? 'Үндсэн зураг ашиглах' : '기본 이미지로 되돌리기' }}</button>
        </div>
      </section>
    </template>
  </div>
</template>

<script setup lang="ts">
import { DEFAULT_HOME_HERO, type HomeHeroSettings } from '~/composables/useHomeHeroSettings'

definePageMeta({ layout: 'admin' })

const { language, t } = useLanguage()
const { heroSettings, loadHeroSettings, saveHeroSettings } = useHomeHeroSettings()
const { uploadImage, getImage, deleteImage, validateImageFile } = useFirestoreImages()
const defaultHeroImage = '/images/hero-steppe-river-v1.png'
const form = ref<HomeHeroSettings>({ ...DEFAULT_HOME_HERO })
const currentImageId = ref('')
const imageFile = ref<File | null>(null)
const imagePreview = ref(defaultHeroImage)
const imageRemoved = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)
const isLoading = ref(true)
const isSaving = ref(false)
const message = ref('')
const hasError = ref(false)

const clearBlobPreview = () => {
  if (imagePreview.value.startsWith('blob:')) URL.revokeObjectURL(imagePreview.value)
}

const load = async () => {
  isLoading.value = true
  message.value = ''
  try {
    await loadHeroSettings(true)
    form.value = { ...heroSettings.value }
    currentImageId.value = heroSettings.value.imageId
    imagePreview.value = currentImageId.value ? (await getImage(currentImageId.value) || defaultHeroImage) : defaultHeroImage
  } catch (error: any) {
    hasError.value = true
    message.value = error.message || (language.value === 'mn' ? 'Нүүр зургийн мэдээллийг уншиж чадсангүй.' : '메인 비주얼 설정을 불러오지 못했습니다.')
  } finally {
    isLoading.value = false
  }
}

const handleImageFile = (event: Event) => {
  const input = event.currentTarget as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  try {
    validateImageFile(file)
  } catch (error: any) {
    input.value = ''
    hasError.value = true
    message.value = error.message || (language.value === 'mn' ? 'Зургийг шалгана уу.' : '이미지를 확인해 주세요.')
    window.alert(message.value)
    return
  }
  clearBlobPreview()
  imageFile.value = file
  imagePreview.value = URL.createObjectURL(file)
  imageRemoved.value = false
  hasError.value = false
  message.value = ''
}

const removeCustomImage = () => {
  clearBlobPreview()
  imageFile.value = null
  imagePreview.value = defaultHeroImage
  imageRemoved.value = true
  if (fileInput.value) fileInput.value.value = ''
}

const save = async () => {
  message.value = ''
  hasError.value = false
  if (!form.value.verseMn.trim() || !form.value.verseKo.trim() || !form.value.referenceMn.trim() || !form.value.referenceKo.trim()) {
    hasError.value = true
    message.value = language.value === 'mn' ? 'Хоёр хэлний эшлэл болон тэмдэглэгээг бүгдийг оруулна уу.' : '몽골어와 한국어 말씀 및 구절 표시를 모두 입력해 주세요.'
    return
  }

  isSaving.value = true
  let uploadedImageId = ''
  try {
    let nextImageId = imageRemoved.value ? '' : currentImageId.value
    let nextImagePreview = imagePreview.value
    if (imageFile.value) {
      const uploaded = await uploadImage(imageFile.value, 'settings/home-hero', 'body')
      uploadedImageId = uploaded.id
      nextImageId = uploaded.id
      nextImagePreview = uploaded.dataUrl
    }

    await saveHeroSettings({ ...form.value, imageId: nextImageId })
    if (currentImageId.value && currentImageId.value !== nextImageId) await deleteImage(currentImageId.value).catch(() => undefined)

    clearBlobPreview()
    currentImageId.value = nextImageId
    form.value = { ...heroSettings.value }
    imagePreview.value = nextImagePreview || defaultHeroImage
    imageFile.value = null
    imageRemoved.value = false
    if (fileInput.value) fileInput.value.value = ''
    message.value = language.value === 'mn' ? 'Нүүр зургийн тохиргоог хадгаллаа.' : '메인 비주얼 설정을 저장했습니다.'
  } catch (error: any) {
    if (uploadedImageId) await deleteImage(uploadedImageId).catch(() => undefined)
    hasError.value = true
    message.value = error.message || (language.value === 'mn' ? 'Хадгалж чадсангүй.' : '메인 비주얼 설정을 저장하지 못했습니다.')
  } finally {
    isSaving.value = false
  }
}

const useDefaultPreview = (event: Event) => { (event.currentTarget as HTMLImageElement).src = defaultHeroImage }

onMounted(load)
onBeforeUnmount(clearBlobPreview)
</script>

<style lang="scss" scoped>
.hero-admin-page { width: min(1120px, 100%); min-height: 100%; margin: 0 auto; padding: 50px 0 88px; }
.admin-header { display: flex; align-items: flex-end; justify-content: space-between; gap: 24px; margin-bottom: 28px; padding-bottom: 22px; border-bottom: 1px solid #e3e6e3; }
.admin-header > div > span { color: #929793; font-size: 13px; font-weight: 800; letter-spacing: .1em; }
.admin-header h1 { margin: 7px 0 5px; font-size: 42px; }
.admin-header p { color: $text-secondary; font-size: 18px; }
.save-button { height: 40px; padding: 0 16px; color: #fff; background: #16815d; border: 1px solid #16815d; border-radius: 6px; cursor: pointer; font-family: $font-body; font-size: 13px; font-weight: 800; }
.save-button:hover { background: #116b4d; border-color: #116b4d; }
.save-button:disabled { cursor: wait; opacity: .55; }
.message { margin-bottom: 18px; padding: 13px 16px; color: #17654b; background: #edf8f3; border: 1px solid #c9e4d8; font-size: 13px; }
.message.error { color: #813d37; background: #fff3f1; border-color: #efd0cc; }
.loading-card { min-height: 260px; display: grid; place-items: center; color: #858c87; background: #fff; border: 1px solid #e3e6e3; font-size: 18px; }
.preview-card, .settings-card { padding: 24px; background: #fff; border: 1px solid #e3e6e3; border-radius: 10px; }
.preview-card { margin-bottom: 20px; }
.hero-preview { position: relative; height: 420px; overflow: hidden; background: #6f5a3f; border-radius: 7px; }
.hero-preview > img { width: 100%; height: 100%; display: block; object-fit: cover; }
.preview-shade { position: absolute; inset: 0; background: rgba(#21160e,.4); }
.preview-copy { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; flex-direction: column; padding: 30px; color: #fff; text-align: center; }
.preview-copy p { max-width: 820px; color: #fff; font-size: 20px; font-weight: 700; line-height: 1.65; white-space: pre-line; }
.preview-copy > span { width: 50px; height: 1px; margin: 18px 0; background: rgba(#fff,.7); }
.preview-copy small { margin-top: 18px; color: rgba(#fff,.75); font-size: 13px; font-weight: 800; letter-spacing: .08em; }
.settings-card { display: flex; flex-direction: column; gap: 20px; }
.card-heading { padding-bottom: 18px; border-bottom: 1px solid #e3e6e3; }
.card-heading h2 { margin-bottom: 5px; font-size: 26px; }
.card-heading p { color: #777f7a; font-size: 13px; }
.language-panel, .image-panel { padding: 22px; background: #fafbfa; border: 1px solid #dfe5e1; }
.panel-title { display: flex; align-items: center; gap: 9px; margin-bottom: 18px; }
.panel-title span { padding: 4px 8px; color: #fff; background: #16815d; font-size: 11px; font-weight: 800; }
.panel-title strong { font-size: 20px; }
.language-panel label { display: block; margin: 16px 0 7px; color: #4f5953; font-size: 13px; font-weight: 800; }
.text-field { width: 100%; padding: 12px 14px; color: #303632; background: #fff; border: 1px solid #d4ddd7; border-radius: 5px; resize: vertical; font-family: $font-body; font-size: 18px; line-height: 1.65; }
.text-field:focus { outline: 2px solid rgba(#16815d,.14); border-color: #72aa94; }
.input-height { height: 46px; padding-top: 0; padding-bottom: 0; }
.image-copy { display: flex; flex-direction: column; margin-bottom: 14px; }
.image-copy strong { font-size: 18px; }
.image-copy span { color: #7c857f; font-size: 13px; }
.image-picker { display: inline-flex; align-items: center; justify-content: center; height: 40px; padding: 0 15px; color: #fff; background: #16815d; border-radius: 5px; cursor: pointer; font-size: 13px; font-weight: 800; }
.image-picker input { position: absolute; width: 1px; height: 1px; clip: rect(0 0 0 0); }
.reset-image-button { height: 40px; margin-left: 8px; padding: 0 13px; color: #626b65; background: #fff; border: 1px solid #cad3cd; border-radius: 5px; cursor: pointer; font-family: $font-body; font-size: 13px; font-weight: 700; }
@media(max-width:760px) {
  .hero-admin-page { padding-top: 34px; }
  .admin-header { align-items: flex-start; flex-direction: column; }
  .admin-header h1 { font-size: 34px; }
  .preview-card, .settings-card { padding: 14px; }
  .hero-preview { height: 360px; }
  .preview-copy { padding: 20px 14px; }
  .preview-copy p { font-size: 16px; }
  .language-panel, .image-panel { padding: 18px 14px; }
  .text-field { font-size: 16px; }
  .image-picker, .reset-image-button { width: 100%; margin: 0; }
  .reset-image-button { margin-top: 8px; }
}
</style>
