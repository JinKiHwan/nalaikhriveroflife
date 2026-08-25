<template>
  <div class="posts-admin-page">
    <header class="admin-header">
      <div>
        <span>CONTENT MANAGEMENT</span>
        <h1>{{ t('admin.postsTitle') }}</h1>
        <p>{{ t('admin.postsSubtitle') }}</p>
      </div>
      <button type="button" class="refresh-button" :disabled="isLoading" @click="fetchPosts">{{ t('admin.refresh') }}</button>
    </header>

    <div class="post-stats">
      <div><span>{{ t('admin.allPosts') }}</span><strong>{{ posts.length }}</strong></div>
      <div><span>{{ t('admin.visible') }}</span><strong>{{ visibleCount }}</strong></div>
      <div class="hidden-stat"><span>{{ t('admin.hidden') }}</span><strong>{{ hiddenCount }}</strong></div>
    </div>

    <p v-if="actionError" class="action-alert">{{ actionError }}</p>

    <section class="posts-section">
      <div class="section-toolbar">
        <h2>{{ t('admin.allPosts') }}</h2>
        <div class="content-tabs" role="tablist" :aria-label="t('admin.postType')">
          <button type="button" role="tab" :aria-selected="selectedType === 'all'" :class="{ active: selectedType === 'all' }" @click="selectedType = 'all'">
            {{ language === 'mn' ? 'Бүгд' : '전체' }} <span>{{ posts.length }}</span>
          </button>
          <button v-for="type in contentTypes" :key="type.collection" type="button" role="tab" :aria-selected="selectedType === type.collection" :class="{ active: selectedType === type.collection }" @click="selectedType = type.collection">
            {{ typeLabel(type.collection) }} <span>{{ typeCount(type.collection) }}</span>
          </button>
        </div>
      </div>

      <div class="post-table-wrap">
        <table class="post-table">
          <thead>
            <tr>
              <th>{{ t('admin.postType') }}</th>
              <th>{{ t('admin.postTitle') }}</th>
              <th>{{ t('admin.postDate') }}</th>
              <th>{{ t('admin.postStatus') }}</th>
              <th>{{ t('admin.manage') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="post in filteredPosts" :key="`${post.collection}-${post.id}`" :class="{ 'is-hidden': post.isHidden }">
              <td><span class="type-badge">{{ typeLabel(post.collection) }}</span></td>
              <td>
                <nuxt-link :to="postLink(post)" class="post-title">{{ localizedTitle(post) }}</nuxt-link>
                <small>{{ post.authorName || (language === 'mn' ? 'Удирдлага' : '관리자') }}</small>
              </td>
              <td>{{ formatDate(post.date || post.createdAt) }}</td>
              <td><span :class="['status-badge', { hidden: post.isHidden }]">{{ post.isHidden ? t('admin.hidden') : t('admin.visible') }}</span></td>
              <td>
                <div class="post-actions">
                  <nuxt-link v-if="canEdit(post) && !post.isHidden" :to="editLink(post)" class="edit-button">{{ t('common.edit') }}</nuxt-link>
                  <button
                    type="button"
                    :class="['visibility-button', { restore: post.isHidden }]"
                    :disabled="isProcessing(post)"
                    @click="toggleVisibility(post)"
                  >{{ post.isHidden ? t('admin.show') : t('admin.hide') }}</button>
                  <button type="button" class="delete-button" :disabled="isProcessing(post)" @click="deletePost(post)">
                    {{ deletingKey === postKey(post) ? t('admin.deleting') : t('common.delete') }}
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="!filteredPosts.length"><td colspan="5" class="empty-cell">{{ t('admin.noPosts') }}</td></tr>
          </tbody>
        </table>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { collection, deleteDoc, doc, getDocs, updateDoc } from 'firebase/firestore'

definePageMeta({ layout: 'admin' })

const { user, isMaster } = useAuth()
const { language, t } = useLanguage()
const { $firebaseDb } = useNuxtApp()
const { deleteImage } = useFirestoreImages()

const contentTypes = [
  { collection: 'church_news', path: '/news' },
  { collection: 'sermons', path: '/sermons' },
  { collection: 'notices', path: '/notices' },
  { collection: 'church_events', path: '/events' },
] as const

const posts = ref<any[]>([])
const selectedType = ref('all')
const isLoading = ref(false)
const visibilityKey = ref('')
const deletingKey = ref('')
const actionError = ref('')

const postKey = (post: any) => `${post.collection}:${post.id}`
const isProcessing = (post: any) => visibilityKey.value === postKey(post) || deletingKey.value === postKey(post)
const timestamp = (post: any) => Date.parse(post.date || post.createdAt || '') || 0
const filteredPosts = computed(() => selectedType.value === 'all' ? posts.value : posts.value.filter(post => post.collection === selectedType.value))
const visibleCount = computed(() => posts.value.filter(post => post.isHidden !== true).length)
const hiddenCount = computed(() => posts.value.filter(post => post.isHidden === true).length)
const typeCount = (collectionName: string) => posts.value.filter(post => post.collection === collectionName).length
const canEdit = (post: any) => isMaster.value || (!!user.value && post.authorId === user.value.uid)

const typeLabel = (collectionName: string) => {
  const labels: Record<string, [string, string]> = {
    church_news: ['교회 소식', 'Чуулганы мэдээ'],
    sermons: ['생명의 말씀', 'Амийн үг'],
    notices: ['공지사항', 'Зарлал'],
    church_events: ['교회행사', 'Чуулганы үйл ажиллагаа'],
  }
  return labels[collectionName]?.[language.value === 'mn' ? 1 : 0] || collectionName
}

const localizedTitle = (post: any) => language.value === 'mn'
  ? (post.titleMn || post.titleKo || post.title || '-')
  : (post.titleKo || post.title || post.titleMn || '-')

const postLink = (post: any) => {
  const type = contentTypes.find(item => item.collection === post.collection)
  return `${type?.path || ''}/${post.id}`
}

const editLink = (post: any) => {
  const type = contentTypes.find(item => item.collection === post.collection)
  return { path: type?.path || '/', query: { edit: post.id } }
}

const formatDate = (value: string) => value
  ? new Date(value).toLocaleDateString(language.value === 'mn' ? 'mn-MN' : 'ko-KR')
  : '-'

const fetchPosts = async () => {
  if (!$firebaseDb) return
  isLoading.value = true
  actionError.value = ''
  try {
    const snapshots = await Promise.all(contentTypes.map(type => getDocs(collection($firebaseDb, type.collection))))
    posts.value = snapshots.flatMap((snapshot, index) => snapshot.docs.map(item => ({
      id: item.id,
      collection: contentTypes[index].collection,
      ...item.data(),
    }))).sort((a, b) => timestamp(b) - timestamp(a))
  } catch (error: any) {
    actionError.value = error.message || (language.value === 'mn' ? 'Нийтлэлийг ачаалж чадсангүй.' : '게시글을 불러오지 못했습니다.')
  } finally {
    isLoading.value = false
  }
}

const toggleVisibility = async (post: any) => {
  if (!$firebaseDb || !user.value) return
  const nextHidden = post.isHidden !== true
  const message = language.value === 'mn'
    ? `“${localizedTitle(post)}” нийтлэлийг ${nextHidden ? 'нуух' : 'нээх'} үү?`
    : `“${localizedTitle(post)}” 게시글을 ${nextHidden ? '숨김' : '공개'} 처리할까요?`
  if (!confirm(message)) return
  visibilityKey.value = postKey(post)
  actionError.value = ''
  try {
    await updateDoc(doc($firebaseDb, post.collection, post.id), {
      isHidden: nextHidden,
      hiddenAt: nextHidden ? new Date().toISOString() : null,
      hiddenBy: nextHidden ? user.value.uid : null,
    })
    post.isHidden = nextHidden
  } catch (error: any) {
    actionError.value = error.message || (language.value === 'mn' ? 'Төлөв өөрчилж чадсангүй.' : '공개 상태를 변경하지 못했습니다.')
  } finally {
    visibilityKey.value = ''
  }
}

const deletePost = async (post: any) => {
  if (!$firebaseDb) return
  const message = language.value === 'mn'
    ? `“${localizedTitle(post)}” нийтлэлийг бүрмөсөн устгах уу? Устгасны дараа сэргээх боломжгүй.`
    : `“${localizedTitle(post)}” 게시글을 완전히 삭제할까요? 삭제 후에는 복구할 수 없습니다.`
  if (!confirm(message)) return
  deletingKey.value = postKey(post)
  actionError.value = ''
  try {
    await deleteDoc(doc($firebaseDb, post.collection, post.id))
    const imageIds = Array.from(new Set([post.thumbnailImageId, ...(post.bodyImageIds || [])].filter(Boolean))) as string[]
    await Promise.all(imageIds.map(imageId => deleteImage(imageId).catch(() => undefined)))
    posts.value = posts.value.filter(item => postKey(item) !== postKey(post))
  } catch (error: any) {
    actionError.value = error.message || (language.value === 'mn' ? 'Нийтлэлийг устгаж чадсангүй.' : '게시글을 삭제하지 못했습니다.')
  } finally {
    deletingKey.value = ''
  }
}

onMounted(fetchPosts)
</script>

<style lang="scss" scoped>
.posts-admin-page { width: min(1240px, 100%); min-height: 100%; margin: 0 auto; padding: 50px 0 88px; }
.admin-header { display: flex; justify-content: space-between; align-items: flex-end; gap: 24px; margin-bottom: 28px; padding-bottom: 22px; border-bottom: 1px solid #e3e6e3; }
.admin-header span { color: #929793; font-size: 13px; font-weight: 800; letter-spacing: .1em; }
.admin-header h1 { margin: 7px 0 5px; font-size: 42px; }
.admin-header p { color: $text-secondary; font-size: 18px; }
.refresh-button { height: 40px; padding: 0 16px; color: #fff; background: #16815d; border: 1px solid #16815d; border-radius: 6px; cursor: pointer; font-size: 13px; font-weight: 700; }
.refresh-button:hover { background: #116b4d; border-color: #116b4d; }
.refresh-button:disabled { opacity: .55; }
.post-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 18px; margin-bottom: 28px; }
.post-stats > div { display: flex; align-items: center; justify-content: space-between; padding: 20px 24px; background: #fff; border: 1px solid #e3e6e3; border-radius: 8px; }
.post-stats span { font-size: 18px; font-weight: 700; }
.post-stats strong { color: #2f332f; font-size: 32px; }
.hidden-stat strong { color: #a25d24; }
.action-alert { margin-bottom: 18px; padding: 13px 16px; color: #713f3a; background: #fff3f1; border: 1px solid #efd0cc; font-size: 13px; }
.posts-section { padding: 28px; background: #fff; border: 1px solid #e3e6e3; border-radius: 10px; }
.section-toolbar { display: flex; align-items: flex-start; flex-direction: column; gap: 16px; margin-bottom: 20px; padding-bottom: 16px; border-bottom: 1px solid #e3e6e3; }
.section-toolbar h2 { font-size: 26px; }
.content-tabs { width: 100%; display: flex; flex-wrap: wrap; gap: 8px; }
.content-tabs button { min-height: 40px; padding: 0 14px; color: #5f6661; background: #fff; border: 1px solid #d9dedb; border-radius: 6px; cursor: pointer; font-family: $font-body; font-size: 13px; font-weight: 800; }
.content-tabs button span { margin-left: 5px; color: #9aa09c; font-size: 12px; }
.content-tabs button:hover { background: #f5f7f5; }
.content-tabs button.active { color: #fff; background: #3f4742; border-color: #3f4742; }
.content-tabs button.active span { color: #d9ddda; }
.post-table-wrap { overflow-x: auto; }
.post-table { width: 100%; border-collapse: collapse; }
.post-table th, .post-table td { padding: 15px 12px; border-bottom: 1px solid #e5e9e6; text-align: left; font-size: 13px; vertical-align: middle; }
.post-table th { color: #6f7470; background: #f7f8f7; }
.post-table tr.is-hidden td { background: #fbf8f3; }
.type-badge { display: inline-block; min-width: 82px; padding: 5px 9px; color: #4f5752; background: #eef1ef; text-align: center; font-weight: 800; }
.post-title { display: block; max-width: 560px; overflow: hidden; color: #303632; font-size: 18px; font-weight: 800; text-overflow: ellipsis; white-space: nowrap; }
.post-title:hover { color: #16815d; }
.post-table td:nth-child(2) small { display: block; margin-top: 3px; color: #969c98; }
.status-badge { display: inline-block; min-width: 58px; padding: 5px 9px; color: #176b4e; background: #e9f5ef; text-align: center; font-weight: 800; }
.status-badge.hidden { color: #94541e; background: #fff0df; }
.post-actions { display: flex; gap: 7px; }
.edit-button, .visibility-button, .delete-button { min-width: 68px; height: 36px; display: inline-grid; place-items: center; padding: 0 11px; border-radius: 5px; cursor: pointer; font-family: $font-body; font-size: 13px; font-weight: 800; white-space: nowrap; }
.edit-button { color: #fff; background: #4d6f61; border: 1px solid #4d6f61; }
.edit-button:hover { color: #fff; background: #3e5c50; border-color: #3e5c50; }
.visibility-button { color: #fff; background: #16815d; border: 1px solid #16815d; }
.visibility-button:hover { background: #116b4d; border-color: #116b4d; }
.visibility-button.restore { color: #116b4d; background: #fff; border-color: #16815d; }
.delete-button { color: #9b3e36; background: #fff; border: 1px solid #d9a8a3; }
.delete-button:hover { color: #fff; background: #9b3e36; border-color: #9b3e36; }
.visibility-button:disabled, .delete-button:disabled { cursor: wait; opacity: .5; }
.empty-cell { padding: 48px !important; color: $text-muted; text-align: center !important; }
@media(max-width:760px) { .posts-admin-page { width: 100%; padding-top: 34px; } .admin-header { align-items: flex-start; flex-direction: column; } .admin-header h1 { font-size: 36px; } .post-stats { grid-template-columns: 1fr; } .posts-section { padding: 20px 14px; } .content-tabs { flex-wrap: nowrap; overflow-x: auto; padding-bottom: 4px; } }
</style>
