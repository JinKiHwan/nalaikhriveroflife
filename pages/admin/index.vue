<template>
  <div class="admin-page">
    <header class="admin-header">
      <div>
        <span>MEMBER MANAGEMENT</span>
        <h1>{{ t('admin.title') }}</h1>
        <p>{{ t('admin.subtitle') }}</p>
      </div>
      <button type="button" class="refresh-button" :disabled="isLoading" @click="fetchUsers">{{ t('admin.refresh') }}</button>
    </header>

    <div class="admin-stats">
      <div class="pending-stat"><span>{{ t('admin.pending') }}</span><strong>{{ pendingUsers.length }}</strong></div>
      <div><span>{{ t('admin.currentMembers') }}</span><strong>{{ approvedUsers.length }}</strong></div>
    </div>

    <p v-if="actionError" class="action-alert">{{ actionError }}</p>

    <section class="admin-section pending-section">
      <div class="section-title"><h2>{{ t('admin.pendingTitle') }}</h2><span>{{ pendingUsers.length }}{{ t('admin.people') }}</span></div>
      <div v-if="pendingUsers.length" class="pending-list">
        <article v-for="member in pendingUsers" :key="member.uid" class="pending-card">
          <div class="member-avatar">{{ member.name?.slice(0, 1) || '?' }}</div>
          <div class="member-copy">
            <strong>{{ member.name }}</strong>
            <span>@{{ member.userId || member.email }}</span>
            <time>{{ formatDate(member.createdAt) }} {{ t('admin.requested') }}</time>
          </div>
          <div class="pending-actions">
            <button type="button" class="approve-button" :disabled="isMemberProcessing(member.uid)" @click="approveMember(member)">
              <span class="approval-spark" aria-hidden="true">✦</span>
              {{ approvingId === member.uid ? t('admin.approving') : t('admin.approve') }}
            </button>
            <button type="button" class="reject-button" :disabled="isMemberProcessing(member.uid)" @click="rejectMember(member)">
              {{ rejectingId === member.uid ? t('admin.rejecting') : t('admin.reject') }}
            </button>
          </div>
        </article>
      </div>
      <p v-else class="empty-state">{{ t('admin.noPending') }}</p>
    </section>

    <section class="admin-section">
      <div class="section-title"><h2>{{ t('admin.currentMembers') }}</h2><span>{{ approvedUsers.length }}{{ t('admin.people') }}</span></div>
      <div class="member-table-wrap">
        <table class="member-table">
          <thead>
            <tr><th>{{ t('admin.name') }}</th><th>{{ t('admin.identifier') }}</th><th>{{ t('admin.role') }}</th><th>{{ t('admin.joinedAt') }}</th><th>{{ t('admin.manage') }}</th></tr>
          </thead>
          <tbody>
            <tr v-for="member in approvedUsers" :key="member.uid">
              <td><strong>{{ member.name }}</strong><small v-if="member.uid === user?.uid">{{ t('admin.self') }}</small></td>
              <td>@{{ member.userId || member.email }}</td>
              <td>
                <span v-if="!isMaster || member.uid === user?.uid || member.role === 'master'" :class="['role-badge', member.role]">{{ roleLabel(member.role) }}</span>
                <div v-else class="role-control">
                  <select :value="member.role || 'normal'" :disabled="changingRoleId === member.uid" :aria-label="`${member.name} ${t('admin.role')}`" @change="changeMemberRole(member, $event)">
                    <option v-for="role in assignableRoleOptions" :key="role.value" :value="role.value">{{ role.label }}</option>
                  </select>
                  <small v-if="changingRoleId === member.uid">{{ t('admin.roleUpdating') }}</small>
                </div>
              </td>
              <td>{{ formatDate(member.createdAt) }}</td>
              <td>
                <button
                  v-if="canExpel(member)"
                  type="button"
                  class="expel-button"
                  :disabled="isMemberProcessing(member.uid)"
                  @click="expelMember(member)"
                >{{ expellingId === member.uid ? t('admin.expelling') : t('admin.expel') }}</button>
                <span v-else class="manage-unavailable">—</span>
              </td>
            </tr>
            <tr v-if="!approvedUsers.length"><td colspan="5" class="empty-cell">{{ t('admin.noMembers') }}</td></tr>
          </tbody>
        </table>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { collection, doc, getDocs, orderBy, query, updateDoc } from 'firebase/firestore'
import type { UserRole } from '~/composables/useAuth'

definePageMeta({ layout: 'admin' })

