import { ref, computed } from 'vue'
import { 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  type User
} from 'firebase/auth'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { initializeApp, deleteApp } from 'firebase/app'
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth'

export interface UserProfile {
  email: string
  name: string
  role: 'master' | 'teacher' | 'normal'
  createdAt: string
}

// Module-level state to share across components and page navigations
const authUser = ref<User | null>(null)
const userProfile = ref<UserProfile | null>(null)
const isProfileLoading = ref(true)

export const useAuth = () => {
  const { $firebaseAuth, $firebaseDb } = useNuxtApp()

  // Setup auth state listener if not already initialized
  if (process.client && $firebaseAuth && $firebaseDb) {
    onAuthStateChanged($firebaseAuth as any, async (user) => {
      authUser.value = user
      if (user) {
        isProfileLoading.value = true
        try {
          const docRef = doc($firebaseDb as any, 'users', user.uid)
          const docSnap = await getDoc(docRef)
          if (docSnap.exists()) {
            userProfile.value = docSnap.data() as UserProfile
          } else {
            // Fallback for bootstrap / missing Firestore profile
            userProfile.value = {
              email: user.email || '',
              name: 'No Name',
              role: 'normal',
              createdAt: new Date().toISOString()
            }
          }
        } catch (error) {
          console.error('Error fetching user profile:', error)
          userProfile.value = null
        } finally {
          isProfileLoading.value = false
        }
      } else {
        userProfile.value = null
        isProfileLoading.value = false
      }
    })
  } else {
    // If not client or not initialized
    isProfileLoading.value = false
  }

  const isAuthenticated = computed(() => !!authUser.value)
  const userRole = computed(() => userProfile.value?.role || 'normal')
  const userName = computed(() => userProfile.value?.name || '성도')
  const userEmail = computed(() => authUser.value?.email || '')
  const isMaster = computed(() => userRole.value === 'master')
  const isTeacher = computed(() => userRole.value === 'teacher' || userRole.value === 'master')

  const login = async (email: string, pass: string) => {
    if (!$firebaseAuth) {
      throw new Error('Firebase가 초기화되지 않았습니다. 로컬 환경 변수(.env) 설정을 확인해 주세요.')
    }
    return signInWithEmailAndPassword($firebaseAuth as any, email, pass)
  }

  const logout = async () => {
    if (!$firebaseAuth) return
    return signOut($firebaseAuth as any)
  }

  // Master command to create other users without signing out of their admin session
  const createMember = async (email: string, pass: string, name: string, role: 'master' | 'teacher' | 'normal') => {
    if (!isMaster.value) {
      throw new Error('Only Master administrators can create accounts.')
    }

    const config = useRuntimeConfig()
    if (!config.public.firebaseApiKey || !config.public.firebaseProjectId) {
      throw new Error('Firebase configuration keys are missing in Nuxt runtime config.')
    }

    const firebaseConfig = {
      apiKey: config.public.firebaseApiKey,
      authDomain: config.public.firebaseAuthDomain,
      projectId: config.public.firebaseProjectId,
      storageBucket: config.public.firebaseStorageBucket,
      messagingSenderId: config.public.firebaseMessagingSenderId,
      appId: config.public.firebaseAppId
    }

    // Initialize temporary app
    const tempAppName = `tempApp_${Date.now()}`
    const tempApp = initializeApp(firebaseConfig, tempAppName)
    const tempAuth = getAuth(tempApp)

    try {
      // 1. Create Auth user
      const userCredential = await createUserWithEmailAndPassword(tempAuth, email, pass)
      const newUid = userCredential.user.uid

      // 2. Write Profile in Firestore using the default app database
      if (!$firebaseDb) {
        throw new Error('Firestore connection is not active.')
      }
      const userDocRef = doc($firebaseDb as any, 'users', newUid)
      const newProfile: UserProfile = {
        email,
        name,
        role,
        createdAt: new Date().toISOString()
      }
      await setDoc(userDocRef, newProfile)
      return { success: true, uid: newUid }
    } catch (error: any) {
      console.error('Error in createMember composable:', error)
      throw error
    } finally {
      // 3. Clean up the temporary App instance
      await deleteApp(tempApp)
    }
  }

  return {
    user: authUser,
    profile: userProfile,
    isProfileLoading,
    isAuthenticated,
    userRole,
    userName,
    userEmail,
    isMaster,
    isTeacher,
    login,
    logout,
    createMember
  }
}
