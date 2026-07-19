<template>
  <div class="events-page">
    <div class="events-header">
      <h1>{{ t('events.title') }}</h1>
      <p class="subtitle">{{ t('events.subtitle') }}</p>
    </div>

    <!-- Stats & Progress Section -->
    <section class="glass-card stats-card">
      <div class="stats-grid">
        <div class="stat-item">
          <span class="stat-label">{{ t('events.total') }}</span>
          <span class="stat-value">{{ totalChaptersSum }} / {{ TARGET_CHAPTERS }} {{ t('events.chapters') }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">{{ t('events.progress') }}</span>
          <span class="stat-value percent">{{ completionPercent }}%</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">{{ t('events.participants') }}</span>
          <span class="stat-value">{{ uniqueParticipantsCount }} {{ t('events.people') }}</span>
        </div>
      </div>

      <!-- Glowing Progress Bar -->
      <div class="progress-container">
        <div class="progress-track">
          <div class="progress-fill" :style="{ width: `${completionPercent}%` }">
            <span class="progress-glow"></span>
          </div>
        </div>
        <div class="progress-labels">
          <span>{{ t('events.start') }}</span>
          <span>{{ t('events.goal') }}</span>
        </div>
      </div>
    </section>

    <div class="events-content-grid">
      <!-- Left Column: Report Form -->
      <section class="glass-card report-card">
        <h2>{{ t('events.report') }}</h2>
        <form @submit.prevent="handleReportReading" class="report-form">
          <div class="form-group">
            <label for="bible-book">성경 선택</label>
            <select id="bible-book" v-model="form.book" class="input-field select-field" required>
              <option value="" disabled>성경을 선택하세요</option>
              <optgroup label="구약성경">
                <option v-for="b in OLD_TESTAMENT" :key="b" :value="b">{{ b }}</option>
              </optgroup>
              <optgroup label="신약성경">
                <option v-for="b in NEW_TESTAMENT" :key="b" :value="b">{{ b }}</option>
              </optgroup>
            </select>
          </div>

          <div class="form-row-2">
            <div class="form-group">
              <label for="start-chapter">시작 장</label>
              <input 
                id="start-chapter" 
                v-model.number="form.startChapter" 
                type="number" 
                min="1" 
                required 
                placeholder="1"
                class="input-field"
              />
            </div>
            <div class="form-group">
              <label for="end-chapter">끝 장</label>
              <input 
                id="end-chapter" 
                v-model.number="form.endChapter" 
                type="number" 
                min="1" 
                required 
                placeholder="5"
                class="input-field"
              />
            </div>
          </div>

          <div v-if="computedChapters > 0" class="chapters-preview">
            총 <strong>{{ computedChapters }}장</strong>을 읽으셨습니다.
          </div>

          <button type="submit" class="btn btn-primary w-full" :disabled="isSubmitting || computedChapters <= 0">
            읽기 완료 인증
          </button>
        </form>
      </section>

      <!-- Right Column: Timeline logs -->
      <section class="glass-card logs-card">
        <h2>{{ t('events.feed') }}</h2>
        <div class="logs-feed">
          <div 
            v-for="l in logs" 
            :key="l.id" 
            class="feed-item"
          >
            <div class="feed-indicator"></div>
            <div class="feed-content">
              <div class="feed-text">
                <strong class="member-name">{{ l.name }}</strong> 성도님이 
                <span class="read-passage">{{ l.book }} {{ l.startChapter }}장 ~ {{ l.endChapter }}장</span>을 
                읽었습니다!
              </div>
              <div class="feed-meta">
                <span class="chapters-badge">+{{ l.totalChapters }}장</span>
                <span class="feed-time">{{ formatTime(l.createdAt) }}</span>
                <button 
                  v-if="isMaster || l.createdBy === currentUid" 
                  @click="handleDeleteLog(l.id, l.name)"
                  class="btn-log-delete"
                >
                  {{ t('common.cancel') }}
                </button>
              </div>
            </div>
          </div>

          <div v-if="logs.length === 0" class="no-logs">
            <p>{{ t('events.noLogs') }}</p>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { collection, getDocs, addDoc, deleteDoc, doc, query, orderBy, limit } from 'firebase/firestore'

const { userName, user: currentUser, isMaster } = useAuth()
const { t } = useLanguage()
const { $firebaseDb } = useNuxtApp()

const TARGET_CHAPTERS = 1189 // Total chapters in the Bible (OT: 929, NT: 260)

const currentUid = computed(() => currentUser.value?.uid || '')

const logs = ref<any[]>([])
const isSubmitting = ref(false)

const form = ref({
  book: '',
  startChapter: null as number | null,
  endChapter: null as number | null
})

// Quick reference lists for Korean Bible books
const OLD_TESTAMENT = [
  '창세기', '출애굽기', '레위기', '민수기', '신명기', '여호수아', '사사기', '룻기', 
  '사무엘상', '사무엘하', '열왕기상', '열왕기하', '역대상', '역대하', '에스라', '느헤미야', 
  '에스더', '욥기', '시편', '잠언', '전도서', '아가', '이사야', '예레미야', '예레미야 애가', 
  '에스겔', '다니엘', '호세아', '요엘', '아모스', '오바destination', '요나', '미가', '나훔', 
  '하박국', '스바냐', '학개', '스가랴', '말라기'
]

const NEW_TESTAMENT = [
  '마태복음', '마가복음', '누가복음', '요한복음', '사도행전', '로마서', '고린도전서', 
  '고린도후서', '갈라디아서', '에베소서', '빌립보서', '골로새서', '데살로니가전서', 
  '데살로니가후서', '디모데전서', '디모데후서', '디도서', '빌레몬서', '히브리서', 
  '야고보서', '베드로전서', '베드로후서', '요한일서', '요한이서', '요한삼서', '유다서', 
  '요한계시록'
]

const computedChapters = computed(() => {
  if (form.value.startChapter && form.value.endChapter) {
    const diff = form.value.endChapter - form.value.startChapter + 1
    return diff > 0 ? diff : 0
  }
  return 0
})

// Calculate cumulative stats from loaded logs
const totalChaptersSum = computed(() => {
  const sum = logs.value.reduce((acc, log) => acc + (log.totalChapters || 0), 0)
  return sum
})

const completionPercent = computed(() => {
  if (totalChaptersSum.value === 0) return 0
  const pct = Math.min((totalChaptersSum.value / TARGET_CHAPTERS) * 100, 100)
  return parseFloat(pct.toFixed(1))
})

const uniqueParticipantsCount = computed(() => {
  const usersSet = new Set(logs.value.map(log => log.createdBy))
  return usersSet.size
})

const fetchLogs = async () => {
  try {
    const colRef = collection($firebaseDb, 'events_bible_relay_logs')
    const q = query(colRef, orderBy('createdAt', 'desc'), limit(100))
    const snap = await getDocs(q)
    const list: any[] = []
    snap.forEach((d) => {
      list.push({
        id: d.id,
        ...d.data()
      })
    })
    logs.value = list
  } catch (err) {
    console.error('Error fetching event logs:', err)
  }
}

onMounted(() => {
  fetchLogs()
})

const handleReportReading = async () => {
  if (!form.value.book || !form.value.startChapter || !form.value.endChapter) return
  if (computedChapters.value <= 0) {
    alert('끝 장은 시작 장보다 크거나 같아야 합니다.')
    return
  }

  isSubmitting.value = true
  try {
    const colRef = collection($firebaseDb, 'events_bible_relay_logs')
    await addDoc(colRef, {
      book: form.value.book,
      startChapter: form.value.startChapter,
      endChapter: form.value.endChapter,
      totalChapters: computedChapters.value,
      name: userName.value,
      createdBy: currentUid.value,
      createdAt: new Date().toISOString()
    })

    // Reset Form
    form.value.book = ''
    form.value.startChapter = null
    form.value.endChapter = null

    await fetchLogs()
  } catch (err) {
    console.error('Error adding relay log:', err)
    alert('인증 등록에 실패했습니다.')
  } finally {
    isSubmitting.value = false
  }
}

const handleDeleteLog = async (id: string, name: string) => {
  if (!confirm(`${name} 성도님의 해당 통독 인증 기록을 취소/삭제하시겠습니까?`)) {
    return
  }
  try {
    await deleteDoc(doc($firebaseDb, 'events_bible_relay_logs', id))
    await fetchLogs()
  } catch (err) {
    console.error('Error deleting event log:', err)
    alert('삭제 오류가 발생했습니다.')
  }
}

const formatTime = (dateStr: string) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return `${date.getMonth() + 1}/${date.getDate()} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
}
</script>

<style lang="scss" scoped>

.events-page {
  display: flex;
  flex-direction: column;
  gap: 28px;
}

.events-header {
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

.stats-card {
  padding: 32px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  text-align: center;

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
    gap: 16px;
  }
}

.stat-item {
  display: flex;
  flex-direction: column;
  gap: 6px;

  .stat-label {
    font-size: 0.85rem;
    color: $text-secondary;
    font-weight: 500;
  }

  .stat-value {
    font-family: $font-title;
    font-size: 1.6rem;
    font-weight: 800;
    color: $primary;

    &.percent {
      color: $primary-hover;
    }
  }
}

.progress-container {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.progress-track {
  height: 12px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid $border-color;
  border-radius: 9999px;
  overflow: hidden;
  position: relative;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, $primary, $primary-hover);
  border-radius: 9999px;
  position: relative;
  transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

.progress-glow {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  width: 10px;
  background: #fff;
  filter: blur(4px);
  opacity: 0.6;
}

.progress-labels {
  display: flex;
  justify-content: space-between;
  font-size: 0.75rem;
  color: $text-muted;
  font-weight: 500;
}

.events-content-grid {
  display: grid;
  grid-template-columns: 380px 1fr;
  gap: 28px;

  @media (max-width: 850px) {
    grid-template-columns: 1fr;
  }
}

.report-card {
  height: fit-content;
  h2 {
    font-size: 1.25rem;
    color: $primary;
    border-bottom: 1px solid $border-color;
    padding-bottom: 12px;
    margin-bottom: 20px;
  }
}

.report-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.select-field {
  appearance: none;
  background-image: url("data:image/svg+xml;utf8,<svg fill='%2394a3b8' height='24' viewBox='0 0 24 24' width='24' xmlns='http://www.w3.org/2000/svg'><path d='M7 10l5 5 5-5z'/></svg>");
  background-repeat: no-repeat;
  background-position: right 12px center;
  padding-right: 40px;
}

.form-row-2 {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.chapters-preview {
  background: rgba(233, 196, 106, 0.05);
  border: 1px solid rgba(233, 196, 106, 0.15);
  color: $text-secondary;
  padding: 10px 14px;
  border-radius: $radius-sm;
  font-size: 0.85rem;
  text-align: center;
  
  strong {
    color: $primary;
  }
}

.logs-card {
  display: flex;
  flex-direction: column;
  gap: 20px;

  h2 {
    font-size: 1.25rem;
    color: $text-primary;
    border-bottom: 1px solid $border-color;
    padding-bottom: 12px;
  }
}

.logs-feed {
  display: flex;
  flex-direction: column;
  gap: 14px;
  max-height: 480px;
  overflow-y: auto;
  padding-right: 6px;
}

.feed-item {
  display: flex;
  gap: 16px;
  align-items: flex-start;
  padding: 12px;
  background: rgba(255, 255, 255, 0.01);
  border: 1px solid $border-color;
  border-radius: $radius-sm;
  transition: $transition-smooth;

  &:hover {
    background: rgba(255, 255, 255, 0.02);
    border-color: $border-hover;
  }
}

.feed-indicator {
  width: 8px;
  height: 8px;
  background: $primary;
  border-radius: 50%;
  margin-top: 6px;
  box-shadow: 0 0 8px $primary;
  flex-shrink: 0;
}

.feed-content {
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 1;
}

.feed-text {
  font-size: 0.9rem;
  color: $text-secondary;
  line-height: 1.4;

  .member-name {
    color: $text-primary;
  }

  .read-passage {
    color: $primary;
    font-weight: 600;
  }
}

.feed-meta {
  display: flex;
  align-items: center;
  gap: 12px;
}

.chapters-badge {
  background: rgba(16, 185, 129, 0.15);
  color: $success;
  font-size: 0.75rem;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 4px;
}

.feed-time {
  font-size: 0.75rem;
  color: $text-muted;
}

.btn-log-delete {
  background: none;
  border: none;
  color: $text-muted;
  font-size: 0.75rem;
  cursor: pointer;
  padding: 0;

  &:hover {
    color: #ef4444;
    text-decoration: underline;
  }
}

.no-logs {
  text-align: center;
  color: $text-muted;
  font-size: 0.9rem;
  padding: 40px 10px;
}

.w-full {
  width: 100%;
}
</style>
