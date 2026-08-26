import { doc, getDoc, setDoc, type Firestore } from 'firebase/firestore'

export interface SermonCategory {
  id: string
  nameKo: string
  nameMn: string
  time: string
}

export const DEFAULT_SERMON_CATEGORIES: SermonCategory[] = [
  { id: 'sunday', nameKo: '주일예배', nameMn: 'Ням гарагийн мөргөл', time: '11:00' },
  { id: 'wednesday', nameKo: '수요예배', nameMn: 'Лхагва гарагийн мөргөл', time: '19:00' },
  { id: 'friday', nameKo: '금요예배', nameMn: 'Баасан гарагийн мөргөл', time: '' },
]

const copyDefaults = () => DEFAULT_SERMON_CATEGORIES.map(item => ({ ...item }))

export const useSermonCategories = () => {
  const { $firebaseDb } = useNuxtApp()
  const { user, runWithAuthRetry } = useAuth()
  const db = $firebaseDb as Firestore | null
  const categories = useState<SermonCategory[]>('sermon-categories', copyDefaults)
  const isLoaded = useState('sermon-categories-loaded', () => false)

  const normalize = (items: unknown): SermonCategory[] => {
    if (!Array.isArray(items)) return []
    return items
      .map((item: any) => ({
        id: String(item?.id || '').trim(),
        nameKo: String(item?.nameKo || '').trim(),
        nameMn: String(item?.nameMn || '').trim(),
        time: String(item?.time || '').trim(),
      }))
      .filter(item => item.id && item.nameKo && item.nameMn)
  }

  const loadCategories = async (force = false) => {
    if (!db || (isLoaded.value && !force)) return categories.value
    const snapshot = await runWithAuthRetry(() => getDoc(doc(db, 'settings', 'sermon_categories')))
    const saved = snapshot.exists() ? normalize(snapshot.data().items) : []
    categories.value = saved.length ? saved : copyDefaults()
    isLoaded.value = true
    return categories.value
  }

  const saveCategories = async (items: SermonCategory[]) => {
    if (!db || !user.value) throw new Error('로그인과 Firebase 연결 상태를 확인해 주세요.')
    const normalized = normalize(items)
    if (!normalized.length) throw new Error('예배 구분을 한 개 이상 등록해 주세요.')
    await setDoc(doc(db, 'settings', 'sermon_categories'), {
      items: normalized,
      updatedAt: new Date().toISOString(),
      updatedBy: user.value.uid,
    })
    categories.value = normalized
    isLoaded.value = true
  }

  return { categories, loadCategories, saveCategories }
}
