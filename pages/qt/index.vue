<template>
  <div class="qt-page">
    <div class="qt-header">
      <div>
        <h1>매일 QT 묵상 나눔</h1>
        <p class="subtitle">오늘 주신 말씀을 깊이 묵상하고 성도의 은혜를 댓글로 나눕니다.</p>
      </div>

      <!-- Date Switcher -->
      <div class="date-switcher">
        <button @click="adjustDate(-1)" class="btn btn-secondary btn-date-arrow">←</button>
        <span class="current-date-label">{{ formattedSelectedDate }}</span>
        <button @click="adjustDate(1)" class="btn btn-secondary btn-date-arrow">→</button>
        <input 
          type="date" 
          v-model="selectedDate" 
          @change="fetchQT"
          class="date-input-hidden"
          ref="dateInputRef"
        />
        <button @click="triggerDatePicker" class="btn btn-secondary btn-calendar">
          <svg class="calendar-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 4H18V2H16V4H8V2H6V4H5C3.89 4 3.01 4.9 3.01 6L3 20C3 21.1 3.89 22 5 22H19C20.1 22 21 21.1 21 20V6C21 4.9 20.1 4 19 4ZM19 20H5V9H19V20ZM17 12H12V17H17V12Z" fill="currentColor"/>
          </svg>
        </button>
      </div>
    </div>

    <div class="qt-content-grid">
      <!-- Left Column: QT Scripture & Content -->
      <section class="glass-card qt-body-card">
        <div v-if="qtData" class="qt-content-wrapper">
          <div class="qt-meta-label">오늘의 말씀</div>
          <h2 class="qt-title">{{ qtData.title }}</h2>
          <div class="qt-passage-box">
            <svg class="bible-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M21 5C19.89 4.65 18.5 4.5 17 4.5C15.5 4.5 14 4.8 12.5 5.5C11 4.8 9.5 4.5 8 4.5C6.5 4.5 5.11 4.65 4 5V19C5.11 18.65 6.5 18.5 8 18.5C9.5 18.5 11 18.8 12.5 19.5C14 18.8 15.5 18.5 17 18.5C18.5 18.5 19.89 18.65 21 19V5ZM19 16.89C18.36 16.65 17.7 16.5 17 16.5C15.82 16.5 14.65 16.79 13.5 17.38V7.5C14.54 7.02 15.75 6.79 17 6.79C17.7 6.79 18.36 6.88 19 7.07V16.89Z" fill="currentColor"/>
            </svg>
            <strong>{{ qtData.biblePassage }}</strong>
          </div>
          
          <div class="qt-text">
            <p v-for="(paragraph, index) in formattedQTText" :key="index">
              {{ paragraph }}
            </p>
          </div>
        </div>

        <!-- Master Create QT Form (If missing and user is Master) -->
        <div v-else-if="isMaster && !isLoading" class="create-qt-container">
          <div class="no-qt-alert">선택한 날짜({{ selectedDate }})의 QT가 아직 등록되지 않았습니다.</div>
          <h3>오늘의 QT 등록하기</h3>
          <form @submit.prevent="handleCreateQT" class="qt-form">
            <div class="form-group">
              <label for="qt-title">QT 제목 / 묵상 주제</label>
              <input 
                id="qt-title" 
                v-model="newQT.title" 
                type="text" 
                required 
                placeholder="예: 생명을 솟구쳐 오르게 하시는 주님"
                class="input-field"
              />
            </div>
            <div class="form-group">
              <label for="qt-passage">성경 구절 범위</label>
              <input 
                id="qt-passage" 
                v-model="newQT.biblePassage" 
                type="text" 
                required 
                placeholder="예: 요한복음 4장 1-14절"
                class="input-field"
              />
            </div>
            <div class="form-group">
              <label for="qt-text-content">성경 본문 말씀 및 묵상 내용</label>
              <textarea 
                id="qt-text-content" 
                v-model="newQT.content" 
                rows="10" 
                required
                placeholder="성경 구절 내용과 해설, 혹은 함께 묵상할 질문들을 적어주세요."
                class="input-field textarea-field"
              ></textarea>
            </div>
            <button type="submit" class="btn btn-primary" :disabled="isSubmitting">
              오늘의 QT 발행
            </button>
          </form>
        </div>

        <!-- Missing QT placeholder for normals -->
        <div v-else-if="!isLoading" class="no-qt-placeholder">
          <svg class="empty-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM13 17H11V15H13V17ZM13 13H11V7H13V13Z" fill="currentColor"/>
          </svg>
          <p>선택하신 날짜의 묵상 말씀이 아직 등록되지 않았습니다.</p>
          <p class="sub">관리자분들께서 매일 아침 업데이트를 준비 중입니다.</p>
        </div>

        <div v-else class="qt-loading">
          <div class="spinner"></div>
          <p>묵상 말씀을 불러오는 중...</p>
        </div>
      </section>

      <!-- Right Column: Reflection Comments Feed -->
      <section class="glass-card qt-comments-card">
        <h3>은혜 나눔 묵상 댓글 ({{ comments.length }})</h3>

        <!-- Comment Write Input -->
        <form @submit.prevent="handleCreateComment" class="comment-write-form">
          <textarea 
            v-model="newComment" 
            rows="3" 
            required 
            placeholder="성령님께서 오늘 주신 은혜와 깨달음을 성도들과 나누어 보세요."
            class="input-field comment-textarea"
            :disabled="!qtData || isSubmittingComment"
          ></textarea>
          <div class="comment-actions">
            <button 
              type="submit" 
              class="btn btn-primary btn-sm" 
              :disabled="!qtData || isSubmittingComment || !newComment.trim()"
            >
              묵상 등록
            </button>
          </div>
        </form>

        <!-- Comments Feed -->
        <div class="comments-feed-list">
          <div 
            v-for="c in comments" 
            :key="c.id" 
            class="comment-item"
          >
            <div class="comment-header">
              <span class="comment-author">{{ c.authorName }}</span>
              <span class="comment-date">{{ formatCommentDate(c.createdAt) }}</span>
            </div>
            <p class="comment-content">{{ c.content }}</p>
            <div class="comment-footer">
              <button 
                v-if="isMaster || c.createdBy === currentUid" 
                @click="handleDeleteComment(c.id)" 
                class="btn-comment-delete"
              >
                삭제
              </button>
            </div>
          </div>

          <div v-if="comments.length === 0" class="no-comments">
            <p>첫 묵상 나눔을 작성하여 은혜를 나누어 보세요.</p>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { doc, getDoc, setDoc, collection, getDocs, addDoc, deleteDoc, query, orderBy } from 'firebase/firestore'

