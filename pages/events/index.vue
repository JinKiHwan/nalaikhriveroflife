<template>
  <div class="events-board-page">
    <header class="board-page-header">
      <div><h1>교회행사</h1><p>현재 진행 중이거나 예정된 교회 행사를 안내합니다.</p></div>
      <button v-if="isMaster" type="button" class="btn btn-primary" @click="showForm ? cancelForm() : openCreate()">{{ showForm ? '작성 취소' : '행사 등록' }}</button>
    </header>

    <section v-if="showForm" class="card create-card">
      <h2>{{ editingPost ? '교회행사 수정' : '새 교회행사 등록' }}</h2>
      <form class="create-form" @submit.prevent="createPost">
        <div class="form-row">
          <div class="form-group"><label for="event-category">카테고리</label><input id="event-category" v-model.trim="form.category" class="input-field" required /></div>
          <div class="form-group"><label for="event-date">행사 날짜</label><input id="event-date" v-model="form.date" type="date" class="input-field" required /></div>
        </div>
        <div class="form-group"><label for="event-title">제목</label><input id="event-title" v-model.trim="form.title" class="input-field" required /></div>
        <div class="form-group"><label for="event-thumbnail">썸네일 이미지 URL</label><input id="event-thumbnail" v-model.trim="form.thumbnailUrl" type="url" class="input-field" placeholder="비워두면 기본 이미지가 표시됩니다." /></div>
        <div class="form-group"><label for="event-content">행사 안내</label><textarea id="event-content" v-model.trim="form.content" class="input-field textarea-field" rows="8" required></textarea></div>
        <button class="btn btn-primary" :disabled="isSubmitting">{{ isSubmitting ? '저장 중...' : (editingPost ? '수정 저장' : '등록하기') }}</button>
      </form>
    </section>

    <div v-if="posts.length" class="thumbnail-board">
      <article v-for="post in posts" :key="post.id" class="thumbnail-card">
        <nuxt-link :to="`/events/${post.id}`" class="card-link">
          <div class="thumbnail"><img :src="post.thumbnailUrl || defaultImage" alt="" @error="useDefaultImage" /></div>
          <div class="card-copy">
            <div class="card-meta"><span>{{ post.category || 'CHURCH EVENT' }}</span><time>{{ formatDate(post.date || post.createdAt) }}</time></div>
            <h2>{{ post.title }}</h2>
            <p>{{ post.content }}</p>
          </div>
        </nuxt-link>
        <div v-if="canEdit(post) || isMaster" class="card-actions">
          <button v-if="canEdit(post)" type="button" class="edit-button" @click="startEdit(post)">수정</button>
          <button v-if="isMaster" type="button" class="delete-button" @click="deletePost(post)">삭제</button>
        </div>
      </article>
    </div>
    <div v-else class="empty-board">현재 진행중인 행사가 없습니다</div>
  </div>
</template>

<script setup lang="ts">
import { addDoc, collection, deleteDoc, doc, getDocs, orderBy, query, updateDoc } from 'firebase/firestore'

const { isMaster, user, userName } = useAuth()
const route = useRoute()
const { $firebaseDb } = useNuxtApp()
const defaultImage = '/images/bg_05.webp'
const posts = ref<any[]>([])
const showForm = ref(false)
const isSubmitting = ref(false)
const editingPost = ref<any | null>(null)
const requestedEditHandled = ref(false)
const emptyForm = () => ({ category: 'CHURCH EVENT', title: '', date: new Date().toISOString().slice(0,10), thumbnailUrl: '', content: '' })
const form = ref(emptyForm())

