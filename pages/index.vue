<template>
  <div class="home-page">
    <section class="hero-section">
      <div class="hero-media" aria-hidden="true">
        <img :src="heroImage" alt="" @error="useDefaultHeroImage" />
      </div>
      <div class="hero-shade"></div>
      <div class="hero-inner">
        <div :key="language" class="hero-copy">
          <h1 class="verse-main" :lang="language">{{ heroVerse.primary }}</h1>
          <span class="verse-divider" aria-hidden="true"></span>
          <p class="verse-translation" :lang="language === 'mn' ? 'ko' : 'mn'">{{ heroVerse.secondary }}</p>
          <p class="verse-reference">{{ heroReference.primary }} <span>·</span> {{ heroReference.secondary }}</p>
        </div>
      </div>
    </section>

    <section id="worship-guide" class="worship-section">
      <div class="content-shell worship-layout">
        <div class="worship-intro"><h2>{{ t('home.worshipGuide') }}</h2><p>{{ t('church.fullName') }}</p></div>
        <div class="worship-times">
          <div><strong>{{ t('home.worship.sunday') }}</strong><span>{{ t('home.worship.sundayTime') }}</span></div>
          <div><strong>{{ t('home.worship.wednesday') }}</strong><span>{{ t('home.worship.wednesdayTime') }}</span></div>
          <div><strong>{{ t('home.worship.dawn') }}</strong><span>{{ t('home.worship.dawnTime') }}</span></div>
        </div>
      </div>
    </section>

    <section id="church-news" class="editorial-section news-section">
      <div class="content-shell">
        <div class="section-heading">
          <h2>{{ t('home.churchNews') }}</h2>
          <nuxt-link to="/news" class="section-more" :aria-label="t('home.more')">+</nuxt-link>
        </div>
        <div v-if="newsItems.length" class="news-grid">
          <nuxt-link v-for="item in newsItems" :key="item.id" :to="item.to" class="news-card">
            <div class="news-image"><img :src="item.image" alt="" /></div>
            <div class="news-card-copy"><h3>{{ item.title }}</h3><time>{{ item.date }}</time></div>
          </nuxt-link>
        </div>
        <p v-else class="section-empty">{{ language === 'mn' ? 'Бүртгэгдсэн чуулганы мэдээ алга байна.' : '등록된 교회 소식이 없습니다.' }}</p>
      </div>
    </section>

    <section id="life-word" class="sermon-feature-section">
      <div class="feature-church-word" aria-hidden="true">Nalakh River of Life Church</div>
      <div class="feature-word" aria-hidden="true">LIVING WATER</div>
      <div class="content-shell">
        <div class="section-heading section-heading-light">
          <h2>{{ t('home.recentSermon') }}</h2>
          <nuxt-link to="/sermons" class="section-more section-more-light">+</nuxt-link>
        </div>
        <div v-if="featuredSermon" class="sermon-feature-grid">
          <nuxt-link :to="featuredSermon.to" class="sermon-main-image"><img :src="featuredSermon.image || defaultSermonImage" alt="" @error="useDefaultSermonImage" /></nuxt-link>
          <div class="sermon-feature-copy">
            <span class="feature-date">{{ featuredSermon.date }} · {{ featuredSermon.category }}</span>
            <h3>{{ featuredSermon.title }}</h3>
            <p class="feature-passage">{{ featuredSermon.passage }}</p>
            <p class="feature-summary">{{ featuredSermon.summary }}</p>
            <nuxt-link :to="featuredSermon.to" class="outline-link">{{ t('home.watchSermon') }} <span>→</span></nuxt-link>
            <div v-if="previousSermons.length" class="sermon-mini-grid">
              <nuxt-link v-for="item in previousSermons" :key="item.id" :to="item.to" class="sermon-mini">
                <img :src="item.image || defaultSermonImage" alt="" @error="useDefaultSermonImage" />
                <span>{{ item.title }}</span>
              </nuxt-link>
            </div>
          </div>
        </div>
        <p v-else class="sermon-empty">{{ t('sermons.empty') }}</p>
      </div>
    </section>

    <section class="editorial-section notice-section">
      <div class="content-shell">
        <div class="section-heading">
          <h2>{{ t('home.shortcut.noticesTitle') }}</h2>
          <nuxt-link to="/notices" class="section-more">+</nuxt-link>
        </div>
        <div v-if="noticeItems.length" class="notice-columns">
          <ul v-for="(column, columnIndex) in noticeColumns" :key="columnIndex" class="notice-list">
            <li v-for="item in column" :key="item.id">
              <span class="notice-badge badge-green">{{ item.badge }}</span>
              <nuxt-link :to="item.to">{{ item.title }}</nuxt-link>
              <time>{{ item.date }}</time>
            </li>
          </ul>
        </div>
        <p v-else class="section-empty">{{ t('notices.empty') }}</p>
      </div>
    </section>

    <section id="church-events" class="event-section">
      <div class="content-shell">
        <div class="section-heading">
          <h2>{{ t('home.eventNews') }}</h2>
          <div class="event-heading-actions">
            <div v-if="eventItems.length > 3" class="event-navigation">
              <button type="button" :aria-label="t('home.eventsPrevious')" @click="scrollEvents(-1)">‹</button>
              <button type="button" :aria-label="t('home.eventsNext')" @click="scrollEvents(1)">›</button>
            </div>
            <nuxt-link to="/events" class="section-more" :aria-label="t('home.more')">+</nuxt-link>
          </div>
        </div>
        <div v-if="eventItems.length" ref="eventTrack" class="event-track">
          <nuxt-link v-for="item in eventItems" :key="item.id" :to="item.to" class="event-card">
            <div class="event-image"><img :src="item.image || defaultEventImage" alt="" @error="useDefaultEventImage" /></div>
            <div class="event-card-copy">
              <span class="event-label">{{ item.label }}</span>
              <h3>{{ item.title }}</h3>
              <time>{{ item.date }}</time>
            </div>
          </nuxt-link>
        </div>
        <p v-else class="event-empty">{{ t('home.eventsEmpty') }}</p>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { collection, getDocs } from 'firebase/firestore'
