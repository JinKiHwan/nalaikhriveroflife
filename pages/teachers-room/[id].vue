<template>
  <div class="teacher-post-detail-page">
    <div class="navigation-actions">
      <nuxt-link to="/teachers-room" class="back-link">
        ← 목록으로 돌아가기
      </nuxt-link>
    </div>

    <div v-if="post" class="post-container">
      <article class="glass-card detail-card">
        <!-- Title & Meta Header -->
        <header class="detail-header">
          <div class="detail-meta">
            <span class="detail-author">작성 교사: {{ post.authorName }}</span>
            <span class="divider">|</span>
            <span class="detail-date">{{ formatDate(post.createdAt) }}</span>
          </div>
          <h1 class="detail-title">{{ post.title }}</h1>
        </header>

        <!-- Attached File Section -->
        <section v-if="post.attachmentUrl" class="attachment-section">
          <h3>첨부된 교육 자료 파일</h3>
          <div class="attachment-box">
            <div class="file-info-group">
              <svg class="file-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V8L14 2ZM16 18H8V16H16V18ZM16 14H8V12H16V14ZM13 9V3.5L18.5 9H13Z" fill="currentColor"/>
              </svg>
              <div class="file-details">
                <span class="file-name">{{ post.attachmentName }}</span>
              </div>
            </div>
            <a 
              :href="post.attachmentUrl" 
              target="_blank" 
              download 
              class="btn btn-primary btn-download"
            >
              <svg class="download-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4C9.11 4 6.6 5.64 5.35 8.04C2.34 8.36 0 10.91 0 14C0 17.31 2.69 20 6 20H19C21.76 20 24 17.76 24 15C24 12.36 21.95 10.22 19.35 10.04ZM17 13L12 18L7 13H10V9H14V13H17Z" fill="currentColor"/>
              </svg>
              다운로드
            </a>
          </div>
        </section>

        <!-- Body text content -->
        <section class="detail-body">
          <h3>상세 설명 및 본문</h3>
          <div class="post-content">
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
      <p>게시글을 불러오는 중입니다...</p>
    </div>

    <!-- Error State -->
    <div v-else class="glass-card error-card">
      <p>해당 게시글을 찾을 수 없거나 불러오는 데 실패했습니다.</p>
      <nuxt-link to="/teachers-room" class="btn btn-secondary">목록으로</nuxt-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { doc, getDoc } from 'firebase/firestore'

const route = useRoute()
const { $firebaseDb } = useNuxtApp()

const post = ref<any>(null)
const isLoading = ref(true)

const fetchPostDetails = async () => {
  isLoading.value = true
  const postId = route.params.id as string
  try {
    const docRef = doc($firebaseDb, 'teachers_posts', postId)
    const snap = await getDoc(docRef)
    if (snap.exists()) {
      post.value = snap.data()
    }
  } catch (err) {
    console.error('Error fetching teacher post details:', err)
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  fetchPostDetails()
})

const formattedContent = computed(() => {
  if (!post.value?.content) return []
  return post.value.content.split('\n').filter((p: string) => p.trim() !== '')
})

const formatDate = (dateStr: string) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`
}
</script>

<style lang="scss" scoped>

.teacher-post-detail-page {
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

.detail-title {
  font-size: 1.7rem;
  color: $text-primary;
  line-height: 1.35;
  letter-spacing: -0.02em;

  @media (max-width: 768px) {
    font-size: 1.4rem;
  }
}

.attachment-section {
  h3 {
    font-size: 1.1rem;
    color: $primary;
    margin-bottom: 12px;
  }
}

.attachment-box {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid $border-color;
  border-radius: $radius-sm;
  padding: 16px 20px;
  gap: 16px;

  @media (max-width: 600px) {
    flex-direction: column;
    align-items: stretch;
  }
}

.file-info-group {
  display: flex;
  align-items: center;
  gap: 12px;
  overflow: hidden;

  .file-icon {
    width: 24px;
    height: 24px;
    color: $primary;
    flex-shrink: 0;
  }

  .file-details {
    display: flex;
    flex-direction: column;
    overflow: hidden;

    .file-name {
      font-size: 0.95rem;
      font-weight: 600;
      color: $text-primary;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }
}

.btn-download {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  gap: 8px;

  .download-icon {
    width: 16px;
    height: 16px;
  }
}

.detail-body {
  h3 {
    font-size: 1.1rem;
    color: $primary;
    margin-bottom: 12px;
  }
}

.post-content {
  font-size: 1.05rem;
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
