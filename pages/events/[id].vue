<template>
  <article class="board-detail-page">
    <nuxt-link to="/events" class="back-link">← 교회행사 목록</nuxt-link>
    <template v-if="post">
      <header><span>{{ post.category || 'CHURCH EVENT' }}</span><h1>{{ post.title }}</h1><time>{{ formatDate(post.date || post.createdAt) }}</time></header>
      <div class="detail-image"><img :src="post.thumbnailUrl || defaultImage" alt="" @error="useDefaultImage" /></div>
      <div class="detail-content">{{ post.content }}</div>
    </template>
    <div v-else class="empty-detail">행사 정보를 불러오는 중입니다.</div>
  </article>
</template>

<script setup lang="ts">
import { doc, getDoc } from 'firebase/firestore'
const route = useRoute()
const { isAdmin, runWithAuthRetry } = useAuth()
const { $firebaseDb } = useNuxtApp()
const defaultImage = '/images/bg_05.webp'
const post = ref<any>(null)
const formatDate = (value:string) => value ? value.slice(0,10).replaceAll('-', '. ') : ''
const useDefaultImage = (event:Event) => { (event.currentTarget as HTMLImageElement).src = defaultImage }
onMounted(async()=>{ if($firebaseDb){ const snapshot=await runWithAuthRetry(() => getDoc(doc($firebaseDb,'church_events',String(route.params.id)))); if(snapshot.exists()) { post.value={id:snapshot.id,...snapshot.data()}; if(post.value.isHidden === true && !isAdmin.value) await navigateTo('/events', { replace: true }) } } })
</script>

<style lang="scss" scoped>
.board-detail-page{width:min(960px,calc(100% - 40px));min-height:calc(100vh - 76px);margin:0 auto;padding:52px 0 90px}.back-link{display:inline-block;margin-bottom:34px;font-size:13px;font-weight:800}.board-detail-page header{padding-bottom:24px;border-bottom:2px solid #354c42}.board-detail-page header span{color:$mn-blue;font-size:13px;font-weight:800;letter-spacing:.08em}.board-detail-page h1{margin:10px 0 8px;font-size:clamp(34px,5vw,52px);line-height:1.3}.board-detail-page time{color:$text-muted;font-size:13px}.detail-image{margin-top:32px;aspect-ratio:1.8/1;overflow:hidden;background:#e5ece8}.detail-image img{width:100%;height:100%;object-fit:cover}.detail-content{padding:38px 4px;color:#425048;font-size:18px;line-height:1.95;white-space:pre-wrap}.empty-detail{min-height:300px;display:grid;place-items:center;color:$text-muted}
</style>
