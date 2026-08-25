<template>
  <div class="notices-page">
    <div class="notices-header">
      <div>
        <h1>{{ t('notices.title') }}</h1>
        <p class="subtitle">{{ t('notices.subtitle') }}</p>
      </div>

      <button 
        v-if="isMaster" 
        @click="toggleCreateForm"
        class="btn btn-primary"
      >
        {{ showCreateForm ? t('common.cancel') : t('notices.create') }}
      </button>
    </div>

    <transition name="expand">
      <section v-if="showCreateForm" class="create-card">
        <div class="create-heading">
          <span>NOTICE EDITOR</span>
          <h2>{{ editingNotice ? (language === 'mn' ? 'Зарлал засах' : '공지사항 수정') : (language === 'mn' ? 'Шинэ зарлал бичих' : '새 공지사항 작성') }}</h2>
          <p>{{ language === 'mn' ? 'Солонгос болон монгол хэл дээрх гарчиг, агуулгыг хамт оруулна уу.' : '한국어와 몽골어 제목 및 본문을 함께 작성해 주세요.' }}</p>
        </div>
        <form @submit.prevent="handleCreateNotice" class="create-form">
          <div class="form-row notice-options">
            <div class="form-group">
              <label for="notice-author">{{ language === 'mn' ? 'Зохиогч' : '작성자' }}</label>
              <input id="notice-author" :value="userName" class="input-field" disabled />
            </div>
            <div class="form-group form-checkbox">
              <label class="checkbox-container">
                <input type="checkbox" v-model="newNotice.isPinned" />
                <span>{{ language === 'mn' ? 'Энэ зарлалыг жагсаалтын эхэнд тогтоох' : '이 공지를 목록 최상단에 고정' }}</span>
              </label>
            </div>
          </div>

          <div class="language-fields">
            <section class="language-panel">
              <div class="language-panel-title"><span>KO</span><strong>한국어</strong></div>
              <div class="form-group"><label for="notice-title-ko">공지 제목</label><input id="notice-title-ko" v-model.trim="newNotice.titleKo" class="input-field" required /></div>
              <RichTextEditor v-model="newNotice.contentKo" label="공지 내용" placeholder="공지할 상세 내용을 작성해 주세요." :upload-folder="`notices/${draftId}/ko`" @image-uploaded="trackBodyImage" />
            </section>

            <section class="language-panel">
              <div class="language-panel-title"><span>MN</span><strong>Монгол хэл</strong></div>
              <div class="form-group"><label for="notice-title-mn">Зарлалын гарчиг</label><input id="notice-title-mn" v-model.trim="newNotice.titleMn" class="input-field" required /></div>
              <RichTextEditor v-model="newNotice.contentMn" label="Зарлалын агуулга" placeholder="Зарлалын дэлгэрэнгүй агуулгыг бичнэ үү." :upload-folder="`notices/${draftId}/mn`" @image-uploaded="trackBodyImage" />
            </section>
          </div>

          <p v-if="formError" class="form-error">{{ formError }}</p>
          <div class="form-actions">
            <button type="submit" class="btn btn-primary" :disabled="isSubmitting">
              {{ isSubmitting ? (language === 'mn' ? 'Хадгалж байна...' : '저장 중...') : (editingNotice ? t('common.save') : (language === 'mn' ? 'Зарлал нийтлэх' : '공지 등록')) }}
            </button>
          </div>
        </form>
      </section>
    </transition>

    <!-- Notices Board List -->
    <div class="notices-list">
      <div v-if="displayNotices.length" class="notice-board-list">
        <div class="notice-board-head"><span>{{ language === 'mn' ? 'Ангилал' : '카테고리' }}</span><span>{{ language === 'mn' ? 'Гарчиг' : '제목' }}</span><span>{{ language === 'mn' ? 'Огноо' : '날짜' }}</span><span></span></div>
        <div v-for="n in displayNotices" :key="n.id" :class="['notice-board-row', { pinned: n.isPinned }]" @click="navigateToDetail(n.id)">
          <span class="board-category">{{ n.isPinned ? t('notices.pinned') : (language === 'mn' ? 'Зарлал' : '공지사항') }}</span>
          <strong>{{ localizedTitle(n) }}</strong>
          <time>{{ formatDate(n.createdAt) }}</time>
          <div class="row-actions">
            <button v-if="canEdit(n)" type="button" class="btn-edit" @click.stop="startEdit(n)">{{ t('common.edit') }}</button>
            <button v-if="isMaster" type="button" @click.stop="handleDeleteNotice(n)" class="btn-delete">{{ t('common.delete') }}</button>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="glass-card empty-card">
        <p>{{ t('notices.empty') }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { collection, getDocs, addDoc, doc, deleteDoc, query, orderBy, updateDoc } from 'firebase/firestore'
import { prepareRichTextForSave, richTextExcerpt, richTextImageIds } from '~/utils/richText'

const { isMaster, user, userName } = useAuth()
const { language, t } = useLanguage()
const route = useRoute()
const { $firebaseDb } = useNuxtApp()
const { deleteImage } = useFirestoreImages()

const allNotices = ref<any[]>([])
const showCreateForm = ref(false)
const isSubmitting = ref(false)
const formError = ref('')
const draftImageIds = ref<string[]>([])
const draftId = ref(crypto.randomUUID())
const editingNotice = ref<any | null>(null)
const existingBodyImageIds = ref<string[]>([])
const requestedEditHandled = ref(false)

const emptyNotice = () => ({ titleKo: '', titleMn: '', contentKo: '', contentMn: '', isPinned: false })
const newNotice = ref(emptyNotice())

const fetchNotices = async () => {
  try {
    const q = query(collection($firebaseDb, 'notices'), orderBy('createdAt', 'desc'))
    const snap = await getDocs(q)
    const list: any[] = []
    snap.forEach((d) => {
      list.push({
        id: d.id,
        ...d.data()
      })
    })
    allNotices.value = list.filter(notice => notice.isHidden !== true)
    openRequestedEdit()
  } catch (err) {
    console.error('Error fetching notices:', err)
  }
}

// Client-side grouping of Pinned and Regular notices
const pinnedNotices = computed(() => {
  return allNotices.value.filter(n => n.isPinned === true)
})

const regularNotices = computed(() => {
  return allNotices.value.filter(n => n.isPinned !== true)
})

const displayNotices = computed(() => [...pinnedNotices.value, ...regularNotices.value])

onMounted(fetchNotices)

const canEdit = (notice: any) => isMaster.value || (!!user.value && notice.authorId === user.value.uid)
const openCreateForm = () => {
  editingNotice.value = null
  existingBodyImageIds.value = []
  showCreateForm.value = true
  formError.value = ''
}
const startEdit = (notice: any) => {
  if (!canEdit(notice)) return
  editingNotice.value = notice
  existingBodyImageIds.value = [...(notice.bodyImageIds || [])]
  draftImageIds.value = []
  draftId.value = notice.id
  newNotice.value = {
    titleKo: notice.titleKo || notice.title || '',
    titleMn: notice.titleMn || '',
    contentKo: notice.contentKo || notice.content || '',
    contentMn: notice.contentMn || '',
    isPinned: notice.isPinned === true,
  }
  showCreateForm.value = true
  formError.value = ''
  nextTick(() => document.querySelector('.create-card')?.scrollIntoView({ behavior: 'smooth', block: 'start' }))
}
const openRequestedEdit = () => {
  if (requestedEditHandled.value) return
  const editId = typeof route.query.edit === 'string' ? route.query.edit : ''
  if (!editId) return
  requestedEditHandled.value = true
  const notice = allNotices.value.find(item => item.id === editId)
  if (notice && canEdit(notice)) startEdit(notice)
}
const trackBodyImage = (imageId: string) => { if (!draftImageIds.value.includes(imageId)) draftImageIds.value.push(imageId) }
const resetCreateForm = () => {
  newNotice.value = emptyNotice()
  draftImageIds.value = []
  draftId.value = crypto.randomUUID()
  editingNotice.value = null
  existingBodyImageIds.value = []
  formError.value = ''
}
const cancelCreateForm = async () => {
  showCreateForm.value = false
  await Promise.all(draftImageIds.value.map(id => deleteImage(id).catch(() => undefined)))
  resetCreateForm()
}
const toggleCreateForm = () => showCreateForm.value ? cancelCreateForm() : openCreateForm()

const handleCreateNotice = async () => {
  if (!$firebaseDb || !user.value) return
  if (!richTextExcerpt(newNotice.value.contentKo) || !richTextExcerpt(newNotice.value.contentMn)) {
    formError.value = language.value === 'mn' ? 'Солонгос болон монгол хэл дээрх агуулгыг хоёуланг нь бичнэ үү.' : '한국어와 몽골어 본문을 모두 작성해 주세요.'
    return
  }
  isSubmitting.value = true
  formError.value = ''
  try {
    const contentKo = prepareRichTextForSave(newNotice.value.contentKo)
    const contentMn = prepareRichTextForSave(newNotice.value.contentMn)
    const bodyImageIds = Array.from(new Set([...draftImageIds.value, ...richTextImageIds(contentKo), ...richTextImageIds(contentMn)]))
    const payload = {
      titleKo: newNotice.value.titleKo,
      titleMn: newNotice.value.titleMn,
      title: newNotice.value.titleKo,
      contentKo,
      contentMn,
      content: contentKo,
      isPinned: newNotice.value.isPinned,
      bodyImageIds,
    }
    if (editingNotice.value) {
      const previousBodyImageIds = [...existingBodyImageIds.value]
      await updateDoc(doc($firebaseDb, 'notices', editingNotice.value.id), {
        ...payload,
        updatedAt: new Date().toISOString(),
        updatedBy: user.value.uid,
      })
      await Promise.all(previousBodyImageIds.filter(id => !bodyImageIds.includes(id)).map(id => deleteImage(id).catch(() => undefined)))
    } else {
      await addDoc(collection($firebaseDb, 'notices'), {
        ...payload,
        authorName: userName.value,
        authorId: user.value.uid,
        createdAt: new Date().toISOString(),
        isHidden: false
      })
    }
    showCreateForm.value = false
    resetCreateForm()
    await fetchNotices()
  } catch (err: any) {
    console.error('Error adding notice:', err)
    formError.value = err.message || (language.value === 'mn' ? 'Зарлал нийтэлж чадсангүй.' : '공지 작성에 실패했습니다.')
  } finally {
    isSubmitting.value = false
  }
}

const handleDeleteNotice = async (notice: any) => {
  const title = localizedTitle(notice)
  const message = language.value === 'mn' ? `“${title}” зарлалыг бүрмөсөн устгах уу?` : `공지사항 "${title}" 글을 완전히 삭제하시겠습니까?`
  if (!confirm(message)) return
  try {
    await deleteDoc(doc($firebaseDb, 'notices', notice.id))
    await Promise.all((notice.bodyImageIds || []).map((id: string) => deleteImage(id).catch(() => undefined)))
    await fetchNotices()
  } catch (err) {
    console.error('Error deleting notice:', err)
    alert('삭제에 실패했습니다.')
  }
}

const navigateToDetail = (id: string) => {
  navigateTo(`/notices/${id}`)
}

const formatDate = (dateStr: string) => {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString(language.value === 'mn' ? 'mn-MN' : 'ko-KR')
}

const localizedTitle = (notice: any) => language.value === 'mn' ? (notice.titleMn || notice.titleKo || notice.title) : (notice.titleKo || notice.title || notice.titleMn)

onBeforeUnmount(() => {
  if (draftImageIds.value.length) void Promise.all(draftImageIds.value.map(id => deleteImage(id).catch(() => undefined)))
})
</script>

<style lang="scss" scoped>

.notices-page {
  display: flex;
  flex-direction: column;
  gap: 28px;
}

.notices-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;

  h1 {
    font-size: 1.75rem;
    color: $text-primary;
    margin-bottom: 6px;
  }
  .subtitle {
    font-size: 0.95rem;
    color: $text-secondary;
  }
}

