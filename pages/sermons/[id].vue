<template>
  <article class="sermon-detail-page">
    <nuxt-link to="/sermons" class="back-link">← {{ language === 'mn' ? 'Амийн үг' : '생명의 말씀 목록' }}</nuxt-link>

    <template v-if="sermon">
      <header class="detail-header">
        <span class="detail-category">{{ localizedCategory }}</span>
        <h1>{{ localizedTitle }}</h1>
        <div class="detail-meta">
          <time>{{ formatDate(sermon.date || sermon.createdAt) }}</time><i></i>
          <span>{{ language === 'mn' ? 'Зохиогч' : '작성자' }} {{ sermon.authorName || (language === 'mn' ? 'Удирдлага' : '관리자') }}</span>
        </div>
      </header>

      <figure class="sermon-thumbnail"><img :src="thumbnailSource" :alt="localizedTitle" @error="useDefaultImage" /></figure>

      <section class="sermon-information">
        <div><span>{{ language === 'mn' ? 'Номлогч' : '설교자' }}</span><strong>{{ localizedSpeaker }}</strong></div>
        <div><span>{{ language === 'mn' ? 'Библийн эшлэл' : '성경 본문' }}</span><strong>{{ localizedPassage }}</strong></div>
      </section>

      <div v-if="sermon.videoUrl" class="video-section">
        <iframe :src="embedUrl(sermon.videoUrl)" title="Sermon Video Player" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
      </div>

      <section class="sermon-body">
        <div class="body-heading"><span></span><h2>{{ language === 'mn' ? 'Номлолын агуулга' : '말씀 본문' }}</h2><span></span></div>
        <div class="rich-content" v-html="resolvedContent"></div>
      </section>
    </template>

    <div v-else-if="isLoading" class="loading-state"><span class="spinner"></span><p>{{ language === 'mn' ? 'Номлолыг ачаалж байна.' : '말씀을 불러오고 있습니다.' }}</p></div>
    <div v-else class="loading-state"><p>{{ language === 'mn' ? 'Номлол олдсонгүй.' : '말씀 내용을 찾을 수 없습니다.' }}</p></div>
  </article>
</template>

<script setup lang="ts">
import { doc, getDoc } from 'firebase/firestore'

const route = useRoute()
const { language } = useLanguage()
const { isAdmin, runWithAuthRetry } = useAuth()
const { $firebaseDb } = useNuxtApp()
const { getImage, resolveRichTextImages } = useFirestoreImages()
const defaultImage = '/images/sermon-default-v1.png'
const sermon = ref<any>(null)
const isLoading = ref(true)
const thumbnailSource = ref(defaultImage)
const resolvedContent = ref('')

const localizedTitle = computed(() => language.value === 'mn' ? (sermon.value?.titleMn || sermon.value?.titleKo || sermon.value?.title) : (sermon.value?.titleKo || sermon.value?.title || sermon.value?.titleMn))
const localizedCategory = computed(() => language.value === 'mn' ? (sermon.value?.categoryMn || sermon.value?.categoryKo || sermon.value?.category || 'Ням гарагийн мөргөл') : (sermon.value?.categoryKo || sermon.value?.category || sermon.value?.categoryMn || '주일예배'))
const localizedSpeaker = computed(() => language.value === 'mn' ? (sermon.value?.speakerMn || sermon.value?.speakerKo || sermon.value?.speaker || '-') : (sermon.value?.speakerKo || sermon.value?.speaker || sermon.value?.speakerMn || '-'))
const localizedPassage = computed(() => language.value === 'mn' ? (sermon.value?.passageMn || sermon.value?.passageKo || sermon.value?.biblePassage || '-') : (sermon.value?.passageKo || sermon.value?.biblePassage || sermon.value?.passageMn || '-'))
const localizedRawContent = computed(() => language.value === 'mn' ? (sermon.value?.contentMn || sermon.value?.contentKo || sermon.value?.content || '') : (sermon.value?.contentKo || sermon.value?.content || sermon.value?.contentMn || ''))

const legacyToHtml = (content: string) => {
  if (/<[a-z][\s\S]*>/i.test(content)) return content
  const container = document.createElement('div')
  return content.split('\n').filter(Boolean).map(paragraph => { container.textContent = paragraph; return `<p>${container.innerHTML}</p>` }).join('')
}
const renderContent = async () => { resolvedContent.value = await resolveRichTextImages(legacyToHtml(localizedRawContent.value)) }
const formatDate = (value: string) => value ? new Date(value).toLocaleDateString(language.value === 'mn' ? 'mn-MN' : 'ko-KR', { year: 'numeric', month: 'long', day: 'numeric' }) : ''
const useDefaultImage = (event: Event) => { (event.currentTarget as HTMLImageElement).src = defaultImage }
const embedUrl = (url: string) => {
  if (url.includes('youtube.com/watch?v=')) return `https://www.youtube.com/embed/${url.split('v=')[1]?.split('&')[0]}`
  if (url.includes('youtu.be/')) return `https://www.youtube.com/embed/${url.split('youtu.be/')[1]?.split('?')[0]}`
  return url
}

