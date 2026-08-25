import { initializeApp } from 'firebase/app'
import { browserLocalPersistence, getAuth, setPersistence } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

export default defineNuxtPlugin(async (nuxtApp) => {
  const config = useRuntimeConfig()

  const firebaseConfig = {
    apiKey: config.public.firebaseApiKey,
    authDomain: config.public.firebaseAuthDomain,
    projectId: config.public.firebaseProjectId,
    storageBucket: config.public.firebaseStorageBucket,
    messagingSenderId: config.public.firebaseMessagingSenderId,
    appId: config.public.firebaseAppId
  }

  // Safely check if variables are provided
  const hasConfig = !!(firebaseConfig.apiKey && firebaseConfig.projectId)

  let app = null
  let auth = null
  let db = null
  let storage = null

  if (hasConfig) {
    try {
      app = initializeApp(firebaseConfig)
      auth = getAuth(app)
      await setPersistence(auth, browserLocalPersistence)
      db = getFirestore(app)
      storage = getStorage(app)
    } catch (error) {
      console.error('Firebase initialization failed:', error)
    }
  } else {
    console.warn(
      'Firebase environment configuration is missing. ' +
      'Please verify NUXT_PUBLIC_FIREBASE_API_KEY, NUXT_PUBLIC_FIREBASE_PROJECT_ID, etc. in your .env file.'
    )
  }

  return {
    provide: {
      firebaseApp: app,
      firebaseAuth: auth,
      firebaseDb: db,
      firebaseStorage: storage
    }
  }
})
