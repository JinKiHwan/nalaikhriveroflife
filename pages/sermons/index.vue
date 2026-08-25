<template>
  <div class="sermons-page">
    <header class="sermons-header">
      <div><h1>{{ t('home.recentSermon') }}</h1><p>{{ language === 'mn' ? 'Номлолын агуулгыг хоёр хэлээр хадгалж хуваалцана.' : '주일 강단에서 선포된 말씀을 한국어와 몽골어로 기록합니다.' }}</p></div>
      <button v-if="isMaster" type="button" class="btn btn-primary" @click="showForm ? cancelCreate() : openCreate()">{{ showForm ? t('common.cancel') : t('sermons.create') }}</button>
    </header>

    <section v-if="showForm" class="sermon-editor-card">
      <div class="editor-heading"><span>SERMON EDITOR</span><h2>{{ editingSermon ? (language === 'mn' ? 'Номлол засах' : '생명의 말씀 수정') : (language === 'mn' ? 'Шинэ номлол бүртгэх' : '새 생명의 말씀 등록') }}</h2><p>{{ language === 'mn' ? 'Гарчиг, номлогч, эшлэл болон агуулгыг хоёр хэлээр оруулна уу.' : '제목, 설교자, 본문 구절과 내용을 두 언어로 작성해 주세요.' }}</p></div>
      <form class="sermon-form" @submit.prevent="createSermon">
        <div class="form-grid shared-fields">
          <div class="form-group"><label for="sermon-date">{{ language === 'mn' ? 'Номлолын өдөр' : '설교 날짜' }}</label><input id="sermon-date" v-model="form.date" type="date" class="input-field" required /></div>
          <div class="form-group"><label for="sermon-author">{{ language === 'mn' ? 'Зохиогч' : '작성자' }}</label><input id="sermon-author" :value="userName" class="input-field" disabled /></div>
          <div class="form-group category-field">
            <label for="sermon-category">{{ language === 'mn' ? 'Мөргөлийн төрөл' : '예배 구분' }}</label>
            <select id="sermon-category" v-model="selectedCategoryId" class="input-field" required @change="applySelectedCategory">
              <option v-for="category in categoryOptions" :key="category.id" :value="category.id">{{ category.nameKo }} / {{ category.nameMn }}</option>
            </select>
          </div>
          <div class="form-group video-field"><label for="sermon-video">{{ language === 'mn' ? 'YouTube холбоос (сонголттой)' : 'YouTube 영상 주소 (선택)' }}</label><input id="sermon-video" v-model.trim="form.videoUrl" type="url" class="input-field" placeholder="https://youtube.com/..." /></div>
        </div>

        <div class="thumbnail-upload-section">
          <div class="upload-copy"><strong>{{ language === 'mn' ? 'Номлолын зураг' : '말씀 썸네일 이미지' }}</strong><span>{{ language === 'mn' ? 'WebP болгон хөрвүүлж, 1 МБ-аас бага хэмжээнд автоматаар тохируулна' : 'WebP 변환 · 1MB 이하로 자동 리사이징' }}</span></div>
          <label class="thumbnail-picker">
            <input type="file" accept="image/jpeg,image/png,image/webp" @change="handleThumbnailFile" />
            <span v-if="!thumbnailPreview" class="picker-empty"><b>＋</b>{{ language === 'mn' ? 'Зураг сонгох' : '이미지 선택' }}</span>
            <img v-else :src="thumbnailPreview" alt="말씀 썸네일 미리보기" />
          </label>
          <button v-if="thumbnailPreview" type="button" class="remove-thumbnail" @click="removeThumbnail">{{ language === 'mn' ? 'Зургийг арилгах' : '이미지 제거' }}</button>
        </div>

        <section class="language-panel">
          <div class="language-panel-title"><span>KO</span><strong>한국어 말씀</strong></div>
          <div class="form-grid">
            <div class="form-group"><label for="sermon-speaker-ko">설교자</label><input id="sermon-speaker-ko" v-model.trim="form.speakerKo" class="input-field" required /></div>
            <div class="form-group"><label for="sermon-title-ko">말씀 제목</label><input id="sermon-title-ko" v-model.trim="form.titleKo" class="input-field" required /></div>
            <div class="form-group"><label for="sermon-passage-ko">성경 본문</label><input id="sermon-passage-ko" v-model.trim="form.passageKo" class="input-field" required /></div>
          </div>
          <RichTextEditor v-model="form.contentKo" label="말씀 본문" placeholder="설교 내용과 말씀 원고를 작성해 주세요." :upload-folder="`sermons/${draftId}/ko`" @image-uploaded="trackBodyImage" />
        </section>

        <section class="language-panel">
          <div class="language-panel-title"><span>MN</span><strong>Монгол номлол</strong></div>
          <div class="form-grid">
            <div class="form-group"><label for="sermon-speaker-mn">Номлогч</label><input id="sermon-speaker-mn" v-model.trim="form.speakerMn" class="input-field" required /></div>
            <div class="form-group"><label for="sermon-title-mn">Номлолын гарчиг</label><input id="sermon-title-mn" v-model.trim="form.titleMn" class="input-field" required /></div>
            <div class="form-group"><label for="sermon-passage-mn">Библийн эшлэл</label><input id="sermon-passage-mn" v-model.trim="form.passageMn" class="input-field" required /></div>
          </div>
          <RichTextEditor v-model="form.contentMn" label="Номлолын агуулга" placeholder="Номлолын агуулгыг монгол хэлээр бичнэ үү." :upload-folder="`sermons/${draftId}/mn`" @image-uploaded="trackBodyImage" />
        </section>

        <p v-if="formError" class="form-error">{{ formError }}</p>
        <div class="form-actions"><button type="submit" class="btn btn-primary" :disabled="isSubmitting">{{ isSubmitting ? (language === 'mn' ? 'Хадгалж байна...' : '저장 중...') : (editingSermon ? t('common.save') : (language === 'mn' ? 'Номлол бүртгэх' : '말씀 등록하기')) }}</button></div>
      </form>
    </section>

    <div v-if="sermons.length" class="sermon-board-list">
      <div class="sermon-board-head"><span>{{ language === 'mn' ? 'Ангилал' : '카테고리' }}</span><span>{{ language === 'mn' ? 'Гарчиг' : '제목' }}</span><span>{{ language === 'mn' ? 'Огноо' : '날짜' }}</span><span></span></div>
      <div v-for="sermon in pagedSermons" :key="sermon.id" class="sermon-board-row" @click="navigateTo(`/sermons/${sermon.id}`)">
        <span class="board-category">{{ localizedCategory(sermon) }}</span>
        <strong>{{ localizedTitle(sermon) }}</strong>
        <time>{{ formatDate(sermon.date) }}</time>
        <div class="row-actions">
          <button v-if="canEdit(sermon)" type="button" class="edit-button" @click.stop="startEdit(sermon)">{{ t('common.edit') }}</button>
          <button v-if="isMaster" type="button" class="delete-button" @click.stop="deleteSermon(sermon)">{{ t('common.delete') }}</button>
        </div>
      </div>
    </div>
    <div v-else class="empty-board">{{ t('sermons.empty') }}</div>
    <PaginationNav v-model="currentPage" :total-pages="totalPages" />
  </div>