import { richTextExcerpt } from '~/utils/richText'

const { language, t } = useLanguage()
const { $firebaseDb } = useNuxtApp()
const { getImage } = useFirestoreImages()
const { heroSettings, loadHeroSettings } = useHomeHeroSettings()
const defaultHeroImage = '/images/hero-steppe-river-v1.png'
const defaultSermonImage = '/images/sermon-default-v1.png'
const defaultNewsImage = '/images/bg_04.webp'
const defaultEventImage = '/images/bg_05.webp'
const eventTrack = ref<HTMLElement | null>(null)
const homepageNews = ref<any[]>([])
const homepageSermons = ref<any[]>([])
const homepageNotices = ref<any[]>([])
const homepageEvents = ref<any[]>([])
const heroImage = ref(defaultHeroImage)

const localized = (item: any, field: string) => {
  const korean = item[`${field}Ko`] || item[field] || item[`${field}Mn`] || ''
  const mongolian = item[`${field}Mn`] || item[`${field}Ko`] || item[field] || ''
  return language.value === 'mn' ? mongolian : korean
}
const timestamp = (item: any) => Date.parse(item.date || item.createdAt || '') || 0
const formatDate = (value: string) => value ? new Date(value).toLocaleDateString(language.value === 'mn' ? 'mn-MN' : 'ko-KR') : ''
const formatCompactDate = (value: string) => {
  if (!value) return ''
  const date = new Date(value)
  return `${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`
}

const newsItems = computed(() => homepageNews.value.map(item => ({
  id: item.id,
  image: item.image || defaultNewsImage,
  title: localized(item, 'title'),
  date: formatDate(item.date || item.createdAt),
  to: `/news/${item.id}`,
})))

const sermonItems = computed(() => homepageSermons.value.map(item => ({
  id: item.id,
  image: item.image || defaultSermonImage,
  title: localized(item, 'title'),
  category: localized(item, 'category') || (language.value === 'mn' ? 'Ням гарагийн мөргөл' : '주일예배'),
  passage: localized(item, 'passage') || item.biblePassage || '-',
  summary: richTextExcerpt(localized(item, 'content'), 150) || t('sermons.subtitle'),
  date: formatDate(item.date || item.createdAt),
  to: `/sermons/${item.id}`,
})))
const featuredSermon = computed(() => sermonItems.value[0] || null)
const previousSermons = computed(() => sermonItems.value.slice(1, 3))

