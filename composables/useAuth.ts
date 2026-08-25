import { computed, ref, watch } from 'vue'
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  type Auth,
  type User,
} from 'firebase/auth'
import { doc, getDoc, setDoc, type Firestore } from 'firebase/firestore'

export type UserRole = 'master' | 'vice_master' | 'teacher' | 'normal'
export type ApprovalStatus = 'pending' | 'approved' | 'rejected' | 'expelled'

export interface UserProfile {
  userId: string
  email: string
  name: string
  role: UserRole
  status: ApprovalStatus
  createdAt: string
  approvedAt?: string | null
  approvedBy?: string | null
}

const authUser = ref<User | null>(null)
const userProfile = ref<UserProfile | null>(null)
const isProfileLoading = ref(true)
const isAuthReady = ref(false)

let authListenerStarted = false
let authReadyPromise: Promise<void> | null = null
let resolveAuthReady: (() => void) | null = null

const normalizeIdentifier = (identifier: string) => identifier.trim().toLowerCase()

const identifierToEmail = (identifier: string) => {
  const normalized = normalizeIdentifier(identifier)
  return normalized.includes('@') ? normalized : `${normalized}@nalakh.local`
}

const emailToIdentifier = (email: string) => email.endsWith('@nalakh.local') ? email.replace('@nalakh.local', '') : email

const normalizeProfile = (data: Partial<UserProfile>, fallbackEmail: string): UserProfile => ({
  userId: data.userId || emailToIdentifier(data.email || fallbackEmail),
  email: data.email || fallbackEmail,
  name: data.name || '성도',
  role: data.role || 'normal',
  // Existing profiles created before the approval flow remain usable.
  status: data.status || 'approved',
  createdAt: data.createdAt || new Date().toISOString(),
  approvedAt: data.approvedAt ?? null,
  approvedBy: data.approvedBy ?? null,
})

const readProfile = async (db: Firestore, user: User) => {
  const snapshot = await getDoc(doc(db, 'users', user.uid))
  if (!snapshot.exists()) return null
  return normalizeProfile(snapshot.data() as Partial<UserProfile>, user.email || '')
}