.create-card { padding: 34px; background: #fff; border: 1px solid #dce5df; box-shadow: 0 8px 28px rgba(#234437, .08); }
.create-heading { margin-bottom: 26px; padding-bottom: 20px; border-bottom: 1px solid #dfe7e2; }
.create-heading > span { color: $mn-blue; font-size: 13px; font-weight: 800; letter-spacing: .08em; }
.create-heading h2 { margin: 5px 0; font-size: 30px; }
.create-heading p { color: $text-secondary; font-size: 13px; }
.create-form { display: flex; flex-direction: column; gap: 22px; }
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; }
.notice-options .form-group { margin-bottom: 0; }
.notice-options .form-checkbox { justify-content: flex-start; }
.notice-options .form-checkbox::before { content: ''; height: 21px; flex: 0 0 21px; }
.language-fields { display: grid; grid-template-columns: 1fr; gap: 24px; }
.language-panel { padding: 24px; background: #fbfcfb; border: 1px solid #dce5df; }
.language-panel-title { display: flex; align-items: center; gap: 9px; margin-bottom: 18px; }
.language-panel-title span { padding: 4px 8px; color: #fff; background: $mn-blue; font-size: 11px; font-weight: 800; }
.language-panel-title strong { font-size: 20px; }
.form-error { padding: 12px 14px; color: #933b34; background: #fff2f0; border: 1px solid #ebcac5; font-size: 13px; }

.form-checkbox {
  display: flex;
  justify-content: center;
}

.checkbox-container {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 10px;
  min-height: 44px;
  padding: 0 14px;
  background: #f5f7f5;
  border: 1px solid #dce3de;
  font-size: 13px;
  color: $text-secondary;
  cursor: pointer;
  user-select: none;

  input {
    cursor: pointer;
    accent-color: $primary;
    width: 18px;
    height: 18px;
  }
}

.form-actions {
  display: flex;
  justify-content: flex-end;
}

.notices-list { display: flex; flex-direction: column; }
.notice-board-list { border-top: 2px solid #354c42; }
.notice-board-head,.notice-board-row { display: grid; grid-template-columns: 130px minmax(0,1fr) 170px 142px; gap: 18px; align-items: center; }
.notice-board-head { padding: 12px 18px; color: #7b8781; background: #f1f4f2; font-size: 13px; font-weight: 700; }
.notice-board-row { min-height: 74px; padding: 14px 18px; border-bottom: 1px solid #dfe8e2; cursor: pointer; transition: background .2s ease; }
.notice-board-row:hover { background: #f4f8f5; }
.notice-board-row.pinned { background: #fbf4e5; box-shadow: inset 4px 0 #c7973e; }
.notice-board-row.pinned:hover { background: #f6ecd6; }
.board-category { width: fit-content; padding: 4px 9px; color: #fff; background: $mn-blue; font-size: 13px; font-weight: 800; }
.notice-board-row strong { overflow: hidden; color: #2d3a34; font-size: 20px; white-space: nowrap; text-overflow: ellipsis; }
.notice-board-row time { color: #8e9a94; font-size: 13px; }
@media(max-width:680px){.notice-board-head{display:none}.notice-board-row{grid-template-columns:1fr auto;gap:8px 12px}.notice-board-row .board-category{grid-column:1}.notice-board-row strong{grid-column:1/-1;grid-row:2}.notice-board-row time{grid-column:2;grid-row:1}.notice-board-row .row-actions{grid-column:2;grid-row:2}}
@media(max-width:680px){.form-row{grid-template-columns:1fr}.create-card,.language-panel{padding:20px 14px}.notice-options .form-checkbox::before{display:none}}

.notice-card {
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: 12px;

  &.pinned {
    border: 1px solid rgba(233, 196, 106, 0.4);
    background: rgba(233, 196, 106, 0.03);
    
    &:hover {
      box-shadow: $shadow-premium, 0 0 15px rgba(233, 196, 106, 0.1);
      border-color: $primary;
    }
  }
}

.notice-badge-line {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.pinned-tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: rgba(233, 196, 106, 0.15);
  color: $primary;
  font-size: 0.75rem;
  font-weight: 700;
  padding: 4px 8px;
  border-radius: 4px;
  border: 1px solid rgba(233, 196, 106, 0.25);

  .pin-icon {
    width: 12px;
    height: 12px;
  }
}

.notice-date {
  font-size: 0.8rem;
  color: $text-muted;
  font-weight: 500;
}

.notice-title {
  font-size: 1.2rem;
  font-weight: 700;
  color: $text-primary;
}

.notice-excerpt {
  font-size: 0.95rem;
  color: $text-secondary;
  line-height: 1.6;
}

.notice-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 8px;
  border-top: 1px solid rgba(255, 255, 255, 0.04);

  .read-more {
    font-size: 0.85rem;
    font-weight: 600;
    color: $primary;
  }
}

.row-actions { display: flex; justify-content: flex-end; gap: 6px; }

.btn-edit,
.btn-delete {
  background: transparent;
  padding: 4px 10px;
  border-radius: $radius-sm;
  font-size: 0.75rem;
  cursor: pointer;
  transition: $transition-smooth;

}

.btn-edit { color: #116b4d; border: 1px solid #85aa9b; }
.btn-edit:hover { background: #eef7f2; }
.btn-delete { color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.3); }
.btn-delete:hover { background: rgba(239, 68, 68, 0.1); border-color: #ef4444; }

.empty-card {
  text-align: center;
  color: $text-muted;
  padding: 50px 20px;
}

// Expand transition
.expand-enter-active, .expand-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}
.expand-enter-from, .expand-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
