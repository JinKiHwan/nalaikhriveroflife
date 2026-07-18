<template>
  <div class="notice-detail-page">
    <div class="navigation-actions">
      <nuxt-link to="/notices" class="back-link">
        ← 목록으로 돌아가기
      </nuxt-link>
    </div>

    <div v-if="notice" class="notice-container">
      <article class="glass-card detail-card" :class="{ 'pinned-detail': notice.isPinned }">
        <!-- Title & Meta Header -->
        <header class="detail-header">
          <div class="detail-meta">
            <span v-if="notice.isPinned" class="pinned-tag">중요</span>
            <span class="detail-author">작성자: {{ notice.authorName || '관리자' }}</span>
            <span class="divider">|</span>
            <span class="detail-date">{{ formatDate(notice.createdAt) }}</span>
          </div>
          <h1 class="detail-title">{{ notice.title }}</h1>
        </header>

        <!-- Body text content -->
        <section class="detail-body">
          <div class="notice-content">
            <p v-for="(paragraph, index) in formattedContent" :key="index">
              {{ paragraph }}
            </p>
          </div>
        </section>
      </article>
    </div>

    <!-- Loading State -->
    <div v-else-if="isLoading" class="glass-card loading-card">
      <div class="spinner"></div>
      <p>공지사항을 불러오는 중입니다...</p>
    </div>

    <!-- Error State -->
    <div v-else class="glass-card error-card">
      <p>공지사항 글을 찾을 수 없거나 불러오는 데 실패했습니다.</p>
      <nuxt-link to="/notices" class="btn btn-secondary">목록으로</nuxt-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { doc, getDoc } from 'firebase/firestore'

const route = useRoute()
const { $firebaseDb } = useNuxtApp()

const notice = ref<any>(null)
const isLoading = ref(true)

const fetchNoticeDetails = async () => {
  isLoading.value = true
  const noticeId = route.params.id as string
  try {
    const docRef = doc($firebaseDb, 'notices', noticeId)
    const snap = await getDoc(docRef)
    if (snap.exists()) {
      notice.value = snap.data()
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

const formattedContent = computed(() => {
  if (!notice.value?.content) return []
  return notice.value.content.split('\n').filter((p: string) => p.trim() !== '')
})

const formatDate = (dateStr: string) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일 ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
}
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
  display: flex;
  flex-direction: column;
  gap: 16px;
  white-space: pre-line;
}

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