const { user, isMaster, userRole } = useAuth()
const { language, t } = useLanguage()
const { $firebaseDb } = useNuxtApp()
const users = ref<any[]>([])
const isLoading = ref(false)
const approvingId = ref('')
const rejectingId = ref('')
const expellingId = ref('')
const changingRoleId = ref('')
const actionError = ref('')

const pendingUsers = computed(() => users.value.filter(member => member.status === 'pending'))
const approvedUsers = computed(() => users.value.filter(member => member.status === 'approved' || !member.status))
const roleOptions = computed<{ value: UserRole; label: string }[]>(() => [
  { value: 'master', label: t('role.master') },
  { value: 'vice_master', label: t('role.viceMaster') },
  { value: 'teacher', label: t('role.teacher') },
  { value: 'normal', label: t('role.normal') },
])
const assignableRoleOptions = computed(() => roleOptions.value.filter(role => role.value !== 'master'))

const fetchUsers = async () => {
  if (!$firebaseDb) return
  isLoading.value = true
  actionError.value = ''
  try {
    const snapshot = await getDocs(query(collection($firebaseDb, 'users'), orderBy('createdAt', 'desc')))
    users.value = snapshot.docs.map(item => ({ uid: item.id, ...item.data() }))
  } catch (error: any) {
    actionError.value = error.message || '회원 정보를 불러오지 못했습니다.'
  } finally {
    isLoading.value = false
  }
}

const isMemberProcessing = (uid: string) => approvingId.value === uid || rejectingId.value === uid || expellingId.value === uid || changingRoleId.value === uid

const approveMember = async (member: any) => {
  if (!$firebaseDb || !user.value) return
  const message = language.value === 'mn' ? `${member.name} гишүүний бүртгэлийг зөвшөөрөх үү?` : `${member.name} 회원의 가입을 승인할까요?`
  if (!confirm(message)) return
  approvingId.value = member.uid
  actionError.value = ''
  try {
    await updateDoc(doc($firebaseDb, 'users', member.uid), {
      status: 'approved', approvedAt: new Date().toISOString(), approvedBy: user.value.uid, rejectedAt: null, rejectedBy: null,
    })
    await fetchUsers()
  } catch (error: any) {
    actionError.value = error.message || '가입 승인 중 오류가 발생했습니다.'
  } finally {
    approvingId.value = ''
  }
}

const rejectMember = async (member: any) => {
  if (!$firebaseDb || !user.value) return
  const message = language.value === 'mn' ? `${member.name} гишүүний бүртгэлийн хүсэлтээс татгалзах уу?` : `${member.name} 회원의 가입 요청을 거절할까요?`
  if (!confirm(message)) return
  rejectingId.value = member.uid
  actionError.value = ''
  try {
    await updateDoc(doc($firebaseDb, 'users', member.uid), {
      status: 'rejected', rejectedAt: new Date().toISOString(), rejectedBy: user.value.uid,
    })
    await fetchUsers()
  } catch (error: any) {
    actionError.value = error.message || '가입 거절 처리 중 오류가 발생했습니다.'
  } finally {
    rejectingId.value = ''
  }
}

const canExpel = (member: any) => {
  if (!user.value || member.uid === user.value.uid) return false
  if (isMaster.value) return true
  return userRole.value === 'vice_master' && (member.role === 'normal' || member.role === 'teacher')
}

const expelMember = async (member: any) => {
  if (!$firebaseDb || !user.value || !canExpel(member)) return
  const message = language.value === 'mn'
    ? `${member.name} гишүүнийг чуулганы гишүүнээс хасах уу? Энэ бүртгэл дахин нэвтрэх боломжгүй болно.`
    : `${member.name} 회원을 강제탈퇴 처리할까요? 처리 후에는 해당 아이디로 다시 로그인할 수 없습니다.`
  if (!confirm(message)) return
  expellingId.value = member.uid
  actionError.value = ''
  try {
    await updateDoc(doc($firebaseDb, 'users', member.uid), {
      status: 'expelled',
      expelledAt: new Date().toISOString(),
      expelledBy: user.value.uid,
    })
    await fetchUsers()
  } catch (error: any) {
    actionError.value = error.message || (language.value === 'mn' ? 'Гишүүнийг хасах үед алдаа гарлаа.' : '회원 탈퇴 처리 중 오류가 발생했습니다.')
  } finally {
    expellingId.value = ''
  }
}