const fetchPosts = async () => {
  if (!$firebaseDb) return
  const snapshot = await getDocs(query(collection($firebaseDb, 'church_events'), orderBy('date', 'desc')))
  posts.value = snapshot.docs.map(item => ({ id: item.id, ...item.data() })).filter((post: any) => post.isHidden !== true)
  openRequestedEdit()
}
const canEdit = (post: any) => isMaster.value || (!!user.value && post.authorId === user.value.uid)
const openCreate = () => { editingPost.value = null; form.value = emptyForm(); showForm.value = true }
const cancelForm = () => { editingPost.value = null; form.value = emptyForm(); showForm.value = false }
const startEdit = (post: any) => {
  if (!canEdit(post)) return
  editingPost.value = post
  form.value = {
    category: post.category || 'CHURCH EVENT',
    title: post.title || '',
    date: post.date || new Date().toISOString().slice(0,10),
    thumbnailUrl: post.thumbnailUrl || '',
    content: post.content || '',
  }
  showForm.value = true
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
const createPost = async () => {
  if (!$firebaseDb || !user.value) return
  isSubmitting.value = true
  try {
    if (editingPost.value) {
      await updateDoc(doc($firebaseDb, 'church_events', editingPost.value.id), {
        ...form.value,
        updatedAt: new Date().toISOString(),
        updatedBy: user.value.uid,
      })
    } else {
      await addDoc(collection($firebaseDb, 'church_events'), {
        ...form.value,
        authorName: userName.value,
        authorId: user.value.uid,
        createdAt: new Date().toISOString(),
        isHidden: false,
      })
    }
    editingPost.value = null
    form.value = emptyForm()
    showForm.value = false
    await fetchPosts()
  } finally { isSubmitting.value = false }
}
const deletePost = async (post: any) => {
  if (!$firebaseDb || !confirm(`“${post.title}” 행사를 삭제할까요?`)) return
  await deleteDoc(doc($firebaseDb, 'church_events', post.id))
  await fetchPosts()
}
const useDefaultImage = (event: Event) => { (event.currentTarget as HTMLImageElement).src = defaultImage }
const formatDate = (value: string) => value ? value.slice(0,10).replaceAll('-', '. ') : ''
onMounted(fetchPosts)
</script>

<style lang="scss" scoped>
.events-board-page { width:min(1380px,calc(100% - 64px));min-height:calc(100vh - 76px);margin:0 auto;padding:54px 0 88px; }.board-page-header { display:flex;align-items:flex-end;justify-content:space-between;gap:24px;margin-bottom:36px;padding-bottom:22px;border-bottom:2px solid #354c42; }.board-page-header h1{margin-bottom:6px;font-size:42px}.board-page-header p{color:$text-secondary;font-size:18px}.create-card{margin-bottom:36px}.create-card h2{margin-bottom:22px;font-size:26px}.create-form{display:flex;flex-direction:column;gap:14px}.form-row{display:grid;grid-template-columns:1fr 1fr;gap:18px}.textarea-field{min-height:160px;resize:vertical}
.thumbnail-board{display:grid;grid-template-columns:repeat(3,1fr);gap:34px 20px}.thumbnail-card{position:relative;min-width:0}.card-link{display:block;color:#26332e}.card-link:hover{color:#26332e}.thumbnail{aspect-ratio:1.5/1;overflow:hidden;background:#e5ece8}.thumbnail img{width:100%;height:100%;display:block;object-fit:cover;transition:transform .4s ease}.card-link:hover img{transform:scale(1.04)}.card-copy{padding:16px 2px 0}.card-meta{display:flex;justify-content:space-between;gap:10px;color:#16835f;font-size:13px;font-weight:800;letter-spacing:.04em}.card-meta time{color:#8e9a94;font-weight:500}.card-copy h2{margin:9px 0 7px;font-size:20px;line-height:1.45}.card-copy p{display:-webkit-box;overflow:hidden;color:#68746e;font-size:18px;line-height:1.65;-webkit-box-orient:vertical;-webkit-line-clamp:3}.card-actions{position:absolute;right:8px;top:8px;display:flex;gap:6px}.edit-button,.delete-button{padding:6px 10px;color:#fff;border:0;cursor:pointer;font-size:13px}.edit-button{background:rgba(#16815d,.94)}.delete-button{background:rgba(#9f1f16,.86)}.empty-board{min-height:260px;display:grid;place-items:center;color:$text-muted;background:#f0f3f1;font-size:18px}
@media(max-width:980px){.thumbnail-board{grid-template-columns:1fr 1fr}.events-board-page{width:calc(100% - 40px)}}@media(max-width:640px){.events-board-page{width:calc(100% - 28px);padding-top:36px}.board-page-header{align-items:flex-start;flex-direction:column}.board-page-header h1{font-size:36px}.thumbnail-board,.form-row{grid-template-columns:1fr}}
</style>