onMounted(async () => {
  if (!$firebaseDb) { isLoading.value = false; return }
  try {
    const snapshot = await runWithAuthRetry(() => getDoc(doc($firebaseDb, 'sermons', String(route.params.id))))
      if (!snapshot.exists()) return
      sermon.value = { id: snapshot.id, ...snapshot.data() }
      if (sermon.value.isHidden === true && !isAdmin.value) {
        await navigateTo('/sermons', { replace: true })
        return
      }
    if (sermon.value.thumbnailImageId) thumbnailSource.value = await getImage(sermon.value.thumbnailImageId) || defaultImage
    else thumbnailSource.value = sermon.value.thumbnailUrl || defaultImage
    await renderContent()
  } finally { isLoading.value = false }
})
watch(language, renderContent)
</script>

<style lang="scss" scoped>
.sermon-detail-page { width: min(1120px, calc(100% - 40px)); min-height: calc(100vh - 76px); margin: 0 auto; padding: 52px 0 110px; }
.back-link { display: inline-block; margin-bottom: 34px; font-size: 13px; font-weight: 800; }
.detail-header { padding-bottom: 26px; border-bottom: 2px solid #354c42; }
.detail-category { color: $mn-blue; font-size: 13px; font-weight: 800; letter-spacing: .08em; }
.detail-header h1 { max-width: 960px; margin: 10px 0 14px; font-size: clamp(38px, 5.3vw, 58px); line-height: 1.28; }
.detail-meta { display: flex; align-items: center; flex-wrap: wrap; gap: 10px; color: #78857e; font-size: 13px; }
.detail-meta i { width: 3px; height: 3px; background: #9ba69f; border-radius: 50%; }
.sermon-thumbnail { width: min(960px, 100%); margin: 42px auto 0; text-align: center; }
.sermon-thumbnail img { max-width: 100%; max-height: 760px; display: block; margin: 0 auto; object-fit: contain; }
.sermon-information { width: min(900px, 100%); display: grid; grid-template-columns: 1fr 1fr; gap: 1px; margin: 34px auto 0; background: #dce5df; border: 1px solid #dce5df; }
.sermon-information div { display: flex; flex-direction: column; gap: 5px; padding: 18px 20px; background: #f7f9f8; }
.sermon-information span { color: #728078; font-size: 13px; }
.sermon-information strong { color: #294138; font-size: 18px; }
.video-section { position: relative; width: min(960px, 100%); margin: 36px auto 0; padding-top: 56.25%; overflow: hidden; background: #17231e; }
.video-section iframe { position: absolute; inset: 0; width: 100%; height: 100%; border: 0; }
.sermon-body { width: min(940px, 100%); margin: 62px auto 0; }
.body-heading { display: grid; grid-template-columns: 1fr auto 1fr; align-items: center; gap: 18px; margin-bottom: 36px; }
.body-heading span { height: 1px; background: #cfdad4; }
.body-heading h2 { font-size: 28px; }
.rich-content { padding: 34px; color: #303f38; border: 1px solid #d6dfda; font-size: 18px; line-height: 1.95; }
.rich-content :deep(p) { margin: 0 0 20px; }
.rich-content :deep(h2) { margin: 38px 0 15px; font-size: 30px; }
.rich-content :deep(h3) { margin: 30px 0 12px; font-size: 24px; }
.rich-content :deep(ul), .rich-content :deep(ol) { margin: 18px 0; padding-left: 30px; }
.rich-content :deep(blockquote) { margin: 28px 0; padding: 18px 22px; color: #4c6258; background: #f1f6f3; border-left: 4px solid $mn-blue; }
.rich-content :deep(img) { max-width: 100%; height: auto; display: block; margin: 36px auto; }
.rich-content :deep(a) { text-decoration: underline; text-underline-offset: 3px; }
.loading-state { min-height: 360px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 14px; color: $text-muted; }
@media(max-width:640px) { .sermon-detail-page { width: calc(100% - 28px); padding-top: 34px; } .sermon-thumbnail { margin-top: 28px; } .sermon-information { grid-template-columns: 1fr; } .sermon-body { margin-top: 42px; } .rich-content { padding: 22px 14px; } }
</style>