const { isMaster, userName, user: currentUser } = useAuth()
const { $firebaseDb } = useNuxtApp()

const currentUid = computed(() => currentUser.value?.uid || '')
const dateInputRef = ref<HTMLInputElement | null>(null)

// Selected date format YYYY-MM-DD
const selectedDate = ref(new Date().toISOString().substring(0, 10))

const qtData = ref<any>(null)
const comments = ref<any[]>([])
const isLoading = ref(true)
const isSubmitting = ref(false)
const isSubmittingComment = ref(false)

const newComment = ref('')

const newQT = ref({
  title: '',
  biblePassage: '',
  content: ''
})

const formattedSelectedDate = computed(() => {
  const date = new Date(selectedDate.value)
  return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`
})

const formattedQTText = computed(() => {
  if (!qtData.value?.content) return []
  return qtData.value.content.split('\n').filter((p: string) => p.trim() !== '')
})

const triggerDatePicker = () => {
  dateInputRef.value?.showPicker()
}

const adjustDate = (days: number) => {
  const date = new Date(selectedDate.value)
  date.setDate(date.getDate() + days)
  selectedDate.value = date.toISOString().substring(0, 10)
  fetchQT()
}

const fetchQT = async () => {
  isLoading.value = true
  qtData.value = null
  comments.value = []
  
  try {
    // 1. Fetch QT for selected date
    const qtDocRef = doc($firebaseDb, 'qt', selectedDate.value)
    const snap = await getDoc(qtDocRef)
    
    if (snap.exists()) {
      qtData.value = snap.data()
      // 2. Fetch comments
      await fetchComments()
    }
  } catch (err) {
    console.error('Error fetching QT details:', err)
  } finally {
    isLoading.value = false
  }
}

const fetchComments = async () => {
  try {
    const commentsColRef = collection($firebaseDb, 'qt', selectedDate.value, 'comments')
    const q = query(commentsColRef, orderBy('createdAt', 'desc'))
    const snap = await getDocs(q)
    const list: any[] = []
    snap.forEach((d) => {
      list.push({
        id: d.id,
        ...d.data()
      })
    })
    comments.value = list
  } catch (err) {
    console.error('Error fetching QT comments:', err)
  }
}

onMounted(() => {
  fetchQT()
})

const handleCreateQT = async () => {
  isSubmitting.value = true
  try {
    const docRef = doc($firebaseDb, 'qt', selectedDate.value)
    await setDoc(docRef, {
      ...newQT.value,
      date: selectedDate.value,
      createdAt: new Date().toISOString(),
      createdBy: currentUid.value
    })
    
    // Clear registration values
    newQT.value = { title: '', biblePassage: '', content: '' }
    await fetchQT()
  } catch (err) {
    console.error('Error creating QT:', err)
    alert('QT 발행에 실패했습니다.')
  } finally {
    isSubmitting.value = false
  }
}

const handleCreateComment = async () => {
  if (!newComment.value.trim() || !qtData.value) return
  isSubmittingComment.value = true
  
  try {
    const commentsColRef = collection($firebaseDb, 'qt', selectedDate.value, 'comments')
    await addDoc(commentsColRef, {
      content: newComment.value,
      authorName: userName.value,
      createdBy: currentUid.value,
      createdAt: new Date().toISOString()
    })
    newComment.value = ''
    await fetchComments()
  } catch (err) {
    console.error('Error adding comment:', err)
    alert('댓글 등록에 실패했습니다.')
  } finally {
    isSubmittingComment.value = false
  }
}

const handleDeleteComment = async (commentId: string) => {
  if (!confirm('작성하신 묵상 댓글을 삭제하시겠습니까?')) {
    return
  }
  try {
    const commentRef = doc($firebaseDb, 'qt', selectedDate.value, 'comments', commentId)
    await deleteDoc(commentRef)
    await fetchComments()
  } catch (err) {
    console.error('Error deleting comment:', err)
    alert('삭제 오류가 발생했습니다.')
  }
}

const formatCommentDate = (dateStr: string) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return `${date.getMonth() + 1}/${date.getDate()} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
}
</script>

<style lang="scss" scoped>

.qt-page {
  display: flex;
  flex-direction: column;
  gap: 28px;
}

.qt-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
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

.date-switcher {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid $border-color;
  border-radius: $radius-sm;
  padding: 4px;
}

.current-date-label {
  font-family: $font-title;
  font-size: 1rem;
  font-weight: 700;
  color: $primary;
  padding: 0 12px;
  min-width: 140px;
  text-align: center;
}

.btn-date-arrow {
  padding: 8px 12px;
  font-weight: bold;
}

.btn-calendar {
  padding: 8px 10px;
  color: $text-secondary;
  display: flex;
  align-items: center;
  justify-content: center;

  .calendar-icon {
    width: 18px;
    height: 18px;
  }
}

.date-input-hidden {
  display: none;
}

.qt-content-grid {
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: 28px;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
}

.qt-body-card {
  height: fit-content;
  padding: 32px;
}

.qt-meta-label {
  display: inline-block;
  background: rgba(233, 196, 106, 0.1);
  color: $primary;
  border: 1px solid rgba(233, 196, 106, 0.2);
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  margin-bottom: 14px;
}

.qt-title {
  font-size: 1.6rem;
  color: $text-primary;
  margin-bottom: 12px;
}

.qt-passage-box {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid $border-color;
  padding: 8px 16px;
  border-radius: $radius-sm;
  color: $primary;
  margin-bottom: 24px;

  .bible-icon {
    width: 18px;
    height: 18px;
  }
}

.qt-text {
  font-size: 1.05rem;
  color: $text-secondary;
  line-height: 1.8;
  display: flex;
  flex-direction: column;
  gap: 16px;
  white-space: pre-line;
}

.no-qt-placeholder {
  text-align: center;
  padding: 60px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;

  .empty-icon {
    width: 48px;
    height: 48px;
    color: $text-muted;
  }

  p {
    font-size: 1.1rem;
    color: $text-secondary;
    font-weight: 600;
  }
  .sub {
    font-size: 0.85rem;
    color: $text-muted;
  }
}

.create-qt-container {
  display: flex;
  flex-direction: column;
  gap: 20px;

  .no-qt-alert {
    background: rgba(244, 162, 97, 0.1);
    border: 1px solid rgba(244, 162, 97, 0.2);
    color: #f4a261;
    padding: 12px;
    border-radius: $radius-sm;
    font-size: 0.85rem;
  }

  h3 {
    font-size: 1.25rem;
    color: $primary;
    border-bottom: 1px solid $border-color;
    padding-bottom: 8px;
  }
}

.qt-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.qt-loading {
  text-align: center;
  padding: 50px;
  color: $text-muted;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;

  .spinner {
    width: 28px;
    height: 28px;
    border: 3px solid rgba(255, 255, 255, 0.1);
    border-radius: 50%;
    border-top-color: $primary;
    animation: spin 0.8s linear infinite;
  }
}

.qt-comments-card {
  display: flex;
  flex-direction: column;
  gap: 20px;
  height: fit-content;
  max-height: 800px;
  overflow-y: auto;

  h3 {
    font-size: 1.15rem;
    border-bottom: 1px solid $border-color;
    padding-bottom: 12px;
  }
}

.comment-write-form {
  display: flex;
  flex-direction: column;
  gap: 10px;

  .comment-textarea {
    resize: none;
    font-size: 0.9rem;
    padding: 10px 12px;
  }

  .comment-actions {
    display: flex;
    justify-content: flex-end;
  }
}

.comments-feed-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.comment-item {
  background: rgba(255, 255, 255, 0.01);
  border: 1px solid $border-color;
  border-radius: $radius-sm;
  padding: 12px 16px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  transition: $transition-smooth;

  &:hover {
    background: rgba(255, 255, 255, 0.02);
    border-color: $border-hover;
  }
}

.comment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.comment-author {
  font-size: 0.85rem;
  font-weight: 700;
  color: $text-primary;
}

.comment-date {
  font-size: 0.75rem;
  color: $text-muted;
}

.comment-content {
  font-size: 0.9rem;
  color: $text-secondary;
  line-height: 1.5;
  white-space: pre-wrap;
}

.comment-footer {
  display: flex;
  justify-content: flex-end;
}

.btn-comment-delete {
  background: none;
  border: none;
  color: $text-muted;
  font-size: 0.75rem;
  cursor: pointer;
  padding: 2px 4px;

  &:hover {
    color: #ef4444;
    text-decoration: underline;
  }
}

.no-comments {
  text-align: center;
  color: $text-muted;
  font-size: 0.85rem;
  padding: 30px 10px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