const noticeItems = computed(() => homepageNotices.value.map(item => ({
  id: item.id,
  badge: item.isPinned ? t('notices.pinned') : (language.value === 'mn' ? 'ЗАРЛАЛ' : '공지'),
  title: localized(item, 'title'),
  date: formatCompactDate(item.createdAt),
  to: `/notices/${item.id}`,
})))
const noticeColumns = computed(() => [noticeItems.value.slice(0, 3), noticeItems.value.slice(3, 6)].filter(column => column.length))

const eventItems = computed(() => homepageEvents.value.map(item => ({
  id: item.id,
  image: item.image || defaultEventImage,
  label: localized(item, 'category') || 'CHURCH EVENT',
  title: localized(item, 'title'),
  date: formatDate(item.date || item.createdAt),
  to: `/events/${item.id}`,
})))

const useDefaultSermonImage = (event: Event) => {
  const image = event.currentTarget as HTMLImageElement
  if (!image.src.endsWith(defaultSermonImage)) image.src = defaultSermonImage
}

const useDefaultEventImage = (event: Event) => {
  const image = event.currentTarget as HTMLImageElement
  if (!image.src.endsWith(defaultEventImage)) image.src = defaultEventImage
}

const scrollEvents = (direction: -1 | 1) => {
  const track = eventTrack.value
  if (!track) return
  const card = track.querySelector<HTMLElement>('.event-card')
  const distance = (card?.offsetWidth ?? track.clientWidth) + 18
  track.scrollBy({ left: distance * direction, behavior: 'smooth' })
}

const heroVerse = computed(() => language.value === 'mn'
  ? { primary: heroSettings.value.verseMn, secondary: heroSettings.value.verseKo }
  : { primary: heroSettings.value.verseKo, secondary: heroSettings.value.verseMn })

const heroReference = computed(() => language.value === 'mn'
  ? { primary: heroSettings.value.referenceMn, secondary: heroSettings.value.referenceKo }
  : { primary: heroSettings.value.referenceKo, secondary: heroSettings.value.referenceMn })

const fetchHeroContent = async () => {
  try {
    await loadHeroSettings(true)
    heroImage.value = heroSettings.value.imageId ? (await getImage(heroSettings.value.imageId) || defaultHeroImage) : defaultHeroImage
  } catch (error) {
    console.error('Failed to load hero settings:', error)
    heroImage.value = defaultHeroImage
  }
}

const useDefaultHeroImage = (event: Event) => { (event.currentTarget as HTMLImageElement).src = defaultHeroImage }

const withImage = async (collectionName: string, item: any, fallback = '') => ({
  ...item,
  image: item.thumbnailImageId ? (await getImage(item.thumbnailImageId) || fallback) : (item.thumbnailUrl || fallback),
})

const fetchHomepageContent = async () => {
  if (!$firebaseDb) return
  try {
    const [newsSnapshot, sermonSnapshot, noticeSnapshot, eventSnapshot] = await Promise.all([
      getDocs(collection($firebaseDb, 'church_news')),
      getDocs(collection($firebaseDb, 'sermons')),
      getDocs(collection($firebaseDb, 'notices')),
      getDocs(collection($firebaseDb, 'church_events')),
    ])
    const visible = (snapshot: any) => snapshot.docs
      .map((item: any) => ({ id: item.id, ...item.data() }))
      .filter((item: any) => item.isHidden !== true)
      .sort((a: any, b: any) => timestamp(b) - timestamp(a))

    homepageNews.value = await Promise.all(visible(newsSnapshot).slice(0, 4).map((item: any) => withImage('church_news', item, defaultNewsImage)))
    homepageSermons.value = await Promise.all(visible(sermonSnapshot).slice(0, 3).map((item: any) => withImage('sermons', item, defaultSermonImage)))
    homepageNotices.value = visible(noticeSnapshot)
      .sort((a: any, b: any) => Number(b.isPinned) - Number(a.isPinned) || timestamp(b) - timestamp(a))
      .slice(0, 6)
    homepageEvents.value = await Promise.all(visible(eventSnapshot).slice(0, 6).map((item: any) => withImage('church_events', item, defaultEventImage)))
  } catch (error) {
    console.error('Failed to load homepage content:', error)
  }
}