</template>

<script setup lang="ts">
import { addDoc, collection, deleteDoc, doc, getDocs, orderBy, query, updateDoc } from 'firebase/firestore'
import { prepareRichTextForSave, richTextImageIds } from '~/utils/richText'

const { isMaster, user, userName, runWithAuthRetry } = useAuth()
const { language, t } = useLanguage()
const route = useRoute()
const { $firebaseDb } = useNuxtApp()
const { uploadImage, getImage, deleteImage, validateImageFile } = useFirestoreImages()
const { categories, loadCategories } = useSermonCategories()
const sermons = ref<any[]>([])
const showForm = ref(false)
const isSubmitting = ref(false)
const formError = ref('')
const thumbnailFile = ref<File | null>(null)
const thumbnailPreview = ref('')
const uploadedThumbnailId = ref('')
const draftImageIds = ref<string[]>([])
const draftId = ref(crypto.randomUUID())
const editingSermon = ref<any | null>(null)
const existingThumbnailId = ref('')
const existingBodyImageIds = ref<string[]>([])
const thumbnailRemoved = ref(false)
const requestedEditHandled = ref(false)
const selectedCategoryId = ref('sunday')

const emptyForm = () => ({
  date: new Date().toISOString().slice(0, 10), videoUrl: '', categoryKo: '주일예배', categoryMn: 'Ням гарагийн мөргөл',
  titleKo: '', titleMn: '', speakerKo: '', speakerMn: '', passageKo: '', passageMn: '', contentKo: '', contentMn: '',
})
const form = ref(emptyForm())
const { currentPage, totalPages, pagedItems: pagedSermons, resetPage } = useClientPagination(sermons, 10)

