<template>
  <div class="teachers-page">
    <div class="teachers-header">
      <div>
        <h1>선생님 모임방</h1>
        <p class="subtitle">주일학교 교사 및 교육 위원 전용 자료 공유 및 소통 공간입니다.</p>
      </div>

      <!-- Toggle Write Form (Teachers and Masters) -->
      <button 
        @click="showCreateForm = !showCreateForm" 
        class="btn btn-primary"
      >
        {{ showCreateForm ? '작성 취소' : '새 자료 등록' }}
      </button>
    </div>

    <!-- Create Post Form with File Upload -->
    <transition name="expand">
      <div v-if="showCreateForm" class="glass-card form-card">
        <h2>교사용 교육 자료 등록</h2>
        <form @submit.prevent="handleCreatePost" class="post-form">
          <div class="form-group">
            <label for="title">글 제목</label>
            <input 
              id="title" 
              v-model="newPost.title" 
              type="text" 
              required 
              placeholder="예: 이번주 아동부 주일학교 공과 교안 및 파일공유"
              class="input-field"
            />
          </div>

          <div class="form-group">
            <label for="content">안내 및 상세 설명</label>
            <textarea 
              id="content" 
              v-model="newPost.content" 
              rows="5" 
              required
              placeholder="자료에 대한 안내 및 사용 방법을 상세히 기록하세요."
              class="input-field textarea-field"
            ></textarea>
          </div>

          <!-- File upload input -->
          <div class="form-group">
            <label for="file-upload">교육 자료 첨부 파일 (선택)</label>
            <div class="file-upload-wrapper">
              <input 
                id="file-upload" 
                type="file" 
                ref="fileInputRef" 
                @change="handleFileChange"
                class="file-input-hidden"
              />
              <div class="file-upload-trigger" @click="triggerFileInput">
                <svg class="upload-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4C9.11 4 6.6 5.64 5.35 8.04C2.34 8.36 0 10.91 0 14C0 17.31 2.69 20 6 20H19C21.76 20 24 17.76 24 15C24 12.36 21.95 10.22 19.35 10.04ZM19 18H6C3.79 18 2 16.21 2 14C2 11.95 3.53 10.24 5.56 10.03L6.63 9.92L7.13 8.97C8.08 7.14 9.94 6 12 6C14.89 6 17.39 8.01 17.85 10.91L18.09 12.42L19.64 12.5C21.01 12.61 22 13.69 22 15C22 16.65 20.65 18 19 18ZM8 13H10.55V16H13.45V13H16L12 9L8 13Z" fill="currentColor"/>
                </svg>
                <span class="file-label">
                  {{ selectedFile ? `${selectedFile.name} (${formatSize(selectedFile.size)})` : '마우스로 클릭하여 파일을 선택하세요.' }}
                </span>
              </div>
              <button 
                v-if="selectedFile" 
                type="button" 
                @click="clearFile" 
                class="btn btn-secondary btn-clear-file"
              >
                선택 해제
              </button>
            </div>
            <p class="file-hint">최대 용량: 20MB</p>
          </div>

          <!-- Progress Bar -->
          <div v-if="isUploading" class="upload-progress-container">
            <div class="progress-bar" :style="{ width: `${uploadProgress}%` }"></div>
            <span class="progress-text">파일 업로드 중: {{ uploadProgress }}%</span>
          </div>

          <div class="form-actions">
            <button type="submit" class="btn btn-primary" :disabled="isSubmitting || isUploading">
              게시글 등록
            </button>
          </div>
        </form>
      </div>
    </transition>

    <!-- Post list -->
    <div class="posts-list">
      <div v-if="posts.length > 0" class="post-grid">
        <div 
          v-for="p in posts" 
          :key="p.id" 
          class="glass-card hoverable post-card"
          @click="navigateToDetail(p.id)"
        >
          <div class="post-meta">
            <span class="post-date">{{ formatDate(p.createdAt) }}</span>
            <span class="post-author">교사: {{ p.authorName }}</span>
          </div>
          
          <h3 class="post-title">{{ p.title }}</h3>
          
          <!-- Attachment Tag -->
          <div v-if="p.attachmentName" class="file-tag">
            <svg class="file-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M16.5 6V17.5C16.5 19.43 14.93 21 13 21C11.07 21 9.5 19.43 9.5 17.5V5C9.5 3.9 10.4 3 11.5 3C12.6 3 13.5 3.9 13.5 5V15.5C13.5 15.78 13.28 16 13 16C12.72 16 12.5 15.78 12.5 15.5V6H11V15.5C11 16.6 11.9 17.5 13 17.5C14.1 17.5 15 16.6 15 15.5V5C15 3.07 13.43 1.5 11.5 1.5C9.57 1.5 8 3.07 8 5V17.5C8 20.26 10.24 22.5 13 22.5C15.76 22.5 18 20.26 18 17.5V6H16.5Z" fill="currentColor"/>
            </svg>
            <span class="file-name">{{ p.attachmentName }}</span>
          </div>

          <div class="post-card-footer">
            <span class="view-btn">자세히 보기</span>
            <button 
              v-if="isMaster || p.createdBy === currentUid" 
              @click.stop="handleDeletePost(p.id, p.title)" 
              class="btn-delete"
            >
              삭제
            </button>
          </div>
        </div>
      </div>
      
      <div v-else class="glass-card empty-card">
        <p>선생님 모임방에 작성된 소식이나 자료가 없습니다.</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { collection, getDocs, addDoc, doc, deleteDoc, query, orderBy } from 'firebase/firestore'
