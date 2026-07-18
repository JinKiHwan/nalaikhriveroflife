<template>
  <div class="admin-page">
    <div class="admin-header">
      <h1>시스템 관리자 백오피스</h1>
      <p class="subtitle">신규 유저 계정을 생성하고 권한 및 회원 목록을 관리합니다.</p>
    </div>

    <div class="admin-grid">
      <!-- Create User Card -->
      <section class="glass-card create-user-card">
        <h2>신규 회원 계정 생성</h2>
        <form @submit.prevent="handleCreateMember" class="admin-form">
          <div class="form-group">
            <label for="new-name">이름 (성함)</label>
            <input 
              id="new-name" 
              v-model="form.name" 
              type="text" 
              required 
              placeholder="홍길동"
              class="input-field"
              :disabled="isSubmitting"
            />
          </div>

          <div class="form-group">
            <label for="new-email">이메일 주소</label>
            <input 
              id="new-email" 
              v-model="form.email" 
              type="email" 
              required 
              placeholder="user@example.com"
              class="input-field"
              :disabled="isSubmitting"
            />
          </div>

          <div class="form-group">
            <label for="new-password">비밀번호</label>
            <input 
              id="new-password" 
              v-model="form.password" 
              type="password" 
              required 
              placeholder="최소 6자리 이상"
              class="input-field"
              :disabled="isSubmitting"
            />
          </div>

          <div class="form-group">
            <label for="new-role">회원 권한 등급</label>
            <select 
              id="new-role" 
              v-model="form.role" 
              class="input-field select-field"
              :disabled="isSubmitting"
            >
              <option value="normal">일반 성도 (Normal)</option>
              <option value="teacher">주일학교 교사 (Teacher)</option>
              <option value="master">시스템 관리자 (Master)</option>
            </select>
          </div>

          <div v-if="successMsg" class="success-alert">
            {{ successMsg }}
          </div>
          <div v-if="errorMsg" class="error-alert">
            {{ errorMsg }}
          </div>

          <button type="submit" class="btn btn-primary w-full" :disabled="isSubmitting">
            <span v-if="isSubmitting" class="spinner-sm"></span>
            <span v-else>계정 발급 및 등록</span>
          </button>
        </form>
      </section>

      <!-- Users List Card -->
      <section class="glass-card users-list-card">
        <h2>교회 회원 목록 ({{ users.length }}명)</h2>
        <div class="table-container">
          <table class="users-table">
            <thead>
              <tr>
                <th>이름</th>
                <th>이메일</th>
                <th>권한</th>
                <th>관리</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="u in users" :key="u.uid">
                <td class="td-name">{{ u.name }}</td>
                <td class="td-email">{{ u.email }}</td>
                <td>
                  <span :class="['badge', `badge-${u.role}`]">{{ roleLabel(u.role) }}</span>
                </td>
                <td>
                  <!-- Cannot delete self -->
                  <button 
                    v-if="u.email !== currentEmail" 
                    @click="handleDeleteUser(u.uid, u.name)"
                    class="btn-delete"
                    title="회원 삭제"
                  >
                    삭제
                  </button>
                  <span v-else class="self-tag">본인</span>
                </td>
              </tr>
              <tr v-if="users.length === 0">
                <td colspan="4" class="no-data">등록된 성도가 없습니다.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { collection, getDocs, doc, deleteDoc, query, orderBy } from 'firebase/firestore'

const { createMember, userEmail: currentEmail } = useAuth()
const { $firebaseDb } = useNuxtApp()

const users = ref<any[]>([])
const isSubmitting = ref(false)
const successMsg = ref('')
const errorMsg = ref('')

const form = ref({
  name: '',
  email: '',
  password: '',
  role: 'normal' as 'master' | 'teacher' | 'normal'
})

const roleLabel = (role: string) => {
  if (role === 'master') return '마스터'
  if (role === 'teacher') return '교사'
  return '성도'
}

const fetchUsers = async () => {
  if (!$firebaseDb) {
    console.warn('Firestore is not initialized. Please configure your .env file.')
    return
  }
  try {
    const q = query(collection($firebaseDb, 'users'), orderBy('createdAt', 'desc'))
    const snap = await getDocs(q)
    const list: any[] = []
    snap.forEach((d) => {
      list.push({
        uid: d.id,
        ...d.data()
      })
    })
    users.value = list
  } catch (err) {
    console.error('Error fetching users:', err)
  }
}

onMounted(() => {
  fetchUsers()
})