onMounted(() => { void Promise.all([fetchHomepageContent(), fetchHeroContent()]) })
</script>

<style lang="scss" scoped>
.home-page { min-width: 0; overflow: hidden; color: #26332e; background: #fff; }
.home-page section[id] { scroll-margin-top: 92px; }
.content-shell { width: min(1380px, calc(100% - clamp(40px, 7vw, 112px))); margin: 0 auto; }

.hero-section { position: relative; min-height: clamp(640px, 72vh, 760px); display: flex; align-items: center; overflow: hidden; padding-top: 76px; background: #6f5a3f; }
.hero-media { position: absolute; inset: 0; overflow: hidden; }
.hero-media img { width: 100%; height: 100%; display: block; object-fit: cover; object-position: center; transform: scale(1.07) translateX(-1.5%); animation: hero-image-slide 18s ease-in-out infinite alternate; will-change: transform; }
@keyframes hero-image-slide { to { transform: scale(1.07) translateX(1.5%); } }
.hero-shade { position: absolute; inset: 0; background: rgba(#21160e,.34); }
.hero-inner { position: relative; z-index: 1; width: min(1180px, calc(100% - clamp(40px, 8vw, 128px))); margin: 0 auto; padding: 92px 0 122px; }
.hero-copy { width: 100%; margin: 0 auto; color: #fff; text-align: center; animation: copy-enter .7s ease both; }
@keyframes copy-enter { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }
.verse-main,.verse-translation { max-width: 920px; margin: 0 auto; color: #fff; font-family: $font-title; font-size: clamp(20px,1.55vw,28px); font-weight: 600; line-height: 1.62; letter-spacing: -.03em; white-space: pre-line; text-wrap: balance; text-shadow: 0 3px 22px rgba(#1b1008,.4); }
.verse-divider { width: 58px; height: 1px; display: block; margin: 27px auto 23px; background: rgba(#fff,.65); }
.verse-translation { color: rgba(#fff,.92); }
.verse-reference { margin-top: 24px; color: rgba(#fff,.72); font-size: 13px; font-weight: 700; letter-spacing: .12em; }
.verse-reference span { margin: 0 7px; color: rgba(#fff,.45); }

.editorial-section { padding: 88px 0; }
.section-heading { display: flex; align-items: center; justify-content: space-between; margin-bottom: 34px; padding-bottom: 18px; border-bottom: 2px solid #354c42; }
.section-heading h2 { margin: 0; font-size: clamp(2.05rem,3vw,2.75rem); line-height: 1.15; }
.section-more { width: 34px; height: 34px; display: grid; place-items: center; color: #26332e; border-radius: 50%; font-size: 1.45rem; font-weight: 300; line-height: 1; }
.section-more:hover { color: #fff; background: $mn-blue; transform: rotate(90deg); }
.news-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 18px; }
.news-card { min-width: 0; color: #26332e; }
.news-card:hover { color: #26332e; }
.news-card:hover img { transform: scale(1.045); }
.news-image { aspect-ratio: 1.45/1; overflow: hidden; background: #e8efeb; }
.news-image img { width: 100%; height: 100%; object-fit: cover; display: block; transition: transform .45s ease; }
.news-card-copy { padding: 15px 2px 0; }
.news-card h3 { margin: 0 0 3px; font-size: 20px; line-height: 1.48; }
.news-card time { color: #8e9a94; font-size: 13px; }
.section-empty { min-height: 180px; display: grid; place-items: center; color: #78857e; background: #f3f6f4; font-size: 18px; text-align: center; }

.sermon-feature-section { position: relative; overflow: hidden; padding: 76px 0 82px; color: #fff; background: #0b625d; }
.feature-word { position: absolute; right: -10px; bottom: -42px; color: rgba(#fff,.055); font-size: clamp(5rem,12vw,11rem); font-weight: 900; letter-spacing: -.07em; white-space: nowrap; }
.feature-church-word { position: absolute; left: -24px; top: -66px; color: rgba(#fff,.055); font-size: clamp(5rem,12vw,11rem); font-weight: 900; letter-spacing: -.065em; white-space: nowrap; pointer-events: none; }
.section-heading-light { border-color: rgba(#fff,.55); }
.section-heading-light h2 { color: #fff; }
.section-more-light { color: #fff; }
.section-more-light:hover { color: #18513e; background: #fff; }
.sermon-feature-grid { position: relative; min-height: 520px; display: grid; grid-template-columns: 1.14fr .86fr; gap: 40px; align-items: start; }
.sermon-main-image { position: relative; width: 100%; height: clamp(420px, 38vw, 520px); min-height: 0; max-height: 520px; overflow: hidden; background: #173e32; }
.sermon-main-image img { width: 100%; height: 100%; object-fit: cover; display: block; transition: transform .5s ease; }
.sermon-main-image:hover img { transform: scale(1.025); }
.sermon-feature-copy { min-height: 520px; display: flex; flex-direction: column; justify-content: flex-start; }
.feature-date { color: rgba(#fff,.68); font-size: 13px; font-weight: 700; letter-spacing: .1em; }
.sermon-feature-copy h3 { margin: 12px 0 10px; color: #fff; font-size: clamp(1.7rem,2.4vw,2.3rem); line-height: 1.35; }
.feature-passage { color: #9ee0d4; font-size: 18px; font-weight: 700; }
.feature-summary { margin: 16px 0 22px; color: rgba(#fff,.78); font-size: 18px; line-height: 1.75; }
.outline-link { width: fit-content; padding-bottom: 5px; color: #fff; border-bottom: 1px solid rgba(#fff,.7); font-size: 18px; font-weight: 800; }
.outline-link:hover { color: #b7eee5; }
.sermon-mini-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-top: auto; padding-top: 32px; }
.sermon-mini { position: relative; height: 168px; overflow: hidden; color: #fff; }
.sermon-mini::after { content: ''; position: absolute; inset: 0; background: rgba(#142a22,.52); }
.sermon-mini img { width: 100%; height: 100%; object-fit: cover; }
.sermon-mini span { position: absolute; z-index: 1; left: 12px; right: 12px; bottom: 10px; font-size: 13px; font-weight: 700; }
.sermon-empty { min-height: 320px; display: grid; place-items: center; color: rgba(#fff,.76); border: 1px solid rgba(#fff,.2); font-size: 18px; text-align: center; }

.notice-section { padding-bottom: 76px; }
.notice-columns { display: grid; grid-template-columns: 1fr 1fr; gap: 44px; }
.notice-list { list-style: none; }
.notice-list li { min-width: 0; display: grid; grid-template-columns: auto minmax(0,1fr) auto; gap: 12px; align-items: center; padding: 14px 0; border-bottom: 1px solid #dfe8e2; }
.notice-list a { overflow: hidden; color: #425048; font-size: 18px; font-weight: 600; white-space: nowrap; text-overflow: ellipsis; }
.notice-list a:hover { color: $mn-blue; }
.notice-list time { color: #8e9a94; font-size: 13px; }
.notice-badge { min-width: 64px; padding: 4px 8px; color: #fff; font-size: 13px; font-weight: 800; text-align: center; }
.badge-green { background: $mn-blue; }

.event-section { padding: 82px 0 92px; background: #f7f8f5; }
.event-heading-actions { display: flex; align-items: center; gap: 12px; }
.event-navigation { display: flex; gap: 7px; }
.event-navigation button {
  width: 36px; height: 36px; display: grid; place-items: center; padding: 0; color: #2f493e; background: transparent;
  border: 1px solid #b9c9c1; border-radius: 50%; cursor: pointer; font-size: 24px; line-height: 1; transition: .2s ease;
}
.event-navigation button:hover { color: #fff; background: $mn-blue; border-color: $mn-blue; }
.event-navigation button:focus-visible { outline: 2px solid rgba($mn-blue,.35); outline-offset: 3px; }
.event-track {
  display: grid; grid-auto-flow: column; grid-auto-columns: calc((100% - 36px) / 3); gap: 18px; overflow-x: auto;
  padding-bottom: 8px; scroll-behavior: smooth; scroll-snap-type: x mandatory; overscroll-behavior-inline: contain;
  scrollbar-width: none;
}
.event-track::-webkit-scrollbar { display: none; }
.event-card { min-width: 0; color: #26332e; scroll-snap-align: start; }
.event-card:hover { color: #26332e; }
.event-image { aspect-ratio: 1.55/1; overflow: hidden; background: #dfe7e2; }
.event-image img { width: 100%; height: 100%; display: block; object-fit: cover; transition: transform .45s ease; }
.event-card:hover .event-image img { transform: scale(1.04); }
.event-card-copy { padding: 16px 2px 0; }
.event-label { display: inline-block; padding: 4px 9px; color: #fff; background: $mn-blue; font-size: 13px; font-weight: 800; letter-spacing: .04em; }
.event-card h3 { margin: 9px 0 4px; color: #26332e; font-size: 20px; line-height: 1.45; }
.event-card time { color: #8e9a94; font-size: 13px; }
.event-empty {
  min-height: 240px; display: grid; place-items: center; color: #78857e; background: #eef2ef;
  border: 1px solid #dce5df; font-size: 18px; text-align: center;
}

.worship-section { padding: 58px 0; color: #fff; background: #22372e; }
.worship-layout { display: grid; grid-template-columns: .8fr 1.2fr; gap: 70px; align-items: center; }
.worship-intro h2 { margin: 0 0 10px; color: #fff; font-size: clamp(2.05rem,3vw,2.65rem); }
.worship-intro p { color: rgba(#fff,.62); font-size: 13px; }
.worship-times { display: grid; grid-template-columns: repeat(3,1fr); }
.worship-times div { display: flex; flex-direction: column; gap: 7px; padding: 8px 22px; border-left: 1px solid rgba(#fff,.18); }
.worship-times strong { font-size: 18px; }
.worship-times span { color: rgba(#fff,.64); font-size: 13px; }

@media (max-width:1100px) {
  .news-grid { grid-template-columns: 1fr 1fr; row-gap: 32px; }
  .sermon-feature-grid { min-height: 470px; grid-template-columns: 1.08fr .92fr; gap: 28px; }
  .sermon-main-image { height: 470px; min-height: 0; max-height: 470px; }
  .sermon-feature-copy { min-height: 470px; }
  .sermon-mini { height: 142px; }
  .event-track { grid-auto-columns: calc((100% - 18px) / 2); }
}

@media (max-width:768px) {
  .content-shell,.hero-inner { width: calc(100% - 32px); }
  .hero-section { min-height: 590px; padding-top: 64px; }
  .hero-media img { object-position: 48% center; }
  .hero-shade { background: rgba(#21160e,.38); }
  .hero-inner { padding: 72px 0 98px; }
  .verse-main,.verse-translation { max-width: 650px; font-size: clamp(20px,4.2vw,24px); line-height: 1.62; }
  .editorial-section { padding: 64px 0; }
  .sermon-feature-section { padding: 62px 0; }
  .sermon-feature-grid { min-height: 0; grid-template-columns: 1fr; }
  .sermon-main-image { height: 320px; min-height: 0; max-height: 320px; }
  .sermon-feature-copy { min-height: 0; padding-top: 28px; }
  .sermon-mini-grid { margin-top: 28px; padding-top: 0; }
  .notice-columns,.worship-layout { grid-template-columns: 1fr; gap: 34px; }
  .worship-times { grid-template-columns: 1fr; }
  .worship-times div { padding: 13px 0; border-left: 0; border-top: 1px solid rgba(#fff,.16); }
}

@media (max-width:520px) {
  .hero-section { min-height: 550px; }
  .hero-inner { padding: 64px 0 82px; }
  .verse-main,.verse-translation { font-size: 20px; line-height: 1.68; }
  .verse-divider { margin: 21px auto 18px; }
  .verse-reference { margin-top: 20px; font-size: 13px; letter-spacing: .08em; }
  .news-grid { grid-template-columns: 1fr; }
  .section-heading { align-items: center; }
  .news-image { aspect-ratio: 1.7/1; }
  .sermon-main-image { height: 240px; min-height: 0; max-height: 240px; }
  .sermon-mini-grid { grid-template-columns: 1fr; }
  .notice-columns { gap: 0; }
  .event-track { grid-auto-columns: 88%; }
  .event-navigation button { width: 32px; height: 32px; }
}

@media (prefers-reduced-motion:reduce) {
  .hero-copy,.hero-media img { animation: none; }
  *,*::before,*::after { transition-duration: .01ms !important; }
}
</style>
