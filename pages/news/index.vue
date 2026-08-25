<template>
  <div class="news-board-page">
    <header class="board-page-header">
      <div><h1>{{ language === 'mn' ? 'Чуулганы мэдээ' : '교회 소식' }}</h1><p>{{ language === 'mn' ? 'Налайх Амийн Усны Гол Чуулганы шинэ мэдээ.' : '날라흐 생명수 교회의 새로운 소식을 전합니다.' }}</p></div>
      <button v-if="isMaster" type="button" class="btn btn-primary" @click="showForm ? cancelCreate() : openCreate()">{{ showForm ? (language === 'mn' ? 'Болих' : '작성 취소') : (language === 'mn' ? 'Мэдээ нэмэх' : '소식 등록') }}</button>
    </header>

    <section v-if="showForm" class="create-card">
      <div class="create-heading"><span>CHURCH NEWS EDITOR</span><h2>{{ editingPost ? (language === 'mn' ? 'Чуулганы мэдээ засах' : '교회 소식 수정') : (language === 'mn' ? 'Шинэ мэдээ бичих' : '새 교회 소식 등록') }}</h2><p>{{ language === 'mn' ? 'Солонгос болон монгол хэл дээрх агуулгыг хамт оруулна уу.' : '한국어와 몽골어 내용을 함께 작성해 주세요.' }}</p></div>
      <form class="create-form" @submit.prevent="createPost">
        <div class="form-row">
          <div class="form-group"><label for="news-date">{{ language === 'mn' ? 'Нийтлэх өдөр' : '게시 날짜' }}</label><input id="news-date" v-model="form.date" type="date" class="input-field" required /></div>
          <div class="form-group"><label for="news-author">{{ language === 'mn' ? 'Зохиогч' : '작성자' }}</label><input id="news-author" :value="userName" class="input-field" disabled /></div>
        </div>

        <div class="thumbnail-upload-section">
          <div class="upload-copy"><strong>{{ language === 'mn' ? 'Жижиг зураг' : '썸네일 이미지' }}</strong><span>{{ language === 'mn' ? 'WebP болгон хөрвүүлж, 1 МБ-аас бага хэмжээнд автоматаар тохируулна' : 'WebP 변환 · 1MB 이하로 자동 리사이징' }}</span></div>
          <label class="thumbnail-picker">
            <input type="file" accept="image/jpeg,image/png,image/webp" @change="handleThumbnailFile" />
            <span v-if="!thumbnailPreview" class="picker-empty"><b>＋</b>{{ language === 'mn' ? 'Зураг сонгох' : '이미지 선택' }}</span>
            <img v-else :src="thumbnailPreview" alt="썸네일 미리보기" />
          </label>
          <button v-if="thumbnailPreview" type="button" class="remove-thumbnail" @click="removeThumbnail">{{ language === 'mn' ? 'Зургийг арилгах' : '이미지 제거' }}</button>
        </div>

        <div class="language-fields">
          <section class="language-panel">
            <div class="language-panel-title"><span>KO</span><strong>한국어</strong></div>
            <div class="form-group"><label for="news-title-ko">제목</label><input id="news-title-ko" v-model.trim="form.titleKo" class="input-field" required /></div>
            <RichTextEditor v-model="form.contentKo" label="본문" placeholder="교회 소식 내용을 작성해 주세요." :upload-folder="`church-news/${draftId}/ko`" @image-uploaded="trackBodyImage" />
          </section>

          <section class="language-panel">
            <div class="language-panel-title"><span>MN</span><strong>Монгол хэл</strong></div>
            <div class="form-group"><label for="news-title-mn">Гарчиг</label><input id="news-title-mn" v-model.trim="form.titleMn" class="input-field" required /></div>
            <RichTextEditor v-model="form.contentMn" label="Үндсэн агуулга" placeholder="Чуулганы мэдээг монгол хэлээр бичнэ үү." :upload-folder="`church-news/${draftId}/mn`" @image-uploaded="trackBodyImage" />
          </section>
        </div>

        <p v-if="formError" class="form-error">{{ formError }}</p>
        <div class="form-actions"><button class="btn btn-primary" :disabled="isSubmitting">{{ isSubmitting ? (language === 'mn' ? 'Хадгалж байна...' : '저장 중...') : (editingPost ? t('common.save') : (language === 'mn' ? 'Нийтлэх' : '등록하기')) }}</button></div>
      </form>
    </section>

    <div v-if="posts.length" class="thumbnail-board">
      <article v-for="post in posts" :key="post.id" class="thumbnail-card">
        <nuxt-link :to="`/news/${post.id}`" class="card-link">
          <div class="thumbnail"><img :src="thumbnailSource(post)" :alt="localizedTitle(post)" @error="useDefaultImage" /></div>
          <div class="card-copy">
            <div class="card-meta"><time>{{ formatDate(post.date || post.createdAt) }}</time></div>
            <h2>{{ localizedTitle(post) }}</h2>
            <p>{{ localizedExcerpt(post) }}</p>
          </div>
        </nuxt-link>
        <div v-if="canEdit(post) || isMaster" class="card-actions">
          <button v-if="canEdit(post)" type="button" class="edit-button" @click="startEdit(post)">{{ t('common.edit') }}</button>
          <button v-if="isMaster" type="button" class="delete-button" @click="deletePost(post)">{{ language === 'mn' ? 'Устгах' : '삭제' }}</button>
        </div>
      </article>
    </div>
    <div v-else class="empty-board">{{ language === 'mn' ? 'Бүртгэгдсэн чуулганы мэдээ алга байна.' : '등록된 교회 소식이 없습니다.' }}</div>
  </div>