const handleCreateMember = async () => {
  isSubmitting.value = true
  successMsg.value = ''
  errorMsg.value = ''

  if (form.value.password.length < 6) {
    errorMsg.value = '비밀번호는 최소 6글자 이상이어야 합니다.'
    isSubmitting.value = false
    return
  }

  try {
    // Call the custom multi-app create account logic
    await createMember(
      form.value.email,
      form.value.password,
      form.value.name,
      form.value.role
    )

    successMsg.value = `${form.value.name} 성도의 계정이 성공적으로 등록되었습니다.`
    
    // Clear form
    form.value.name = ''
    form.value.email = ''
    form.value.password = ''
    form.value.role = 'normal'

    // Refresh users list
    await fetchUsers()
  } catch (err: any) {
    console.error('Error creating user:', err)
    if (err.code === 'auth/email-already-in-use') {
      errorMsg.value = '이미 등록된 이메일 주소입니다.'
    } else {
      errorMsg.value = err.message || '계정 등록 중 오류가 발생했습니다.'
    }
  } finally {
    isSubmitting.value = false
  }
}

const handleDeleteUser = async (uid: string, name: string) => {
  if (!confirm(`정말로 ${name} 성도의 계정 정보를 시스템에서 삭제하시겠습니까?\n(주의: 이 작업은 번복할 수 없으며 Firestore 프로필 데이터가 삭제됩니다. Firebase Auth 사용자 인증 목록에서도 수동으로 삭제해야 완전히 삭제됩니다.)`)) {
    return
  }

  try {
    // Delete user Firestore profile
    await deleteDoc(doc($firebaseDb, 'users', uid))
    alert(`${name} 성도의 정보가 삭제되었습니다.`)
    await fetchUsers()
  } catch (err) {
    console.error('Error deleting user profile:', err)
    alert('삭제 오류가 발생했습니다. 권한을 확인하세요.')
  }
}
</script>

<style lang="scss" scoped>

.admin-page {
  display: flex;
  flex-direction: column;
  gap: 28px;
}

.admin-header {
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

.admin-grid {
  display: grid;
  grid-template-columns: 420px 1fr;
  gap: 28px;

  @media (max-width: 950px) {
    grid-template-columns: 1fr;
  }
}

.create-user-card {
  height: fit-content;
  h2 {
    font-size: 1.25rem;
    margin-bottom: 20px;
    color: $primary;
    border-bottom: 1px solid $border-color;
    padding-bottom: 12px;
  }
}

.select-field {
  appearance: none;
  background-image: url("data:image/svg+xml;utf8,<svg fill='%2394a3b8' height='24' viewBox='0 0 24 24' width='24' xmlns='http://www.w3.org/2000/svg'><path d='M7 10l5 5 5-5z'/></svg>");
  background-repeat: no-repeat;
  background-position: right 12px center;
  padding-right: 40px;
}

.success-alert {
  background: rgba(16, 185, 129, 0.1);
  border: 1px solid rgba(16, 185, 129, 0.25);
  color: #34d399;
  padding: 12px;
  border-radius: $radius-sm;
  font-size: 0.85rem;
  margin-bottom: 16px;
}

.error-alert {
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.25);
  color: #f87171;
  padding: 12px;
  border-radius: $radius-sm;
  font-size: 0.85rem;
  margin-bottom: 16px;
}

.users-list-card {
  h2 {
    font-size: 1.25rem;
    margin-bottom: 20px;
    color: $text-primary;
    border-bottom: 1px solid $border-color;
    padding-bottom: 12px;
  }
}

.table-container {
  overflow-x: auto;
}

.users-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;

  th, td {
    padding: 14px 16px;
    font-size: 0.9rem;
    border-bottom: 1px solid $border-color;
  }

  th {
    font-weight: 600;
    color: $text-secondary;
    background: rgba(255, 255, 255, 0.02);
  }

  tr:hover {
    background: rgba(255, 255, 255, 0.01);
  }
}

.td-name {
  font-weight: 600;
  color: $text-primary;
}

.td-email {
  color: $text-secondary;
  font-family: monospace;
}

.btn-delete {
  background: transparent;
  border: 1px solid rgba(239, 68, 68, 0.3);
  color: #ef4444;
  padding: 6px 12px;
  border-radius: $radius-sm;
  font-size: 0.8rem;
  cursor: pointer;
  transition: $transition-smooth;

  &:hover {
    background: rgba(239, 68, 68, 0.1);
    border-color: #ef4444;
  }
}

.self-tag {
  font-size: 0.8rem;
  color: $text-muted;
  font-weight: 500;
}

.no-data {
  text-align: center;
  color: $text-muted;
  padding: 30px !important;
}

.spinner-sm {
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: #fff;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.w-full {
  width: 100%;
}
</style>
