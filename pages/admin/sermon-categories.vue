<template>
  <div class="categories-admin-page">
    <header class="admin-header">
      <div>
        <span>WORSHIP CATEGORY SETTINGS</span>
        <h1>{{ t('admin.sermonCategoriesTitle') }}</h1>
        <p>{{ t('admin.sermonCategoriesSubtitle') }}</p>
      </div>
      <button type="button" class="save-button" :disabled="isSaving || isLoading" @click="save">
        {{ isSaving ? (language === 'mn' ? 'Хадгалж байна...' : '저장 중...') : (language === 'mn' ? 'Хадгалах' : '변경사항 저장') }}
      </button>
    </header>

    <p v-if="message" :class="['message', { error: hasError }]">{{ message }}</p>

    <section class="category-card">
      <div class="card-heading">
        <div>
          <h2>{{ language === 'mn' ? 'Мөргөлийн төрлийн жагсаалт' : '예배 구분 목록' }}</h2>
          <p>{{ language === 'mn' ? 'Дараалал нь номлол бичих сонголтын дараалалтай ижил байна.' : '아래 순서대로 말씀 작성 선택란에 표시됩니다.' }}</p>
        </div>
        <button type="button" class="add-button" @click="addCategory">＋ {{ language === 'mn' ? 'Төрөл нэмэх' : '예배 구분 추가' }}</button>
      </div>

      <div v-if="isLoading" class="empty-state">{{ language === 'mn' ? 'Уншиж байна...' : '불러오는 중...' }}</div>
      <div v-else class="category-list">
        <div class="category-head"><span>NO.</span><span>한국어</span><span>Монгол хэл</span><span>{{ language === 'mn' ? 'Цаг' : '예배 시간' }}</span><span></span></div>
        <div v-for="(category, index) in draftCategories" :key="category.id" class="category-row">
          <span class="order-number">{{ String(index + 1).padStart(2, '0') }}</span>
          <label>
            <span class="mobile-label">한국어</span>
            <input v-model.trim="category.nameKo" class="category-input" placeholder="예: 주일예배" />
          </label>
          <label>
            <span class="mobile-label">Монгол хэл</span>
            <input v-model.trim="category.nameMn" class="category-input" placeholder="Жишээ: Ням гарагийн мөргөл" />
          </label>
          <label>
            <span class="mobile-label">{{ language === 'mn' ? 'Мөргөлийн цаг' : '예배 시간' }}</span>
            <input v-model="category.time" type="time" step="300" class="category-input category-time-input" />
          </label>
          <button type="button" class="remove-button" :disabled="draftCategories.length === 1" @click="removeCategory(index)">
            {{ language === 'mn' ? 'Устгах' : '삭제' }}
          </button>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import type { SermonCategory } from '~/composables/useSermonCategories'

definePageMeta({ layout: 'admin' })

const { language, t } = useLanguage()
const { categories, loadCategories, saveCategories } = useSermonCategories()
const draftCategories = ref<SermonCategory[]>([])
const isLoading = ref(true)
const isSaving = ref(false)
const message = ref('')
const hasError = ref(false)

const cloneCategories = () => categories.value.map(item => ({ ...item }))

const load = async () => {
  isLoading.value = true
  message.value = ''
  try {
    await loadCategories(true)
    draftCategories.value = cloneCategories()
  } catch (error: any) {
    hasError.value = true
    message.value = error.message || (language.value === 'mn' ? 'Мэдээллийг уншиж чадсангүй.' : '예배 구분을 불러오지 못했습니다.')
  } finally {
    isLoading.value = false
  }
}

