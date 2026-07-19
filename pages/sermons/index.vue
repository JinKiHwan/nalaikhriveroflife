<template>
  <div class="sermons-page">
    <div class="sermons-header">
      <div>
        <h1>{{ t('sermons.title') }}</h1>
        <p class="subtitle">{{ t('sermons.subtitle') }}</p>
      </div>
      
      <!-- Create Toggle Button (Master only) -->
      <button 
        v-if="isMaster" 
        @click="showCreateForm = !showCreateForm" 
        class="btn btn-primary"
      >
        {{ showCreateForm ? t('common.cancel') : t('sermons.create') }}
      </button>
    </div>

    <!-- Create Sermon Form (Expandable) -->
    <transition name="expand">
      <div v-if="showCreateForm" class="glass-card form-card">
        <h2>새 설교 말씀 등록</h2>
        <form @submit.prevent="handleCreateSermon" class="sermon-form">
          <div class="form-row-2">
            <div class="form-group">
              <label for="title">설교 제목</label>
              <input 
                id="title" 
                v-model="newSermon.title" 
                type="text" 
                required 
                placeholder="예: 생명의 생수되신 예수님"
                class="input-field"
              />
            </div>
            <div class="form-group">
              <label for="speaker">설교자 (강사)</label>
              <input 
                id="speaker" 
                v-model="newSermon.speaker" 
                type="text" 
                required 
                placeholder="예: 김생명 목사"
                class="input-field"
              />
            </div>
          </div>

          <div class="form-row-2">
            <div class="form-group">
              <label for="passage">성경 본문 구절</label>
              <input 
                id="passage" 
                v-model="newSermon.biblePassage" 
                type="text" 
                required 
                placeholder="예: 요한복음 4장 13-14절"
                class="input-field"
              />
            </div>
            <div class="form-group">
              <label for="date">설교 일자</label>
              <input 
                id="date" 
                v-model="newSermon.date" 
                type="date" 
                required 
                class="input-field"
              />
            </div>
          </div>

          <div class="form-group">
            <label for="video-url">설교 영상 URL (유튜브 공유/임베드 링크)</label>
            <input 
              id="video-url" 
              v-model="newSermon.videoUrl" 
              type="url" 
              placeholder="예: https://www.youtube.com/embed/..."
              class="input-field"
            />
          </div>

          <div class="form-group">
            <label for="content">설교 요약 및 노트</label>
            <textarea 
              id="content" 
              v-model="newSermon.content" 
              rows="8" 
              placeholder="설교 요약 내용 혹은 주간 묵상 노트를 입력해 주세요."
              class="input-field textarea-field"
            ></textarea>
          </div>

          <div class="form-actions">
            <button type="submit" class="btn btn-primary" :disabled="isSubmitting">
              등록하기
            </button>
          </div>
        </form>
      </div>
    </transition>

    <!-- Sermons List -->
    <div class="sermons-list-wrapper">
      <div v-if="sermons.length > 0" class="post-grid">
        <div 
          v-for="s in sermons" 
          :key="s.id" 
          class="glass-card hoverable sermon-card"
          @click="navigateToDetail(s.id)"
        >
          <div class="sermon-meta">
            <span class="sermon-date">{{ formatDate(s.date) }}</span>
            <span class="sermon-speaker">{{ s.speaker }}</span>
          </div>
          <h3 class="sermon-title">{{ s.title }}</h3>
          <p class="sermon-passage">
            <svg class="bible-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M21 5C19.89 4.65 18.5 4.5 17 4.5C15.5 4.5 14 4.8 12.5 5.5C11 4.8 9.5 4.5 8 4.5C6.5 4.5 5.11 4.65 4 5V19C5.11 18.65 6.5 18.5 8 18.5C9.5 18.5 11 18.8 12.5 19.5C14 18.8 15.5 18.5 17 18.5C18.5 18.5 19.89 18.65 21 19V5ZM19 16.89C18.36 16.65 17.7 16.5 17 16.5C15.82 16.5 14.65 16.79 13.5 17.38V7.5C14.54 7.02 15.75 6.79 17 6.79C17.7 6.79 18.36 6.88 19 7.07V16.89Z" fill="currentColor"/>
            </svg>
            {{ s.biblePassage }}
          </p>
          <div class="sermon-card-footer">
            <span class="view-btn">{{ t('common.viewDetail') }}</span>
            <button 
              v-if="isMaster" 
              @click.stop="handleDeleteSermon(s.id, s.title)" 
              class="btn-delete"
              :title="t('common.delete')"
            >
              {{ t('common.delete') }}
            </button>
          </div>
        </div>
      </div>
      
      <div v-else class="glass-card empty-card">
        <p>{{ t('sermons.empty') }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { collection, getDocs, addDoc, doc, deleteDoc, query, orderBy } from 'firebase/firestore'

const { isMaster } = useAuth()
const { t } = useLanguage()
const { $firebaseDb } = useNuxtApp()

const sermons = ref<any[]>([])
const showCreateForm = ref(false)
const isSubmitting = ref(false)

const newSermon = ref({
  title: '',
  speaker: '',
  biblePassage: '',
  date: new Date().toISOString().substring(0, 10),
  videoUrl: '',
  content: ''
})

const fetchSermons = async () => {
  if (!$firebaseDb) return
  try {
    const q = query(collection($firebaseDb, 'sermons'), orderBy('date', 'desc'))
    const snap = await getDocs(q)
    const list: any[] = []
    snap.forEach((d) => {
      list.push({
        id: d.id,
        ...d.data()
      })
    })
    sermons.value = list
  } catch (err) {
    console.error('Error fetching sermons:', err)
  }
}

onMounted(() => {
  fetchSermons()
})

const handleCreateSermon = async () => {
  isSubmitting.value = true
  try {
    await addDoc(collection($firebaseDb, 'sermons'), {
      ...newSermon.value,
      createdAt: new Date().toISOString()
    })
    
    // Clear and hide form
    newSermon.value = {
      title: '',
      speaker: '',
      biblePassage: '',
      date: new Date().toISOString().substring(0, 10),
      videoUrl: '',
      content: ''
    }
    showCreateForm.value = false
    
    // Reload sermons
    await fetchSermons()
  } catch (err) {
    console.error('Error adding sermon:', err)
    alert('설교말씀 추가에 실패했습니다. 권한을 확인해 주세요.')
  } finally {
    isSubmitting.value = false
  }
}

const handleDeleteSermon = async (id: string, title: string) => {
  if (!confirm(`설교 말씀 "${title}" 글을 완전히 삭제하시겠습니까?`)) {
    return
  }
  try {
    await deleteDoc(doc($firebaseDb, 'sermons', id))
    await fetchSermons()
  } catch (err) {
    console.error('Error deleting sermon:', err)
    alert('삭제 오류가 발생했습니다.')
  }
}

const navigateToDetail = (id: string) => {
  navigateTo(`/sermons/${id}`)
}

const formatDate = (dateStr: string) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`
}
</script>

<style lang="scss" scoped>

.sermons-page {
  display: flex;
  flex-direction: column;
  gap: 28px;
}

.sermons-header {
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

.form-card {
  h2 {
    font-size: 1.25rem;
    margin-bottom: 20px;
    color: $primary;
    border-bottom: 1px solid $border-color;
    padding-bottom: 12px;
  }
}

.sermon-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-row-2 {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
}

.textarea-field {
  resize: vertical;
  min-height: 120px;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 10px;
}

.sermon-card {
  display: flex;
  flex-direction: column;
  gap: 12px;
  cursor: pointer;
}

.sermon-meta {
  display: flex;
  justify-content: space-between;
  font-size: 0.8rem;
  color: $text-muted;
  font-weight: 500;
}

.sermon-title {
  font-size: 1.2rem;
  font-weight: 700;
  color: $text-primary;
  line-height: 1.4;
}

.sermon-passage {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.9rem;
  color: $text-secondary;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid $border-color;
  padding: 6px 12px;
  border-radius: $radius-sm;
  width: fit-content;

  .bible-icon {
    width: 16px;
    height: 16px;
    color: $primary;
  }
}

.sermon-card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
  padding-top: 12px;
  border-top: 1px solid rgba(255, 255, 255, 0.05);

  .view-btn {
    font-size: 0.85rem;
    font-weight: 600;
    color: $primary;
  }
}

.btn-delete {
  background: transparent;
  border: 1px solid rgba(239, 68, 68, 0.3);
  color: #ef4444;
  padding: 4px 10px;
  border-radius: $radius-sm;
  font-size: 0.75rem;
  cursor: pointer;
  transition: $transition-smooth;

  &:hover {
    background: rgba(239, 68, 68, 0.1);
    border-color: #ef4444;
  }
}

.empty-card {
  text-align: center;
  color: $text-muted;
  padding: 60px 20px;
}

// Expand Transition
.expand-enter-active, .expand-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}
.expand-enter-from, .expand-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