import { ref as storageRef, uploadBytesResumable, getDownloadURL } from 'firebase/storage'

const { isMaster, userName, user: currentUser } = useAuth()
const { $firebaseDb, $firebaseStorage } = useNuxtApp()

const currentUid = computed(() => currentUser.value?.uid || '')

const posts = ref<any[]>([])
const showCreateForm = ref(false)
const isSubmitting = ref(false)
const isUploading = ref(false)
const uploadProgress = ref(0)
const selectedFile = ref<File | null>(null)
const fileInputRef = ref<HTMLInputElement | null>(null)

const newPost = ref({
  title: '',
  content: ''
})

const fetchPosts = async () => {
  try {
    const q = query(collection($firebaseDb, 'teachers_posts'), orderBy('createdAt', 'desc'))
    const snap = await getDocs(q)
    const list: any[] = []
    snap.forEach((d) => {
      list.push({
        id: d.id,
        ...d.data()
      })
    })
    posts.value = list
  } catch (err) {
    console.error('Error fetching teacher posts:', err)
  }
}

onMounted(() => {
  fetchPosts()
})

const triggerFileInput = () => {
  fileInputRef.value?.click()
}

const handleFileChange = (e: Event) => {
  const target = e.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    if (file.size > 20 * 1024 * 1024) {
      alert('파일 크기는 최대 20MB를 초과할 수 없습니다.')
      clearFile()
      return
    }
    selectedFile.value = file
  }
}

const clearFile = () => {
  selectedFile.value = null
  if (fileInputRef.value) {
    fileInputRef.value.value = ''
  }
}