</template>

<script setup lang="ts">
import { addDoc, collection, deleteDoc, doc, getDocs, orderBy, query, updateDoc } from 'firebase/firestore'
import { prepareRichTextForSave, richTextExcerpt, richTextImageIds } from '~/utils/richText'

const { isMaster, user, userName } = useAuth()
const { language, t } = useLanguage()
const route = useRoute()
const { $firebaseDb } = useNuxtApp()
const { uploadImage, getImage, deleteImage, validateImageFile } = useFirestoreImages()
const defaultImage = '/images/bg_04.webp'
const posts = ref<any[]>([])
const showForm = ref(false)
const isSubmitting = ref(false)
const formError = ref('')
const thumbnailFile = ref<File | null>(null)
const thumbnailPreview = ref('')
const uploadedThumbnailId = ref('')
const draftImageIds = ref<string[]>([])
const thumbnailSources = ref<Record<string, string>>({})
const draftId = ref(crypto.randomUUID())
const editingPost = ref<any | null>(null)
const existingThumbnailId = ref('')
const existingBodyImageIds = ref<string[]>([])
const thumbnailRemoved = ref(false)
const requestedEditHandled = ref(false)

const emptyForm = () => ({
  date: new Date().toISOString().slice(0, 10), titleKo: '', titleMn: '', contentKo: '', contentMn: '',
})
const form = ref(emptyForm())

const fetchPosts = async () => {
  if (!$firebaseDb) return
  const snapshot = await getDocs(query(collection($firebaseDb, 'church_news'), orderBy('date', 'desc')))
  posts.value = snapshot.docs.map(item => ({ id: item.id, ...item.data() })).filter((post: any) => post.isHidden !== true)
  await Promise.all(posts.value.map(async post => {
    if (post.thumbnailImageId) thumbnailSources.value[post.id] = await getImage(post.thumbnailImageId)
  }))
  openRequestedEdit()
}