const categoryOptions = computed(() => {
  const configured = categories.value.map(item => ({ ...item }))
  const currentKo = form.value.categoryKo.trim()
  const currentMn = form.value.categoryMn.trim()
  const exists = configured.some(item => item.nameKo === currentKo && item.nameMn === currentMn)
  return !exists && (currentKo || currentMn)
    ? [{ id: '__legacy__', nameKo: currentKo || '-', nameMn: currentMn || '-' }, ...configured]
    : configured
})

const applySelectedCategory = () => {
  const selected = categoryOptions.value.find(item => item.id === selectedCategoryId.value)
  if (!selected) return
  form.value.categoryKo = selected.nameKo
  form.value.categoryMn = selected.nameMn
}

const selectCategoryFromForm = () => {
  const matched = categories.value.find(item => item.nameKo === form.value.categoryKo && item.nameMn === form.value.categoryMn)
  selectedCategoryId.value = matched?.id || '__legacy__'
}

const fetchSermons = async () => {
  if (!$firebaseDb) return
  const snapshot = await runWithAuthRetry(() => getDocs(query(collection($firebaseDb, 'sermons'), orderBy('date', 'desc'))))
  sermons.value = snapshot.docs.map(item => ({ id: item.id, ...item.data() })).filter((sermon: any) => sermon.isHidden !== true)
  openRequestedEdit()
}

