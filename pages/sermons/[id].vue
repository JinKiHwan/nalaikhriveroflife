<template>
  <div class="sermon-detail-page">
    <div class="navigation-actions">
      <nuxt-link to="/sermons" class="back-link">
        ← 목록으로 돌아가기
      </nuxt-link>
    </div>

    <div v-if="sermon" class="sermon-container">
      <!-- Sermon Main Glass Card -->
      <article class="glass-card detail-card">
        <!-- Title & Meta Header -->
        <header class="detail-header">
          <div class="detail-meta">
            <span class="detail-date">{{ formatDate(sermon.date) }}</span>
            <span class="divider">•</span>
            <span class="detail-speaker">{{ sermon.speaker }} 강사</span>
          </div>
          <h1 class="detail-title">{{ sermon.title }}</h1>
          
          <div class="detail-passage">
            <svg class="bible-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M21 5C19.89 4.65 18.5 4.5 17 4.5C15.5 4.5 14 4.8 12.5 5.5C11 4.8 9.5 4.5 8 4.5C6.5 4.5 5.11 4.65 4 5V19C5.11 18.65 6.5 18.5 8 18.5C9.5 18.5 11 18.8 12.5 19.5C14 18.8 15.5 18.5 17 18.5C18.5 18.5 19.89 18.65 21 19V5ZM19 16.89C18.36 16.65 17.7 16.5 17 16.5C15.82 16.5 14.65 16.79 13.5 17.38V7.5C14.54 7.02 15.75 6.79 17 6.79C17.7 6.79 18.36 6.88 19 7.07V16.89Z" fill="currentColor"/>
            </svg>
            <span class="passage-label">본문 말씀:</span>
            <strong class="passage-text">{{ sermon.biblePassage }}</strong>
          </div>
        </header>

        <!-- Video Player Section -->
        <div v-if="sermon.videoUrl" class="video-section">
          <div class="video-ratio-box">
            <iframe 
              :src="embedUrl(sermon.videoUrl)" 
              frameborder="0" 
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
              allowfullscreen
              title="Sermon Video Player"
            ></iframe>
          </div>
        </div>

        <!-- Written Content Notes -->
        <section class="detail-body">
          <h2>설교 요약 및 노트</h2>
          <div class="sermon-content">
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
      <p>말씀을 불러오고 있습니다...</p>
    </div>

    <!-- Error State -->
    <div v-else class="glass-card error-card">
      <p>설교 내용을 찾을 수 없거나 불러오는 데 실패했습니다.</p>
      <nuxt-link to="/sermons" class="btn btn-secondary">목록으로</nuxt-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { doc, getDoc } from 'firebase/firestore'

const route = useRoute()
const { $firebaseDb } = useNuxtApp()

const sermon = ref<any>(null)
const isLoading = ref(true)

const fetchSermonDetails = async () => {
  isLoading.value = true
  if (!$firebaseDb) {
    isLoading.value = false
    return
  }
  const sermonId = route.params.id as string
  try {
    const docRef = doc($firebaseDb, 'sermons', sermonId)
    const snap = await getDoc(docRef)
    if (snap.exists()) {
      sermon.value = snap.data()
    }
  } catch (err) {
    console.error('Error fetching sermon detail:', err)
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  fetchSermonDetails()
})

const formattedContent = computed(() => {
  if (!sermon.value?.content) return []
  // Split paragraphs by newline character
  return sermon.value.content.split('\n').filter((p: string) => p.trim() !== '')
})

const embedUrl = (url: string) => {
  if (!url) return ''
  // Convert standard watch links to embed links if necessary
  if (url.includes('youtube.com/watch?v=')) {
    const videoId = url.split('v=')[1]?.split('&')[0]
    return `https://www.youtube.com/embed/${videoId}`
  } else if (url.includes('youtu.be/')) {
    const videoId = url.split('youtu.be/')[1]?.split('?')[0]
    return `https://www.youtube.com/embed/${videoId}`
  }
  return url
}

const formatDate = (dateStr: string) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일 주일 설교`
}
</script>

<style lang="scss" scoped>

.sermon-detail-page {
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
  gap: 32px;

  @media (max-width: 768px) {
    padding: 24px;
    gap: 24px;
  }
}

.detail-header {
  border-bottom: 1px solid $border-color;
  padding-bottom: 24px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.detail-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.9rem;
  color: $text-secondary;
  font-weight: 500;

  .divider {
    color: $text-muted;
  }
}

.detail-title {
  font-size: 1.85rem;
  color: $text-primary;
  line-height: 1.3;
  letter-spacing: -0.02em;

  @media (max-width: 768px) {
    font-size: 1.5rem;
  }
}

.detail-passage {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: rgba(233, 196, 106, 0.06);
  border: 1px solid rgba(233, 196, 106, 0.15);
  color: $text-primary;
  padding: 8px 16px;
  border-radius: $radius-sm;
  font-size: 0.95rem;
  width: fit-content;

  .bible-icon {
    width: 18px;
    height: 18px;
    color: $primary;
  }

  .passage-label {
    color: $text-secondary;
    font-weight: 500;
  }

  .passage-text {
    color: $primary;
    font-weight: 600;
  }
}

.video-section {
  width: 100%;
}

.video-ratio-box {
  position: relative;
  width: 100%;
  padding-top: 56.25%; /* 16:9 Aspect Ratio */
  background: #000;
  border-radius: $radius-sm;
  overflow: hidden;
  box-shadow: $shadow-premium;

  iframe {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }
}

.detail-body {
  display: flex;
  flex-direction: column;
  gap: 16px;

  h2 {
    font-size: 1.25rem;
    color: $primary;
    border-left: 3px solid $primary;
    padding-left: 10px;
    line-height: 1.2;
  }
}

.sermon-content {
  font-size: 1rem;
  color: $text-secondary;
  line-height: 1.8;
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
