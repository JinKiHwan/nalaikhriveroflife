<template>
  <div class="notices-page">
    <div class="notices-header">
      <div>
        <h1>{{ t('notices.title') }}</h1>
        <p class="subtitle">{{ t('notices.subtitle') }}</p>
      </div>

      <!-- Notice Create Button (Master only) -->
      <button 
        v-if="isMaster" 
        @click="showCreateForm = !showCreateForm" 
        class="btn btn-primary"
      >
        {{ showCreateForm ? t('common.cancel') : t('notices.create') }}
      </button>
    </div>

    <!-- Create Notice Form -->
    <transition name="expand">
      <div v-if="showCreateForm" class="glass-card form-card">
        <h2>새 공지사항 작성</h2>
        <form @submit.prevent="handleCreateNotice" class="notice-form">
          <div class="form-group">
            <label for="title">공지 제목</label>
            <input 
              id="title" 
              v-model="newNotice.title" 
              type="text" 
              required 
              placeholder="공지 제목을 입력하세요"
              class="input-field"
            />
          </div>

          <div class="form-group">
            <label for="content">공지 내용</label>
            <textarea 
              id="content" 
              v-model="newNotice.content" 
              rows="6" 
              required
              placeholder="공지할 상세 내용을 적어주세요."
              class="input-field textarea-field"
            ></textarea>
          </div>

          <!-- Pin to Top Option -->
          <div class="form-group form-checkbox">
            <label class="checkbox-container">
              <input 
                type="checkbox" 
                v-model="newNotice.isPinned" 
              />
              <span class="checkmark"></span>
              이 공지를 목록 최상단에 고정 (Pinned Notice)
            </label>
          </div>

          <div class="form-actions">
            <button type="submit" class="btn btn-primary" :disabled="isSubmitting">
              공지 등록
            </button>
          </div>
        </form>
      </div>
    </transition>

    <!-- Notices Board List -->
    <div class="notices-list">
      <!-- Pinned Notices (Golden borders, pinned icons) -->
      <div 
        v-for="n in pinnedNotices" 
        :key="n.id" 
        class="glass-card notice-card pinned"
        @click="navigateToDetail(n.id)"
      >
        <div class="notice-badge-line">
          <span class="pinned-tag">
            <svg class="pin-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M16 12V4H17V2H7V4H8V12L6 14V16H11.2V22H12.8V16H18V14L16 12ZM8.8 14L10 12.8V4H14V12.8L15.2 14H8.8Z" fill="currentColor"/>
            </svg>
            {{ t('notices.pinned') }}
          </span>
          <span class="notice-date">{{ formatDate(n.createdAt) }}</span>
        </div>
        <h3 class="notice-title">{{ n.title }}</h3>
        <p class="notice-excerpt">{{ getExcerpt(n.content) }}</p>
        <div class="notice-footer">
          <span class="read-more">{{ t('common.viewDetail') }} →</span>
          <button 
            v-if="isMaster" 
            @click.stop="handleDeleteNotice(n.id, n.title)" 
            class="btn-delete"
          >
            {{ t('common.delete') }}
          </button>
        </div>
      </div>

      <!-- Regular Notices -->
      <div 
        v-for="n in regularNotices" 
        :key="n.id" 
        class="glass-card hoverable notice-card"
        @click="navigateToDetail(n.id)"
      >
        <div class="notice-badge-line">
          <span class="notice-date">{{ formatDate(n.createdAt) }}</span>
        </div>
        <h3 class="notice-title">{{ n.title }}</h3>
        <p class="notice-excerpt">{{ getExcerpt(n.content) }}</p>
        <div class="notice-footer">
          <span class="read-more">{{ t('common.viewDetail') }} →</span>
          <button 
            v-if="isMaster" 
            @click.stop="handleDeleteNotice(n.id, n.title)" 
            class="btn-delete"
          >
            {{ t('common.delete') }}
          </button>
        </div>
      </div>

      <!-- Empty State -->
      <div v-if="pinnedNotices.length === 0 && regularNotices.length === 0" class="glass-card empty-card">
        <p>{{ t('notices.empty') }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { collection, getDocs, addDoc, doc, deleteDoc, query, orderBy } from 'firebase/firestore'

const { isMaster, userName } = useAuth()
const { t } = useLanguage()
const { $firebaseDb } = useNuxtApp()

const allNotices = ref<any[]>([])
const showCreateForm = ref(false)
const isSubmitting = ref(false)

const newNotice = ref({
  title: '',
  content: '',
  isPinned: false
})

const fetchNotices = async () => {
  try {
    const q = query(collection($firebaseDb, 'notices'), orderBy('createdAt', 'desc'))
    const snap = await getDocs(q)
    const list: any[] = []
    snap.forEach((d) => {
      list.push({
        id: d.id,
        ...d.data()
      })
    })
    allNotices.value = list
  } catch (err) {
    console.error('Error fetching notices:', err)
  }
}

// Client-side grouping of Pinned and Regular notices
const pinnedNotices = computed(() => {
  return allNotices.value.filter(n => n.isPinned === true)
})

const regularNotices = computed(() => {
  return allNotices.value.filter(n => n.isPinned !== true)
})

onMounted(() => {
  fetchNotices()
})

const handleCreateNotice = async () => {
  isSubmitting.value = true
  try {
    await addDoc(collection($firebaseDb, 'notices'), {
      ...newNotice.value,
      authorName: userName.value,
      createdAt: new Date().toISOString()
    })

    // Reset Form
    newNotice.value = {
      title: '',
      content: '',
      isPinned: false
    }
    showCreateForm.value = false
    await fetchNotices()
  } catch (err) {
    console.error('Error adding notice:', err)
    alert('공지 작성에 실패했습니다.')
  } finally {
    isSubmitting.value = false
  }
}

const handleDeleteNotice = async (id: string, title: string) => {
  if (!confirm(`공지사항 "${title}" 글을 완전히 삭제하시겠습니까?`)) {
    return
  }
  try {
    await deleteDoc(doc($firebaseDb, 'notices', id))
    await fetchNotices()
  } catch (err) {
    console.error('Error deleting notice:', err)
    alert('삭제에 실패했습니다.')
  }
}

const navigateToDetail = (id: string) => {
  navigateTo(`/notices/${id}`)
}

const formatDate = (dateStr: string) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return `${date.getFullYear()}.${date.getMonth() + 1}.${date.getDate()} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
}

const getExcerpt = (text: string) => {
  if (!text) return ''
  return text.length > 120 ? text.substring(0, 120) + '...' : text
}
</script>

<style lang="scss" scoped>

.notices-page {
  display: flex;
  flex-direction: column;
  gap: 28px;
}

.notices-header {
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

.notice-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.textarea-field {
  resize: vertical;
  min-height: 100px;
}

.form-checkbox {
  display: flex;
  flex-direction: row;
  align-items: center;
}

.checkbox-container {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 0.9rem;
  color: $text-secondary;
  cursor: pointer;
  user-select: none;

  input {
    cursor: pointer;
    accent-color: $primary;
    width: 18px;
    height: 18px;
  }
}

.form-actions {
  display: flex;
  justify-content: flex-end;
}

.notices-list {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.notice-card {
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: 12px;

  &.pinned {
    border: 1px solid rgba(233, 196, 106, 0.4);
    background: rgba(233, 196, 106, 0.03);
    
    &:hover {
      box-shadow: $shadow-premium, 0 0 15px rgba(233, 196, 106, 0.1);
      border-color: $primary;
    }
  }
}

.notice-badge-line {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.pinned-tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: rgba(233, 196, 106, 0.15);
  color: $primary;
  font-size: 0.75rem;
  font-weight: 700;
  padding: 4px 8px;
  border-radius: 4px;
  border: 1px solid rgba(233, 196, 106, 0.25);

  .pin-icon {
    width: 12px;
    height: 12px;
  }
}

.notice-date {
  font-size: 0.8rem;
  color: $text-muted;
  font-weight: 500;
}

.notice-title {
  font-size: 1.2rem;
  font-weight: 700;
  color: $text-primary;
}

.notice-excerpt {
  font-size: 0.95rem;
  color: $text-secondary;
  line-height: 1.6;
}

.notice-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 8px;
  border-top: 1px solid rgba(255, 255, 255, 0.04);

  .read-more {
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
  padding: 50px 20px;
}

// Expand transition
.expand-enter-active, .expand-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}
.expand-enter-from, .expand-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