const canEdit = (sermon: any) => isMaster.value || (!!user.value && sermon.authorId === user.value.uid)
const clearThumbnailState = () => {
  if (thumbnailPreview.value.startsWith('blob:')) URL.revokeObjectURL(thumbnailPreview.value)
  thumbnailFile.value = null
  thumbnailPreview.value = ''
  uploadedThumbnailId.value = ''
}
const openCreate = () => {
  resetForm()
  showForm.value = true
  formError.value = ''
}
const startEdit = async (sermon: any) => {
  if (!canEdit(sermon)) return
  clearThumbnailState()
  editingSermon.value = sermon
  existingThumbnailId.value = sermon.thumbnailImageId || ''
  existingBodyImageIds.value = [...(sermon.bodyImageIds || [])]
  thumbnailRemoved.value = false
  draftImageIds.value = []
  draftId.value = sermon.id
  form.value = {
    date: sermon.date || new Date().toISOString().slice(0, 10),
    videoUrl: sermon.videoUrl || '',
    categoryKo: sermon.categoryKo || sermon.category || '주일예배',
    categoryMn: sermon.categoryMn || 'Ням гарагийн мөргөл',
    titleKo: sermon.titleKo || sermon.title || '',
    titleMn: sermon.titleMn || '',
    speakerKo: sermon.speakerKo || sermon.speaker || '',
    speakerMn: sermon.speakerMn || '',
    passageKo: sermon.passageKo || sermon.biblePassage || '',
    passageMn: sermon.passageMn || '',
    contentKo: sermon.contentKo || sermon.content || '',
    contentMn: sermon.contentMn || '',
  }
  selectCategoryFromForm()
  thumbnailPreview.value = sermon.thumbnailImageId ? await getImage(sermon.thumbnailImageId).catch(() => '') : (sermon.thumbnailUrl || '')
  showForm.value = true
  formError.value = ''
  nextTick(() => document.querySelector('.sermon-editor-card')?.scrollIntoView({ behavior: 'smooth', block: 'start' }))
}
const openRequestedEdit = () => {
  if (requestedEditHandled.value) return
  const editId = typeof route.query.edit === 'string' ? route.query.edit : ''
  if (!editId) return
  requestedEditHandled.value = true
  const sermon = sermons.value.find(item => item.id === editId)
  if (sermon && canEdit(sermon)) void startEdit(sermon)
}
const trackBodyImage = (imageId: string) => { if (!draftImageIds.value.includes(imageId)) draftImageIds.value.push(imageId) }
const handleThumbnailFile = (event: Event) => {
  const input = event.currentTarget as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  try {
    validateImageFile(file)
  } catch (error: any) {
    thumbnailFile.value = null
    input.value = ''
    formError.value = error.message || '이미지를 확인해 주세요.'
    window.alert(formError.value)
    return
  }
  formError.value = ''
  if (thumbnailPreview.value.startsWith('blob:')) URL.revokeObjectURL(thumbnailPreview.value)
  thumbnailFile.value = file
  thumbnailPreview.value = URL.createObjectURL(file)
  uploadedThumbnailId.value = ''
}
const removeThumbnail = () => {
  clearThumbnailState()
  thumbnailRemoved.value = true
}
const resetForm = () => {
  clearThumbnailState()
  form.value = emptyForm()
  const firstCategory = categories.value[0]
  if (firstCategory) {
    selectedCategoryId.value = firstCategory.id
    form.value.categoryKo = firstCategory.nameKo
    form.value.categoryMn = firstCategory.nameMn
  }
  draftImageIds.value = []
  draftId.value = crypto.randomUUID()
  editingSermon.value = null
  existingThumbnailId.value = ''
  existingBodyImageIds.value = []
  thumbnailRemoved.value = false
  formError.value = ''
}
const cancelCreate = async () => {
  showForm.value = false
  await Promise.all(draftImageIds.value.map(id => deleteImage(id).catch(() => undefined)))
  if (uploadedThumbnailId.value) await deleteImage(uploadedThumbnailId.value).catch(() => undefined)
  resetForm()
}

const createSermon = async () => {
  if (!$firebaseDb || !user.value) return
  if (!form.value.contentKo.trim() || !form.value.contentMn.trim()) { formError.value = '한국어와 몽골어 말씀 본문을 모두 작성해 주세요.'; return }
  isSubmitting.value = true
  formError.value = ''
  try {
    if (thumbnailFile.value && !uploadedThumbnailId.value) {
      const uploaded = await uploadImage(thumbnailFile.value, `sermons/${draftId.value}/thumbnail`, 'thumbnail')
      uploadedThumbnailId.value = uploaded.id
    }
    const contentKo = prepareRichTextForSave(form.value.contentKo)
    const contentMn = prepareRichTextForSave(form.value.contentMn)
    const bodyImageIds = Array.from(new Set([...draftImageIds.value, ...richTextImageIds(contentKo), ...richTextImageIds(contentMn)]))
    const payload = {
      ...form.value,
      title: form.value.titleKo, speaker: form.value.speakerKo, category: form.value.categoryKo, biblePassage: form.value.passageKo, content: contentKo,
      contentKo, contentMn,
      thumbnailImageId: uploadedThumbnailId.value || (!thumbnailRemoved.value ? existingThumbnailId.value : '') || null,
      bodyImageIds,
    }
    if (editingSermon.value) {
      const previousThumbnailId = existingThumbnailId.value
      const previousBodyImageIds = [...existingBodyImageIds.value]
      await updateDoc(doc($firebaseDb, 'sermons', editingSermon.value.id), {
        ...payload,
        updatedAt: new Date().toISOString(),
        updatedBy: user.value.uid,
      })
      const nextThumbnailId = payload.thumbnailImageId
      if (previousThumbnailId && previousThumbnailId !== nextThumbnailId) await deleteImage(previousThumbnailId).catch(() => undefined)
      await Promise.all(previousBodyImageIds.filter(id => !bodyImageIds.includes(id)).map(id => deleteImage(id).catch(() => undefined)))
    } else {
      await addDoc(collection($firebaseDb, 'sermons'), {
        ...payload,
        authorName: userName.value, authorId: user.value.uid, createdAt: new Date().toISOString(), isHidden: false,
      })
    }
    showForm.value = false
    resetForm()
    await fetchSermons()
    resetPage()
  } catch (error: any) {
    formError.value = error.message || '생명의 말씀을 등록하지 못했습니다.'
  } finally { isSubmitting.value = false }
}