const addCategory = () => {
  draftCategories.value.push({
    id: `worship-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    nameKo: '',
    nameMn: '',
    time: '',
  })
  nextTick(() => document.querySelector<HTMLInputElement>('.category-row:last-child input')?.focus())
}

const removeCategory = (index: number) => {
  if (draftCategories.value.length === 1) return
  draftCategories.value.splice(index, 1)
  message.value = ''
}

const save = async () => {
  message.value = ''
  hasError.value = false
  if (draftCategories.value.some(item => !item.nameKo.trim() || !item.nameMn.trim() || !item.time.trim())) {
    hasError.value = true
    message.value = language.value === 'mn' ? 'Мөргөл бүрийн солонгос, монгол нэр болон цагийг оруулна уу.' : '모든 예배 구분의 한국어·몽골어 명칭과 예배 시간을 입력해 주세요.'
    return
  }
  isSaving.value = true
  try {
    await saveCategories(draftCategories.value)
    draftCategories.value = cloneCategories()
    message.value = language.value === 'mn' ? 'Мөргөлийн төрлийг хадгаллаа.' : '예배 구분을 저장했습니다.'
  } catch (error: any) {
    hasError.value = true
    message.value = error.message || (language.value === 'mn' ? 'Хадгалж чадсангүй.' : '예배 구분을 저장하지 못했습니다.')
  } finally {
    isSaving.value = false
  }
}

onMounted(load)
</script>

<style lang="scss" scoped>
.categories-admin-page { width: min(1120px, 100%); min-height: 100%; margin: 0 auto; padding: 50px 0 88px; }
.admin-header { display: flex; align-items: flex-end; justify-content: space-between; gap: 24px; margin-bottom: 28px; padding-bottom: 22px; border-bottom: 1px solid #e3e6e3; }
.admin-header > div > span { color: #929793; font-size: 13px; font-weight: 800; letter-spacing: .1em; }
.admin-header h1 { margin: 7px 0 5px; font-size: 42px; }
.admin-header p { color: $text-secondary; font-size: 18px; }
.save-button, .add-button { height: 40px; padding: 0 16px; color: #fff; background: #16815d; border: 1px solid #16815d; border-radius: 6px; cursor: pointer; font-family: $font-body; font-size: 13px; font-weight: 800; }
.save-button:hover, .add-button:hover { background: #116b4d; border-color: #116b4d; }
.save-button:disabled { cursor: wait; opacity: .55; }
.message { margin-bottom: 18px; padding: 13px 16px; color: #17654b; background: #edf8f3; border: 1px solid #c9e4d8; font-size: 13px; }
.message.error { color: #813d37; background: #fff3f1; border-color: #efd0cc; }
.category-card { padding: 28px; background: #fff; border: 1px solid #e3e6e3; border-radius: 10px; }
.card-heading { display: flex; align-items: flex-end; justify-content: space-between; gap: 20px; margin-bottom: 22px; padding-bottom: 18px; border-bottom: 1px solid #e3e6e3; }
.card-heading h2 { margin-bottom: 5px; font-size: 26px; }
.card-heading p { color: #7b827d; font-size: 13px; }
.category-list { overflow-x: auto; }
.category-head, .category-row { min-width: 760px; display: grid; grid-template-columns: 62px minmax(180px,1fr) minmax(180px,1fr) 140px 70px; gap: 14px; align-items: center; }
.category-head { padding: 0 12px 10px; color: #858b87; font-size: 13px; font-weight: 800; }
.category-row { min-height: 70px; padding: 12px; border-top: 1px solid #e8ebe9; }
.category-row:first-of-type { border-top-color: #d8dedb; }
.order-number { color: #9a9f9b; font-size: 13px; font-weight: 800; }
.category-input { width: 100%; height: 44px; padding: 0 13px; color: #303632; background: #fff; border: 1px solid #d5dcd7; border-radius: 5px; font-family: $font-body; font-size: 18px; }
.category-input:focus { outline: 2px solid rgba(#16815d,.15); border-color: #72aa94; }
.category-time-input { min-width: 0; font-variant-numeric: tabular-nums; }
.mobile-label { display: none; }
.remove-button { height: 34px; color: #9b3e36; background: #fff; border: 1px solid #d9a8a3; border-radius: 5px; cursor: pointer; font-family: $font-body; font-size: 13px; font-weight: 800; }
.remove-button:hover { color: #fff; background: #9b3e36; border-color: #9b3e36; }
.remove-button:disabled { cursor: not-allowed; opacity: .35; }
.empty-state { min-height: 180px; display: grid; place-items: center; color: #8b918d; font-size: 18px; }
@media(max-width:760px) {
  .categories-admin-page { padding-top: 34px; }
  .admin-header, .card-heading { align-items: flex-start; flex-direction: column; }
  .admin-header h1 { font-size: 36px; }
  .category-card { padding: 20px 14px; }
  .category-list { overflow: visible; }
  .category-head { display: none; }
  .category-row { min-width: 0; grid-template-columns: 42px 1fr; gap: 10px; padding: 16px 4px; }
  .category-row label, .category-row .remove-button { grid-column: 2; }
  .order-number { grid-row: 1 / span 4; align-self: start; padding-top: 32px; }
  .mobile-label { display: block; margin-bottom: 5px; color: #777e79; font-size: 11px; font-weight: 800; }
  .remove-button { width: 70px; }
}
</style>