const canEdit = (post: any) => isMaster.value || (!!user.value && post.authorId === user.value.uid)
const clearThumbnailState = () => {
  if (thumbnailPreview.value.startsWith('blob:')) URL.revokeObjectURL(thumbnailPreview.value)
  thumbnailFile.value = null
  thumbnailPreview.value = ''
  uploadedThumbnailId.value = ''
}
const openCreate = () => {
  editingPost.value = null
  existingThumbnailId.value = ''
  existingBodyImageIds.value = []
  thumbnailRemoved.value = false
  showForm.value = true
  formError.value = ''
}
const startEdit = (post: any) => {
  if (!canEdit(post)) return
  clearThumbnailState()
  editingPost.value = post
  existingThumbnailId.value = post.thumbnailImageId || ''
  existingBodyImageIds.value = [...(post.bodyImageIds || [])]
  thumbnailRemoved.value = false
  draftImageIds.value = []
  draftId.value = post.id
  form.value = {
    date: post.date || new Date().toISOString().slice(0, 10),
    titleKo: post.titleKo || post.title || '',
    titleMn: post.titleMn || '',
    contentKo: post.contentKo || post.content || '',
    contentMn: post.contentMn || '',
  }
  thumbnailPreview.value = thumbnailSource(post)
  showForm.value = true
  formError.value = ''
  nextTick(() => document.querySelector('.create-card')?.scrollIntoView({ behavior: 'smooth', block: 'start' }))
}
const openRequestedEdit = () => {
  if (requestedEditHandled.value) return
  const editId = typeof route.query.edit === 'string' ? route.query.edit : ''
  if (!editId) return
  requestedEditHandled.value = true
  const post = posts.value.find(item => item.id === editId)
  if (post && canEdit(post)) startEdit(post)
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
  draftImageIds.value = []
  draftId.value = crypto.randomUUID()
  editingPost.value = null
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

const createPost = async () => {
  if (!$firebaseDb || !user.value) return
  if (!form.value.contentKo.trim() || !form.value.contentMn.trim()) { formError.value = '한국어와 몽골어 본문을 모두 작성해 주세요.'; return }
  isSubmitting.value = true
  formError.value = ''
  try {
    if (thumbnailFile.value && !uploadedThumbnailId.value) {
      const uploaded = await uploadImage(thumbnailFile.value, `church-news/${draftId.value}/thumbnail`, 'thumbnail')
      uploadedThumbnailId.value = uploaded.id
    }
    const contentKo = prepareRichTextForSave(form.value.contentKo)
    const contentMn = prepareRichTextForSave(form.value.contentMn)
    const bodyImageIds = Array.from(new Set([...draftImageIds.value, ...richTextImageIds(contentKo), ...richTextImageIds(contentMn)]))
    const payload = {
      ...form.value,
      title: form.value.titleKo, content: contentKo,
      contentKo, contentMn,
      thumbnailImageId: uploadedThumbnailId.value || (!thumbnailRemoved.value ? existingThumbnailId.value : '') || null,
      bodyImageIds,
    }
    if (editingPost.value) {
      const previousThumbnailId = existingThumbnailId.value
      const previousBodyImageIds = [...existingBodyImageIds.value]
      await updateDoc(doc($firebaseDb, 'church_news', editingPost.value.id), {
        ...payload,
        updatedAt: new Date().toISOString(),
        updatedBy: user.value.uid,
      })
      const nextThumbnailId = payload.thumbnailImageId
      if (previousThumbnailId && previousThumbnailId !== nextThumbnailId) await deleteImage(previousThumbnailId).catch(() => undefined)
      await Promise.all(previousBodyImageIds.filter(id => !bodyImageIds.includes(id)).map(id => deleteImage(id).catch(() => undefined)))
    } else {
      await addDoc(collection($firebaseDb, 'church_news'), {
        ...payload,
        authorName: userName.value, authorId: user.value.uid, createdAt: new Date().toISOString(), isHidden: false,
      })
    }
    showForm.value = false
    resetForm()
    await fetchPosts()
  } catch (error: any) {
    formError.value = error.message || '교회 소식을 등록하지 못했습니다.'
  } finally { isSubmitting.value = false }
}

const deletePost = async (post: any) => {
  const title = localizedTitle(post)
  const message = language.value === 'mn' ? `“${title}” мэдээг устгах уу?` : `“${title}” 소식을 삭제할까요?`
  if (!$firebaseDb || !confirm(message)) return
  await deleteDoc(doc($firebaseDb, 'church_news', post.id))
  const imageIds = [post.thumbnailImageId, ...(post.bodyImageIds || [])].filter(Boolean)
  await Promise.all(imageIds.map((id: string) => deleteImage(id).catch(() => undefined)))
  await fetchPosts()
}

const localizedTitle = (post: any) => language.value === 'mn' ? (post.titleMn || post.titleKo || post.title) : (post.titleKo || post.title || post.titleMn)
const localizedContent = (post: any) => language.value === 'mn' ? (post.contentMn || post.contentKo || post.content) : (post.contentKo || post.content || post.contentMn)
const localizedExcerpt = (post: any) => richTextExcerpt(localizedContent(post))
const thumbnailSource = (post: any) => thumbnailSources.value[post.id] || post.thumbnailUrl || defaultImage
const useDefaultImage = (event: Event) => { (event.currentTarget as HTMLImageElement).src = defaultImage }
const formatDate = (value: string) => value ? value.slice(0, 10).replaceAll('-', '. ') : ''

onMounted(fetchPosts)
onBeforeUnmount(() => { if (thumbnailPreview.value.startsWith('blob:')) URL.revokeObjectURL(thumbnailPreview.value) })
</script>

<style lang="scss" scoped>
.news-board-page { width: min(1380px, calc(100% - 64px)); min-height: calc(100vh - 76px); margin: 0 auto; padding: 54px 0 88px; }
.board-page-header { display: flex; align-items: flex-end; justify-content: space-between; gap: 24px; margin-bottom: 36px; padding-bottom: 22px; border-bottom: 2px solid #354c42; }
.board-page-header h1 { margin-bottom: 6px; font-size: 42px; }
.board-page-header p { color: $text-secondary; font-size: 18px; }
.create-card { margin-bottom: 46px; padding: 34px; background: #fff; border: 1px solid #dce5df; box-shadow: 0 8px 28px rgba(#234437, .08); }
.create-heading { margin-bottom: 26px; padding-bottom: 20px; border-bottom: 1px solid #dfe7e2; }
.create-heading > span { color: $mn-blue; font-size: 13px; font-weight: 800; letter-spacing: .08em; }
.create-heading h2 { margin: 5px 0; font-size: 30px; }
.create-heading p { color: $text-secondary; font-size: 13px; }
.create-form { display: flex; flex-direction: column; gap: 22px; }
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; }
.thumbnail-upload-section { padding: 20px; background: #f4f7f5; border: 1px solid #d7e1db; }
.upload-copy { display: flex; flex-direction: column; margin-bottom: 13px; }
.upload-copy strong { font-size: 18px; }
.upload-copy span { color: $text-muted; font-size: 13px; }
.thumbnail-picker { width: min(560px, 100%); min-height: 220px; display: grid; place-items: center; overflow: hidden; background: #fff; border: 1px dashed #96aa9f; cursor: pointer; }
.thumbnail-picker input { position: absolute; width: 1px; height: 1px; clip: rect(0 0 0 0); }
.thumbnail-picker img { width: 100%; max-height: 360px; display: block; object-fit: contain; }
.picker-empty { display: flex; flex-direction: column; align-items: center; gap: 8px; color: #62756b; font-size: 13px; font-weight: 700; }
.picker-empty b { width: 46px; height: 46px; display: grid; place-items: center; color: #fff; background: $mn-blue; border-radius: 50%; font-size: 25px; font-weight: 400; }
.remove-thumbnail { margin-top: 10px; padding: 7px 11px; color: #5c6962; background: #fff; border: 1px solid #c8d2cc; cursor: pointer; font-size: 13px; }
.language-fields { display: grid; grid-template-columns: 1fr; gap: 24px; }
.language-panel { padding: 24px; background: #fbfcfb; border: 1px solid #dce5df; }
.language-panel-title { display: flex; align-items: center; gap: 9px; margin-bottom: 18px; }
.language-panel-title span { padding: 4px 8px; color: #fff; background: $mn-blue; font-size: 11px; font-weight: 800; }
.language-panel-title strong { font-size: 20px; }
.form-actions { display: flex; justify-content: flex-end; }
.form-error { padding: 12px 14px; color: #933b34; background: #fff2f0; border: 1px solid #ebcac5; font-size: 13px; }
.thumbnail-board { display: grid; grid-template-columns: repeat(3, 1fr); gap: 34px 20px; }
.thumbnail-card { position: relative; min-width: 0; }
.card-link { display: block; color: #26332e; }
.card-link:hover { color: #26332e; }
.thumbnail { aspect-ratio: 1.5/1; overflow: hidden; background: #e5ece8; }
.thumbnail img { width: 100%; height: 100%; display: block; object-fit: cover; transition: transform .4s ease; }
.card-link:hover img { transform: scale(1.04); }
.card-copy { padding: 16px 2px 0; }
.card-meta { display: flex; gap: 10px; color: #8e9a94; font-size: 13px; font-weight: 500; }
.card-copy h2 { margin: 9px 0 7px; font-size: 20px; line-height: 1.45; }
.card-copy p { display: -webkit-box; overflow: hidden; color: #68746e; font-size: 18px; line-height: 1.65; -webkit-box-orient: vertical; -webkit-line-clamp: 3; }
.card-actions { position: absolute; right: 8px; top: 8px; display: flex; gap: 6px; }
.edit-button, .delete-button { padding: 6px 10px; color: #fff; border: 0; cursor: pointer; font-size: 13px; }
.edit-button { background: rgba(#16815d, .94); }
.delete-button { background: rgba(#643c37, .9); }
.empty-board { min-height: 260px; display: grid; place-items: center; color: $text-muted; background: #f0f3f1; font-size: 18px; }
@media(max-width:980px) { .thumbnail-board { grid-template-columns: 1fr 1fr; } .news-board-page { width: calc(100% - 40px); } }
@media(max-width:640px) { .news-board-page { width: calc(100% - 28px); padding-top: 36px; } .board-page-header { align-items: flex-start; flex-direction: column; } .board-page-header h1 { font-size: 36px; } .thumbnail-board, .form-row { grid-template-columns: 1fr; } .create-card, .language-panel { padding: 20px 14px; } }
</style>