export const useAuth = () => {
  const { $firebaseAuth, $firebaseDb } = useNuxtApp()
  const auth = $firebaseAuth as Auth | null
  const db = $firebaseDb as Firestore | null

  const startAuthListener = () => {
    if (!import.meta.client || authListenerStarted) return

    authListenerStarted = true
    authReadyPromise = new Promise<void>((resolve) => {
      resolveAuthReady = resolve
    })

    if (!auth || !db) {
      isProfileLoading.value = false
      isAuthReady.value = true
      resolveAuthReady?.()
      resolveAuthReady = null
      return
    }

    onAuthStateChanged(auth, async (user) => {
      isAuthReady.value = false
      authUser.value = user
      isProfileLoading.value = true

      try {
        userProfile.value = user ? await readProfile(db, user) : null
      } catch (error) {
        console.error('Failed to load member profile:', error)
        userProfile.value = null
      } finally {
        isProfileLoading.value = false
        isAuthReady.value = true
        resolveAuthReady?.()
        resolveAuthReady = null
      }
    })
  }

  startAuthListener()

  const waitForAuthReady = async () => {
    startAuthListener()
    if (authReadyPromise) await authReadyPromise
    if (isAuthReady.value) return

    await new Promise<void>((resolve) => {
      const stop = watch(isAuthReady, (ready) => {
        if (!ready) return
        stop()
        resolve()
      }, { immediate: true })
    })
  }

  const isAuthenticated = computed(() => !!authUser.value)
  const isApproved = computed(() => !!authUser.value && userProfile.value?.status === 'approved')
  const userRole = computed<UserRole>(() => userProfile.value?.role || 'normal')
  const userName = computed(() => userProfile.value?.name || '성도')
  const userEmail = computed(() => authUser.value?.email || '')
  const isMaster = computed(() => isApproved.value && userRole.value === 'master')
  const isAdmin = computed(() => isApproved.value && (userRole.value === 'master' || userRole.value === 'vice_master'))
  const isTeacher = computed(() => isApproved.value && (userRole.value === 'teacher' || userRole.value === 'vice_master' || userRole.value === 'master'))

  const waitForApprovedSession = async (timeoutMs = 6000) => {
    await waitForAuthReady()
    if (isApproved.value) return true
    if (!auth?.currentUser) return false

    return await new Promise<boolean>((resolve) => {
      let settled = false
      let timer: number | undefined
      let stop = () => {}
      const finish = (approved: boolean) => {
        if (settled) return
        settled = true
        if (timer !== undefined) window.clearTimeout(timer)
        stop()
        resolve(approved)
      }
      stop = watch([isApproved, isProfileLoading], ([approved, loading]) => {
        if (approved) finish(true)
        else if (!loading && !auth.currentUser) finish(false)
      })
      timer = window.setTimeout(() => finish(isApproved.value), timeoutMs)
      if (isApproved.value) finish(true)
    })
  }

  const runWithAuthRetry = async <T>(operation: () => Promise<T>) => {
    const approved = await waitForApprovedSession()
    if (!approved) {
      const error = new Error('승인된 로그인 상태가 준비되지 않았습니다.') as Error & { code: string }
      error.code = 'auth/session-not-ready'
      throw error
    }

    try {
      return await operation()
    } catch (error: any) {
      const isPermissionError = error?.code === 'permission-denied' || error?.code === 'firestore/permission-denied'
      if (!isPermissionError || !auth?.currentUser) throw error

      await auth.currentUser.getIdToken(true)
      await new Promise(resolve => window.setTimeout(resolve, 180))
      return await operation()
    }
  }

  const login = async (identifier: string, password: string) => {
    if (!auth || !db) throw new Error('Firebase 연결 설정을 확인해 주세요.')
    isAuthReady.value = false
    isProfileLoading.value = true

    try {
      const credential = await signInWithEmailAndPassword(auth, identifierToEmail(identifier), password)
      const profile = await readProfile(db, credential.user)

      if (!profile) {
        await signOut(auth)
        const error = new Error('등록된 회원 정보가 없습니다.') as Error & { code: string }
        error.code = 'auth/profile-not-found'
        throw error
      }

      if (profile.status !== 'approved') {
        await signOut(auth)
        const message = profile.status === 'pending'
          ? '마스터 계정의 가입 승인을 기다리고 있습니다.'
          : profile.status === 'expelled'
            ? '관리자에 의해 탈퇴 처리된 계정입니다.'
            : '승인되지 않은 계정입니다.'
        const error = new Error(message) as Error & { code: string }
        error.code = profile.status === 'pending'
          ? 'auth/pending-approval'
          : profile.status === 'expelled'
            ? 'auth/account-expelled'
            : 'auth/not-approved'
        throw error
      }

      authUser.value = credential.user
      userProfile.value = profile
      await credential.user.getIdToken()
      return credential
    } finally {
      isProfileLoading.value = false
      isAuthReady.value = true
    }
  }

  const register = async (userId: string, password: string, name: string) => {
    if (!auth || !db) throw new Error('Firebase 연결 설정을 확인해 주세요.')

    const normalizedId = normalizeIdentifier(userId)
    if (!/^[a-z0-9._-]{4,24}$/.test(normalizedId)) {
      const error = new Error('아이디는 영문 소문자, 숫자, 점, 밑줄, 하이픈을 사용해 4~24자로 입력해 주세요.') as Error & { code: string }
      error.code = 'auth/invalid-user-id'
      throw error
    }

    const credential = await createUserWithEmailAndPassword(auth, identifierToEmail(normalizedId), password)
    const now = new Date().toISOString()

    try {
      await setDoc(doc(db, 'users', credential.user.uid), {
        userId: normalizedId,
        email: credential.user.email || identifierToEmail(normalizedId),
        name: name.trim(),
        role: 'normal',
        status: 'pending',
        createdAt: now,
        approvedAt: null,
        approvedBy: null,
      } satisfies UserProfile)
    } finally {
      await signOut(auth)
    }
  }

  const logout = async () => {
    if (!auth) return
    await signOut(auth)
    authUser.value = null
    userProfile.value = null
  }

  return {
    user: authUser,
    profile: userProfile,
    isAuthReady,
    isProfileLoading,
    isAuthenticated,
    isApproved,
    userRole,
    userName,
    userEmail,
    isMaster,
    isAdmin,
    isTeacher,
    waitForAuthReady,
    waitForApprovedSession,
    runWithAuthRetry,
    login,
    register,
    logout,
    identifierToEmail,
  }
}