const changeMemberRole = async (member: any, event: Event) => {
  if (!$firebaseDb || !user.value || !isMaster.value || member.uid === user.value.uid || member.role === 'master') return
  const target = event.target as HTMLSelectElement
  const previousRole = (member.role || 'normal') as UserRole
  const nextRole = target.value as UserRole
  if (nextRole === 'master') { target.value = previousRole; return }
  if (previousRole === nextRole) return
  const nextRoleLabel = roleOptions.value.find(role => role.value === nextRole)?.label || nextRole
  const message = language.value === 'mn' ? `${member.name} гишүүний эрхийг “${nextRoleLabel}” болгон өөрчлөх үү?` : `${member.name} 회원의 권한을 '${nextRoleLabel}'(으)로 변경할까요?`
  if (!confirm(message)) { target.value = previousRole; return }
  changingRoleId.value = member.uid
  actionError.value = ''
  try {
    await updateDoc(doc($firebaseDb, 'users', member.uid), {
      role: nextRole, roleUpdatedAt: new Date().toISOString(), roleUpdatedBy: user.value.uid,
    })
    member.role = nextRole
  } catch (error: any) {
    target.value = previousRole
    actionError.value = error.message || '회원 권한 변경 중 오류가 발생했습니다.'
  } finally {
    changingRoleId.value = ''
  }
}

const roleLabel = (role: UserRole) => roleOptions.value.find(option => option.value === role)?.label || t('role.normal')
const formatDate = (value: string) => value ? new Date(value).toLocaleDateString(language.value === 'mn' ? 'mn-MN' : 'ko-KR') : '-'

onMounted(fetchUsers)
</script>

