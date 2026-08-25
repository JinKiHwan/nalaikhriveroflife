<template>
  <div class="notice-detail-page">
    <div class="navigation-actions">
      <nuxt-link to="/notices" class="back-link">
        ← {{ language === 'mn' ? 'Жагсаалт руу буцах' : '목록으로 돌아가기' }}
      </nuxt-link>
    </div>

    <div v-if="notice" class="notice-container">
      <article class="glass-card detail-card" :class="{ 'pinned-detail': notice.isPinned }">
        <!-- Title & Meta Header -->
        <header class="detail-header">
          <div class="detail-meta">
            <span v-if="notice.isPinned" class="pinned-tag">{{ language === 'mn' ? 'ЧУХАЛ' : '중요' }}</span>
            <span class="detail-author">{{ language === 'mn' ? 'Зохиогч' : '작성자' }}: {{ notice.authorName || (language === 'mn' ? 'Удирдлага' : '관리자') }}</span>
            <span class="divider">|</span>
            <span class="detail-date">{{ formatDate(notice.createdAt) }}</span>
          </div>
          <h1 class="detail-title">{{ localizedTitle }}</h1>
        </header>

        <!-- Body text content -->
        <section class="detail-body">
          <div class="notice-content rich-content" v-html="resolvedContent"></div>
        </section>
      </article>
    </div>

    <!-- Loading State -->
    <div v-else-if="isLoading" class="glass-card loading-card">
      <div class="spinner"></div>
      <p>{{ language === 'mn' ? 'Зарлалыг ачаалж байна...' : '공지사항을 불러오는 중입니다...' }}</p>
    </div>

    <!-- Error State -->
    <div v-else class="glass-card error-card">
      <p>{{ language === 'mn' ? 'Зарлал олдсонгүй эсвэл ачаалж чадсангүй.' : '공지사항 글을 찾을 수 없거나 불러오는 데 실패했습니다.' }}</p>
      <nuxt-link to="/notices" class="btn btn-secondary">{{ language === 'mn' ? 'Жагсаалт' : '목록으로' }}</nuxt-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { doc, getDoc } from 'firebase/firestore'

const route = useRoute()
const { language } = useLanguage()
const { isAdmin, runWithAuthRetry } = useAuth()
const { $firebaseDb } = useNuxtApp()
const { resolveRichTextImages } = useFirestoreImages()

const notice = ref<any>(null)
const isLoading = ref(true)
const resolvedContent = ref('')

const localizedTitle = computed(() => language.value === 'mn' ? (notice.value?.titleMn || notice.value?.titleKo || notice.value?.title) : (notice.value?.titleKo || notice.value?.title || notice.value?.titleMn))
const localizedRawContent = computed(() => language.value === 'mn' ? (notice.value?.contentMn || notice.value?.contentKo || notice.value?.content || '') : (notice.value?.contentKo || notice.value?.content || notice.value?.contentMn || ''))

const legacyToHtml = (content: string) => {
  if (/<[a-z][\s\S]*>/i.test(content)) return content
  const container = document.createElement('div')
  return content.split('\n').filter(Boolean).map(paragraph => { container.textContent = paragraph; return `<p>${container.innerHTML}</p>` }).join('')
}

const renderContent = async () => { resolvedContent.value = await resolveRichTextImages(legacyToHtml(localizedRawContent.value)) }

const fetchNoticeDetails = async () => {
  isLoading.value = true
  const noticeId = route.params.id as string
  try {
    const docRef = doc($firebaseDb, 'notices', noticeId)
    const snap = await runWithAuthRetry(() => getDoc(docRef))
      if (snap.exists()) {
        notice.value = { id: snap.id, ...snap.data() }
        if (notice.value.isHidden === true && !isAdmin.value) {
          await navigateTo('/notices', { replace: true })
          return
        }
        await renderContent()
    }
  } catch (err) {
    console.error('Error fetching notice details:', err)
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  fetchNoticeDetails()
})

const formatDate = (dateStr: string) => {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString(language.value === 'mn' ? 'mn-MN' : 'ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })
}

watch(language, renderContent)
</script>

<style lang="scss" scoped>

.notice-detail-page {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.navigation-actions {
  .back-link {
    color: $text-secondary;
    font-size: 0.95rem;
    font-weight: 500;
    transition: $transition-smooth;

    &:hover {
      color: $primary;
      transform: translateX(-4px);
    }
  }
}

.detail-card {
  padding: 40px;
  display: flex;
  flex-direction: column;
  gap: 28px;

  &.pinned-detail {
    border-top: 3px solid $primary;
  }

  @media (max-width: 768px) {
    padding: 24px;
  }
}

.detail-header {
  border-bottom: 1px solid $border-color;
  padding-bottom: 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.detail-meta {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 0.85rem;
  color: $text-secondary;
  font-weight: 500;

  .divider {
    color: $text-muted;
  }
}

.pinned-tag {
  background: rgba(233, 196, 106, 0.15);
  color: $primary;
  font-size: 0.7rem;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 4px;
  border: 1px solid rgba(233, 196, 106, 0.25);
  text-transform: uppercase;
}

.detail-title {
  font-size: 1.7rem;
  color: $text-primary;
  line-height: 1.35;
  letter-spacing: -0.02em;

  @media (max-width: 768px) {
    font-size: 1.4rem;
  }
}

.detail-body {
  font-size: 1.05rem;
  color: $text-secondary;
  line-height: 1.8;
}

.notice-content {
  color: #37463f;
  font-size: 18px;
  line-height: 1.95;
}
.rich-content :deep(p) { margin: 0 0 20px; }
.rich-content :deep(h2) { margin: 42px 0 16px; font-size: 30px; }
.rich-content :deep(h3) { margin: 34px 0 14px; font-size: 24px; }
.rich-content :deep(ul), .rich-content :deep(ol) { margin: 18px 0; padding-left: 30px; }
.rich-content :deep(blockquote) { margin: 28px 0; padding: 18px 22px; color: #4c6258; background: #f1f6f3; border-left: 4px solid $mn-blue; }
.rich-content :deep(img) { max-width: 100%; height: auto; display: block; margin: 36px auto; }
.rich-content :deep(a) { text-decoration: underline; text-underline-offset: 3px; }

.loading-card, .error-card {
  text-align: center;
  padding: 60px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 20px;
  color: $text-muted;
}

.spinner {
  width: 32px;
  height: 32px;
  border: 3px solid rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  border-top-color: $primary;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