const handleCreatePost = async () => {
  isSubmitting.value = true

  let fileUrl = ''
  let fileName = ''

  try {
    // 1. Handle file upload if a file is selected
    if (selectedFile.value) {
      isUploading.value = true
      uploadProgress.value = 0
      
      const file = selectedFile.value
      const path = `teachers/${Date.now()}_${file.name}`
      const fileRef = storageRef($firebaseStorage, path)
      
      const uploadTask = uploadBytesResumable(fileRef, file)
      
      await new Promise<void>((resolve, reject) => {
        uploadTask.on(
          'state_changed',
          (snapshot) => {
            const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100)
            uploadProgress.value = progress
          },
          (error) => {
            console.error('File upload error:', error)
            reject(error)
          },
          async () => {
            fileUrl = await getDownloadURL(uploadTask.snapshot.ref)
            fileName = file.name
            resolve()
          }
        )
      })
      isUploading.value = false
    }

    // 2. Create document in Firestore
    await addDoc(collection($firebaseDb, 'teachers_posts'), {
      title: newPost.value.title,
      content: newPost.value.content,
      attachmentUrl: fileUrl,
      attachmentName: fileName,
      authorName: userName.value,
      createdBy: currentUid.value,
      createdAt: new Date().toISOString()
    })

    // Reset Form
    newPost.value = { title: '', content: '' }
    clearFile()
    showCreateForm.value = false
    await fetchPosts()
  } catch (err) {
    console.error('Error creating post:', err)
    alert('게시글 등록에 실패했습니다.')
  } finally {
    isSubmitting.value = false
    isUploading.value = false
  }
}

const handleDeletePost = async (id: string, title: string) => {
  if (!confirm(`게시글 "${title}"을 완전히 삭제하시겠습니까?`)) {
    return
  }
  try {
    await deleteDoc(doc($firebaseDb, 'teachers_posts', id))
    await fetchPosts()
  } catch (err) {
    console.error('Error deleting teacher post:', err)
    alert('삭제 오류가 발생했습니다.')
  }
}

const navigateToDetail = (id: string) => {
  navigateTo(`/teachers-room/${id}`)
}

const formatDate = (dateStr: string) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return `${date.getFullYear()}.${date.getMonth() + 1}.${date.getDate()}`
}

const formatSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}
</script>

<style lang="scss" scoped>

.teachers-page {
  display: flex;
  flex-direction: column;
  gap: 28px;
}

.teachers-header {
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

.post-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.textarea-field {
  resize: vertical;
  min-height: 100px;
}

.file-upload-wrapper {
  display: flex;
  gap: 12px;
}

.file-input-hidden {
  display: none;
}

.file-upload-trigger {
  flex: 1;
  background-color: $bg-input;
  border: 1px dashed $border-color;
  border-radius: $radius-sm;
  padding: 12px 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  transition: $transition-smooth;

  &:hover {
    border-color: $primary;
    background: rgba(255, 255, 255, 0.01);
  }

  .upload-icon {
    width: 20px;
    height: 20px;
    color: $text-secondary;
  }

  .file-label {
    font-size: 0.9rem;
    color: $text-secondary;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.btn-clear-file {
  padding: 12px 16px;
  font-size: 0.9rem;
  border-style: dashed;
}

.file-hint {
  font-size: 0.75rem;
  color: $text-muted;
}

.upload-progress-container {
  display: flex;
  flex-direction: column;
  gap: 6px;
  background: rgba(255, 255, 255, 0.03);
  padding: 10px;
  border-radius: $radius-sm;
  border: 1px solid $border-color;

  .progress-bar {
    height: 6px;
    background: linear-gradient(90deg, $primary, $primary-hover);
    border-radius: 9999px;
    transition: width 0.2s ease;
  }

  .progress-text {
    font-size: 0.75rem;
    color: $primary;
    font-weight: 600;
  }
}

.form-actions {
  display: flex;
  justify-content: flex-end;
}

.post-card {
  display: flex;
  flex-direction: column;
  gap: 12px;
  cursor: pointer;
}

.post-meta {
  display: flex;
  justify-content: space-between;
  font-size: 0.8rem;
  color: $text-muted;
  font-weight: 500;
}

.post-title {
  font-size: 1.15rem;
  font-weight: 700;
  color: $text-primary;
}

.file-tag {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid $border-color;
  padding: 6px 12px;
  border-radius: $radius-sm;
  font-size: 0.85rem;
  color: $text-secondary;
  width: fit-content;
  max-width: 100%;

  .file-icon {
    width: 14px;
    height: 14px;
    color: $primary;
    flex-shrink: 0;
  }

  .file-name {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.post-card-footer {
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
