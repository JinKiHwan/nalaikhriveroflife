import { computed, ref, watch, type ComputedRef, type Ref } from 'vue'

export const useClientPagination = <T>(source: Ref<T[]> | ComputedRef<T[]>, pageSize = 10) => {
  const currentPage = ref(1)
  const totalPages = computed(() => Math.max(1, Math.ceil(source.value.length / pageSize)))
  const pagedItems = computed(() => {
    const start = (currentPage.value - 1) * pageSize
    return source.value.slice(start, start + pageSize)
  })

  const resetPage = () => { currentPage.value = 1 }

  watch(totalPages, (nextTotal) => {
    if (currentPage.value > nextTotal) currentPage.value = nextTotal
  })

  return { currentPage, totalPages, pagedItems, resetPage }
}