const deleteSermon = async (sermon: any) => {
  const title = localizedTitle(sermon)
  const message = language.value === 'mn' ? `“${title}” номлолыг устгах уу?` : `“${title}” 말씀을 삭제할까요?`
  if (!$firebaseDb || !confirm(message)) return
  await deleteDoc(doc($firebaseDb, 'sermons', sermon.id))
  const imageIds = [sermon.thumbnailImageId, ...(sermon.bodyImageIds || [])].filter(Boolean)
  await Promise.all(imageIds.map((id: string) => deleteImage(id).catch(() => undefined)))
  await fetchSermons()
}

const localizedTitle = (sermon: any) => language.value === 'mn' ? (sermon.titleMn || sermon.titleKo || sermon.title) : (sermon.titleKo || sermon.title || sermon.titleMn)
const localizedCategory = (sermon: any) => language.value === 'mn' ? (sermon.categoryMn || sermon.categoryKo || sermon.category || 'Ням гарагийн мөргөл') : (sermon.categoryKo || sermon.category || sermon.categoryMn || '주일예배')
const formatDate = (value: string) => value ? new Date(value).toLocaleDateString(language.value === 'mn' ? 'mn-MN' : 'ko-KR') : ''

onMounted(async () => {
  await loadCategories()
  if (!route.query.edit) {
    const firstCategory = categories.value[0]
    if (firstCategory) {
      selectedCategoryId.value = firstCategory.id
      form.value.categoryKo = firstCategory.nameKo
      form.value.categoryMn = firstCategory.nameMn
    }
  }
  await fetchSermons()
})
onBeforeUnmount(() => { if (thumbnailPreview.value.startsWith('blob:')) URL.revokeObjectURL(thumbnailPreview.value) })
</script>

