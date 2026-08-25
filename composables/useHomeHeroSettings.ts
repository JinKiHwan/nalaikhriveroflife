import { doc, getDoc, setDoc, type Firestore } from 'firebase/firestore'

export interface HomeHeroSettings {
  verseKo: string
  verseMn: string
  referenceKo: string
  referenceMn: string
  imageId: string
}

export const DEFAULT_HOME_HERO: HomeHeroSettings = {
  verseKo: '“내가 주는 물을 마시는 자는 영원히 목마르지 아니하리니\n내가 주는 물은 그 속에서 영생하도록 솟아나는 샘물이 되리라.”',
  verseMn: '“Харин Миний өгөх уснаас уух хүн хэзээ ч цангахгүй.\nМиний өгөх ус түүнд мөнх амь өөд оргилох булгийн ус болно.”',
  referenceKo: '요한복음 4:14',
  referenceMn: 'Иохан 4:14',
  imageId: '',
}

const copyDefaults = () => ({ ...DEFAULT_HOME_HERO })

export const useHomeHeroSettings = () => {
  const { $firebaseDb } = useNuxtApp()
  const { user, runWithAuthRetry } = useAuth()
  const db = $firebaseDb as Firestore | null
  const heroSettings = useState<HomeHeroSettings>('home-hero-settings', copyDefaults)
  const isLoaded = useState('home-hero-settings-loaded', () => false)

  const normalize = (data: any): HomeHeroSettings => ({
    verseKo: String(data?.verseKo || DEFAULT_HOME_HERO.verseKo).trim(),
    verseMn: String(data?.verseMn || DEFAULT_HOME_HERO.verseMn).trim(),
    referenceKo: String(data?.referenceKo || DEFAULT_HOME_HERO.referenceKo).trim(),
    referenceMn: String(data?.referenceMn || DEFAULT_HOME_HERO.referenceMn).trim(),
    imageId: String(data?.imageId || '').trim(),
  })

  const loadHeroSettings = async (force = false) => {
    if (!db || (isLoaded.value && !force)) return heroSettings.value
    const snapshot = await runWithAuthRetry(() => getDoc(doc(db, 'settings', 'home_hero')))
    heroSettings.value = snapshot.exists() ? normalize(snapshot.data()) : copyDefaults()
    isLoaded.value = true
    return heroSettings.value
  }

  const saveHeroSettings = async (settings: HomeHeroSettings) => {
    if (!db || !user.value) throw new Error('로그인과 Firebase 연결 상태를 확인해 주세요.')
    const normalized = normalize(settings)
    if (!normalized.verseKo || !normalized.verseMn || !normalized.referenceKo || !normalized.referenceMn) {
      throw new Error('몽골어와 한국어 말씀 및 구절 표기를 모두 입력해 주세요.')
    }
    await setDoc(doc(db, 'settings', 'home_hero'), {
      ...normalized,
      updatedAt: new Date().toISOString(),
      updatedBy: user.value.uid,
    })
    heroSettings.value = normalized
    isLoaded.value = true
  }

  return { heroSettings, loadHeroSettings, saveHeroSettings }
}