<style lang="scss" scoped>
.admin-page { width: min(1180px, 100%); min-height: 100%; margin: 0 auto; padding: 50px 0 88px; }
.admin-header { display: flex; justify-content: space-between; align-items: flex-end; gap: 24px; margin-bottom: 28px; padding-bottom: 22px; border-bottom: 1px solid #e3e6e3; }
.admin-header span { color: #929793; font-size: 13px; font-weight: 800; letter-spacing: .1em; }
.admin-header h1 { margin: 7px 0 5px; font-size: 42px; }
.admin-header p { color: $text-secondary; font-size: 18px; }
.refresh-button { height: 40px; padding: 0 16px; color: #fff; background: #16815d; border: 1px solid #16815d; border-radius: 6px; cursor: pointer; font-size: 13px; font-weight: 700; }
.refresh-button:hover { background: #116b4d; border-color: #116b4d; }
.refresh-button:disabled { opacity: .55; }
.admin-stats { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; margin-bottom: 28px; }
.admin-stats > div { display: flex; align-items: center; justify-content: space-between; padding: 20px 24px; background: #fff; border: 1px solid #e3e6e3; border-radius: 8px; }
.admin-stats span { font-size: 18px; font-weight: 700; }
.admin-stats strong { color: #2f332f; font-size: 32px; }
.pending-stat { color: #2f332f; background: #fff !important; border: 1px solid #e3e6e3 !important; }
.pending-stat strong { color: #2f332f; }
.action-alert { margin-bottom: 18px; padding: 13px 16px; color: #713f3a; background: #fff3f1; border: 1px solid #efd0cc; font-size: 13px; }
.admin-section { margin-top: 24px; padding: 28px; background: #fff; border: 1px solid #e3e6e3; border-radius: 10px; box-shadow: none; }
.section-title { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; padding-bottom: 14px; border-bottom: 1px solid $border-color; }
.section-title h2 { font-size: 26px; }
.section-title > span { color: $text-muted; font-size: 13px; }
.pending-section { padding: 0 22px 24px; overflow: hidden; background: #fff; border: 1px solid #e3e6e3; box-shadow: none; }
.pending-section .section-title { margin: 0 -22px 22px; padding: 18px 22px; color: #2e322f; background: #fafbfa; border: 0; border-bottom: 1px solid #e8eae8; }
.pending-section .section-title h2 { color: #2e322f; }
.pending-section .section-title > span { min-width: 46px; padding: 5px 11px; color: #676c68; background: #fff; border: 1px solid #dfe3e0; border-radius: 999px; text-align: center; font-weight: 800; }
.pending-list { display: flex; flex-direction: column; gap: 12px; }
.pending-card { display: grid; grid-template-columns: 50px minmax(0, 1fr) auto; align-items: center; gap: 16px; padding: 18px; background: #fff; border: 1px solid #e3e6e3; border-radius: 8px; box-shadow: none; }
.member-avatar { width: 50px; height: 50px; display: grid; place-items: center; color: #137352; background: #e7f3ed; border-radius: 50%; font-size: 20px; font-weight: 800; }
.member-copy { display: flex; flex-direction: column; }
.member-copy strong { color: #303430; font-size: 20px; }
.member-copy span { color: #707571; }
.member-copy time { color: #9aa09b; }
.member-copy span, .member-copy time { font-size: 13px; }
.pending-actions { display: flex; align-items: center; gap: 8px; }
.approve-button, .reject-button { position: relative; min-width: 104px; height: 42px; padding: 0 15px; border: 0; cursor: pointer; font-size: 13px; font-weight: 800; }
.approve-button { overflow: visible; color: #fff; background: #16815d; border-radius: 6px; animation: approval-pulse 2.1s ease-in-out infinite; }
.approve-button:hover { background: #116b4d; animation: none; box-shadow: 0 0 0 4px rgba(#16815d, .13); }
.approval-spark { position: absolute; top: -9px; right: -5px; color: #16815d; font-size: 16px; animation: approval-spark 2.1s ease-in-out infinite; }
.reject-button { color: #5f6460; background: #fff; border: 1px solid #d4d8d5; border-radius: 6px; }
.reject-button:hover { color: #28352f; background: #eef1ef; border-color: #829088; }
.approve-button:disabled, .reject-button:disabled { cursor: wait; opacity: .55; animation: none; }
.empty-state { padding: 42px 16px; color: #747975; background: #fff; border: 1px dashed #d8dcda; text-align: center; font-size: 18px; }
@keyframes approval-pulse { 0%, 100% { box-shadow: 0 0 0 0 rgba(#16815d, .05), 0 5px 12px rgba(#16815d, .08); } 50% { box-shadow: 0 0 0 6px rgba(#16815d, .12), 0 8px 18px rgba(#16815d, .14); } }
@keyframes approval-spark { 0%, 35%, 100% { opacity: 0; transform: scale(.65) rotate(0); } 55% { opacity: 1; transform: scale(1.1) rotate(24deg); } 75% { opacity: .45; transform: scale(.85) rotate(46deg); } }
.member-table-wrap { overflow-x: auto; }
.member-table { width: 100%; border-collapse: collapse; }
.member-table th, .member-table td { padding: 15px 12px; border-bottom: 1px solid #e1e8e3; text-align: left; font-size: 13px; }
.member-table th { color: #6f7470; background: #f7f8f7; }
.member-table td:first-child strong { font-size: 18px; }
.member-table td:first-child small { margin-left: 8px; color: #7b817d; font-weight: 700; }
.role-control { display: flex; align-items: center; gap: 8px; }
.role-control select { min-width: 132px; height: 38px; padding: 0 30px 0 11px; color: #4d4943; background: #fff; border: 1px solid #c8c2b9; border-radius: 6px; cursor: pointer; font-family: $font-body; font-size: 13px; font-weight: 700; }
.role-control select:focus { outline: 2px solid rgba(#16815d, .18); border-color: #16815d; }
.role-control select:disabled { cursor: wait; opacity: .58; }
.role-control small { color: $text-muted; white-space: nowrap; }
.role-badge { display: inline-block; padding: 5px 10px; color: #fff; background: #938e86; font-weight: 800; }
.role-badge.master { background: #4e5450; }
.role-badge.vice_master { background: #6e7772; }
.role-badge.teacher { background: #919894; }
.expel-button { min-width: 88px; height: 36px; padding: 0 12px; color: #9b3e36; background: #fff; border: 1px solid #d9a8a3; border-radius: 5px; cursor: pointer; font-family: $font-body; font-size: 13px; font-weight: 800; white-space: nowrap; }
.expel-button:hover { color: #fff; background: #9b3e36; border-color: #9b3e36; }
.expel-button:disabled { cursor: wait; opacity: .5; }
.manage-unavailable { color: #a8b1ac; }
.empty-cell { padding: 38px !important; color: $text-muted; text-align: center !important; }
@media (max-width: 760px) { .admin-page { width: 100%; padding-top: 34px; } .admin-header { align-items: flex-start; flex-direction: column; } .admin-header h1 { font-size: 36px; } .admin-stats { grid-template-columns: 1fr; } .pending-card { grid-template-columns: 44px 1fr; } .member-avatar { width: 44px; height: 44px; } .pending-actions { grid-column: 1 / -1; display: grid; grid-template-columns: 1fr .7fr; } .approve-button, .reject-button { width: 100%; } .admin-section { padding: 20px 16px; } .pending-section { padding: 0 14px 18px; } .pending-section .section-title { margin: 0 -14px 18px; padding: 16px 14px; } }
@media (prefers-reduced-motion: reduce) { .approve-button, .approval-spark { animation: none; } }
</style>