<style lang="scss" scoped>
.sermons-page { width: min(1380px, calc(100% - 64px)); min-height: calc(100vh - 76px); margin: 0 auto; padding: 54px 0 88px; }
.sermons-header { display: flex; align-items: flex-end; justify-content: space-between; gap: 24px; margin-bottom: 36px; padding-bottom: 22px; border-bottom: 2px solid #354c42; }
.sermons-header h1 { margin-bottom: 6px; font-size: 42px; }
.sermons-header p { color: $text-secondary; font-size: 18px; }
.sermon-editor-card { margin-bottom: 42px; padding: 34px; background: #fff; border: 1px solid #dce5df; box-shadow: 0 8px 28px rgba(#234437, .08); }
.editor-heading { margin-bottom: 26px; padding-bottom: 20px; border-bottom: 1px solid #dfe7e2; }
.editor-heading > span { color: $mn-blue; font-size: 13px; font-weight: 800; letter-spacing: .08em; }
.editor-heading h2 { margin: 5px 0; font-size: 30px; }
.editor-heading p { color: $text-secondary; font-size: 13px; }
.sermon-form { display: flex; flex-direction: column; gap: 24px; }
.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 2px 18px; }
.shared-fields { grid-template-columns: 1fr 1fr 1.25fr; }
.video-field { grid-column: 1 / -1; }
.thumbnail-upload-section { padding: 20px; background: #f4f7f5; border: 1px solid #d7e1db; }
.upload-copy { display: flex; flex-direction: column; margin-bottom: 13px; }
.upload-copy strong { font-size: 18px; }
.upload-copy span { color: $text-muted; font-size: 13px; }
.thumbnail-picker { width: min(660px, 100%); min-height: 240px; display: grid; place-items: center; overflow: hidden; background: #fff; border: 1px dashed #96aa9f; cursor: pointer; }
.thumbnail-picker input { position: absolute; width: 1px; height: 1px; clip: rect(0 0 0 0); }
.thumbnail-picker img { width: 100%; max-height: 420px; display: block; object-fit: contain; }
.picker-empty { display: flex; flex-direction: column; align-items: center; gap: 8px; color: #62756b; font-size: 13px; font-weight: 700; }
.picker-empty b { width: 46px; height: 46px; display: grid; place-items: center; color: #fff; background: $mn-blue; border-radius: 50%; font-size: 25px; font-weight: 400; }
.remove-thumbnail { margin-top: 10px; padding: 7px 11px; color: #5c6962; background: #fff; border: 1px solid #c8d2cc; cursor: pointer; font-size: 13px; }
.language-panel { padding: 24px; background: #fbfcfb; border: 1px solid #dce5df; }
.language-panel-title { display: flex; align-items: center; gap: 9px; margin-bottom: 18px; }
.language-panel-title span { padding: 4px 8px; color: #fff; background: $mn-blue; font-size: 11px; font-weight: 800; }
.language-panel-title strong { font-size: 20px; }
.form-actions { display: flex; justify-content: flex-end; }
.form-error { padding: 12px 14px; color: #933b34; background: #fff2f0; border: 1px solid #ebcac5; font-size: 13px; }
.sermon-board-head, .sermon-board-row { display: grid; grid-template-columns: 150px minmax(0, 1fr) 150px 142px; gap: 18px; align-items: center; }
.sermon-board-head { padding: 12px 18px; color: #68756e; background: #f1f4f2; font-size: 13px; font-weight: 700; }
.sermon-board-row { min-height: 76px; padding: 14px 18px; border-bottom: 1px solid #dfe8e2; cursor: pointer; }
.sermon-board-row:hover { background: #f4f8f5; }
.board-category { width: fit-content; padding: 4px 9px; color: #fff; background: $mn-blue; font-size: 13px; font-weight: 800; }
.sermon-board-row strong { overflow: hidden; color: #2d3a34; font-size: 20px; white-space: nowrap; text-overflow: ellipsis; }
.sermon-board-row time { color: #8e9a94; font-size: 13px; }
.row-actions { display: flex; justify-content: flex-end; gap: 6px; }
.edit-button, .delete-button { padding: 5px 9px; background: #fff; cursor: pointer; font-size: 13px; }
.edit-button { color: #116b4d; border: 1px solid #85aa9b; }
.delete-button { color: #653e39; border: 1px solid #c9b5b1; }
.empty-board { min-height: 260px; display: grid; place-items: center; color: $text-muted; background: #f0f3f1; font-size: 18px; }
@media(max-width:700px) { .sermons-page { width: calc(100% - 28px); padding-top: 36px; } .sermons-header { align-items: flex-start; flex-direction: column; } .sermons-header h1 { font-size: 36px; } .sermon-editor-card, .language-panel { padding: 20px 14px; } .form-grid { grid-template-columns: 1fr; } .video-field { grid-column: auto; } .sermon-board-head { display: none; } .sermon-board-row { grid-template-columns: 1fr auto; gap: 8px 12px; } .sermon-board-row strong { grid-column: 1 / -1; grid-row: 2; } .sermon-board-row time { grid-column: 2; grid-row: 1; } }
</style>
