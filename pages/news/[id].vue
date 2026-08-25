<template>
  <article class="news-detail-page">
    <nuxt-link to="/news" class="back-link">← {{ language === 'mn' ? 'Чуулганы мэдээ' : '교회 소식 목록' }}</nuxt-link>
    <template v-if="post">
      <header class="detail-header">
        <h1>{{ localizedTitle }}</h1>
        <div class="detail-meta"><time>{{ formatDate(post.date || post.createdAt) }}</time><i></i><span>{{ language === 'mn' ? 'Зохиогч' : '작성자' }} {{ post.authorName || (language === 'mn' ? 'Удирдлага' : '관리자') }}</span></div>
      </header>

      <figure class="detail-thumbnail"><img :src="thumbnailSource" :alt="localizedTitle" @error="useDefaultImage" /></figure>

      <div class="detail-content rich-content" v-html="resolvedContent"></div>
    </template>
    <div v-else class="empty-detail">{{ language === 'mn' ? 'Мэдээг ачаалж байна.' : '소식을 불러오는 중입니다.' }}</div>
  </article>
</template>

<script setup lang="ts">
import { doc, getDoc } from 'firebase/firestore'

const route = useRoute()
const { language } = useLanguage()
const { isAdmin, runWithAuthRetry } = useAuth()
const { $firebaseDb } = useNuxtApp()
const { getImage, resolveRichTextImages } = useFirestoreImages()
const defaultImage = '/images/bg_04.webp'
const post = ref<any>(null)
const thumbnailSource = ref(defaultImage)
const resolvedContent = ref('')

const localizedTitle = computed(() => language.value === 'mn' ? (post.value?.titleMn || post.value?.titleKo || post.value?.title) : (post.value?.titleKo || post.value?.title || post.value?.titleMn))
const localizedRawContent = computed(() => language.value === 'mn' ? (post.value?.contentMn || post.value?.contentKo || post.value?.content || '') : (post.value?.contentKo || post.value?.content || post.value?.contentMn || ''))

const legacyToHtml = (content: string) => {
  if (/<[a-z][\s\S]*>/i.test(content)) return content
  const container = document.createElement('div')
  return content.split('\n').filter(Boolean).map(paragraph => { container.textContent = paragraph; return `<p>${container.innerHTML}</p>` }).join('')
}

const renderContent = async () => { resolvedContent.value = await resolveRichTextImages(legacyToHtml(localizedRawContent.value)) }
const formatDate = (value: string) => value ? new Date(value).toLocaleDateString(language.value === 'mn' ? 'mn-MN' : 'ko-KR', { year: 'numeric', month: 'long', day: 'numeric' }) : ''
const useDefaultImage = (event: Event) => { (event.currentTarget as HTMLImageElement).src = defaultImage }

onMounted(async () => {
  if (!$firebaseDb) return
  const snapshot = await runWithAuthRetry(() => getDoc(doc($firebaseDb, 'church_news', String(route.params.id))))
  if (!snapshot.exists()) return
  post.value = { id: snapshot.id, ...snapshot.data() }
  if (post.value.isHidden === true && !isAdmin.value) {
    await navigateTo('/news', { replace: true })
    return
  }
  if (post.value.thumbnailImageId) thumbnailSource.value = await getImage(post.value.thumbnailImageId) || defaultImage
  else thumbnailSource.value = post.value.thumbnailUrl || defaultImage
  await renderContent()
})

watch(language, renderContent)
</script>

<style lang="scss" scoped>
.news-detail-page { width: min(1080px, calc(100% - 40px)); min-height: calc(100vh - 76px); margin: 0 auto; padding: 52px 0 100px; }
.back-link { display: inline-block; margin-bottom: 34px; font-size: 13px; font-weight: 800; }
.detail-header { padding-bottom: 26px; border-bottom: 2px solid #354c42; }
.detail-header h1 { max-width: 920px; margin: 0 0 14px; font-size: clamp(36px, 5vw, 54px); line-height: 1.3; }
.detail-meta { display: flex; align-items: center; flex-wrap: wrap; gap: 10px; color: #78857e; font-size: 13px; }
.detail-meta i { width: 3px; height: 3px; background: #9ba69f; border-radius: 50%; }
.detail-thumbnail { width: min(920px, 100%); margin: 42px auto 0; text-align: center; }
.detail-thumbnail img { max-width: 100%; max-height: 720px; display: block; margin: 0 auto; object-fit: contain; }
.detail-content { width: min(900px, 100%); margin: 0 auto; padding: 48px 0 20px; color: #37463f; font-size: 18px; line-height: 1.95; }
.rich-content :deep(p) { margin: 0 0 20px; }
.rich-content :deep(h2) { margin: 42px 0 16px; font-size: 30px; }
.rich-content :deep(h3) { margin: 34px 0 14px; font-size: 24px; }
.rich-content :deep(ul), .rich-content :deep(ol) { margin: 18px 0; padding-left: 30px; }
.rich-content :deep(blockquote) { margin: 28px 0; padding: 18px 22px; color: #4c6258; background: #f1f6f3; border-left: 4px solid $mn-blue; }
.rich-content :deep(img) { max-width: 100%; height: auto; display: block; margin: 36px auto; }
.rich-content :deep(a) { text-decoration: underline; text-underline-offset: 3px; }
.empty-detail { min-height: 300px; display: grid; place-items: center; color: $text-muted; }
@media(max-width:640px) { .news-detail-page { width: calc(100% - 28px); padding-top: 34px; } .detail-thumbnail { margin-top: 28px; } .detail-content { padding-top: 34px; } }
</style>
