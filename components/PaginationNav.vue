<template>
  <nav v-if="totalPages > 1" class="pagination-nav" :aria-label="language === 'mn' ? 'Хуудас сонгох' : '페이지 선택'">
    <button type="button" class="arrow-button" :disabled="modelValue <= 1" :aria-label="language === 'mn' ? 'Өмнөх хуудас' : '이전 페이지'" @click="move(modelValue - 1)">‹</button>
    <button
      v-for="page in visiblePages"
      :key="page"
      type="button"
      :class="['page-button', { active: page === modelValue }]"
      :aria-current="page === modelValue ? 'page' : undefined"
      @click="move(page)"
    >{{ page }}</button>
    <button type="button" class="arrow-button" :disabled="modelValue >= totalPages" :aria-label="language === 'mn' ? 'Дараагийн хуудас' : '다음 페이지'" @click="move(modelValue + 1)">›</button>
  </nav>
</template>

<script setup lang="ts">
const props = defineProps<{ modelValue: number; totalPages: number }>()
const emit = defineEmits<{ 'update:modelValue': [value: number] }>()
const { language } = useLanguage()

const visiblePages = computed(() => {
  const count = Math.min(5, props.totalPages)
  const start = Math.max(1, Math.min(props.modelValue - 2, props.totalPages - count + 1))
  return Array.from({ length: count }, (_, index) => start + index)
})

const move = (page: number) => {
  if (page < 1 || page > props.totalPages || page === props.modelValue) return
  emit('update:modelValue', page)
  nextTick(() => window.scrollTo({ top: 0, behavior: 'smooth' }))
}
</script>

<style lang="scss" scoped>
.pagination-nav { display: flex; align-items: center; justify-content: center; gap: 7px; margin-top: 36px; }
.pagination-nav button { width: 38px; height: 38px; display: grid; place-items: center; padding: 0; color: #59645e; background: #fff; border: 1px solid #d4ddd8; border-radius: 5px; cursor: pointer; font-family: $font-body; font-size: 13px; font-weight: 800; transition: .18s ease; }
.pagination-nav button:hover:not(:disabled):not(.active) { color: #116b4d; background: #f0f6f3; border-color: #91b2a4; }
.pagination-nav button.active { color: #fff; background: #16815d; border-color: #16815d; }
.pagination-nav button:disabled { cursor: not-allowed; opacity: .35; }
.pagination-nav .arrow-button { font-size: 22px; font-weight: 400; line-height: 1; }
@media(max-width:520px) { .pagination-nav { gap: 5px; margin-top: 28px; } .pagination-nav button { width: 34px; height: 34px; } }
</style>
