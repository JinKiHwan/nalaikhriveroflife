<template>
  <div class="home-page">
    <section class="hero-section">
      <div class="hero-shade"></div>
      <div class="hero-inner">
        <div :key="language" class="hero-copy">
          <div class="verse-tag"><span class="tag-dot"></span>{{ t('home.dailyWord') }}</div>
          <h1 class="verse-main">{{ t('home.verseMain') }}</h1>
          <p class="verse-translation">{{ t('home.verseSecondary') }}</p>
          <p class="verse-reference">{{ t('home.verseRef') }}</p>
        </div>
        <div class="hero-place" aria-hidden="true"><span class="place-line"></span><span>NALAIKH · MONGOLIA</span></div>
      </div>
    </section>

    <nav class="quick-section" :aria-label="t('nav.home')">
      <div class="content-shell quick-grid">
        <nuxt-link to="/sermons" class="quick-link">
          <span class="quick-number">01</span>
          <span class="quick-icon quick-red"><svg viewBox="0 0 24 24"><path d="M21 5c-1.11-.35-2.33-.5-3.5-.5-1.95 0-4.05.4-5.5 1.5-1.45-1.1-3.55-1.5-5.5-1.5S2.45 4.9 1 6v14.65c0 .25.25.5.5.5.1 0 .15-.05.25-.05C3.1 20.45 5.05 20 6.5 20c1.95 0 4.05.4 5.5 1.5 1.35-.85 3.8-1.5 5.5-1.5 1.65 0 3.35.3 4.75 1.05.1.05.15.05.25.05.25 0 .5-.25.5-.5V6c-.6-.45-1.25-.75-2-1z"/></svg></span>
          <span class="quick-copy"><strong>{{ t('home.shortcut.sermonsTitle') }}</strong><small>{{ t('home.shortcut.sermonsDesc') }}</small></span>
          <span class="quick-arrow">↗</span>
        </nuxt-link>
        <nuxt-link to="/notices" class="quick-link">
          <span class="quick-number">02</span>
          <span class="quick-icon quick-blue"><svg viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H5.17L4 17.17V4h16v12z"/></svg></span>
          <span class="quick-copy"><strong>{{ t('home.shortcut.noticesTitle') }}</strong><small>{{ t('home.shortcut.noticesDesc') }}</small></span>
          <span class="quick-arrow">↗</span>
        </nuxt-link>
        <nuxt-link to="/qt" class="quick-link">
          <span class="quick-number">03</span>
          <span class="quick-icon quick-red"><svg viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg></span>
          <span class="quick-copy"><strong>{{ t('home.shortcut.qtTitle') }}</strong><small>{{ t('home.shortcut.qtDesc') }}</small></span>
          <span class="quick-arrow">↗</span>
        </nuxt-link>
        <nuxt-link to="/events" class="quick-link">
          <span class="quick-number">04</span>
          <span class="quick-icon quick-blue"><svg viewBox="0 0 24 24"><path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V9h14v10zM7 11h5v5H7z"/></svg></span>
          <span class="quick-copy"><strong>{{ t('home.shortcut.eventsTitle') }}</strong><small>{{ t('home.shortcut.eventsDesc') }}</small></span>
          <span class="quick-arrow">↗</span>
        </nuxt-link>
      </div>
    </nav>

    <section class="editorial-section news-section">
      <div class="content-shell">
        <div class="section-heading">
          <div><span class="eyebrow">RIVER OF LIFE NEWS</span><h2>{{ t('home.churchNews') }}</h2></div>
          <nuxt-link to="/notices" class="section-more" :aria-label="t('home.more')">+</nuxt-link>
        </div>
        <div class="news-grid">
          <nuxt-link v-for="item in newsItems" :key="item.image" :to="item.to" class="news-card">
            <div class="news-image"><img :src="item.image" alt="" /></div>
            <div class="news-card-copy"><span class="category">{{ item.category }}</span><h3>{{ item.title }}</h3><time>{{ item.date }}</time></div>
          </nuxt-link>
        </div>
      </div>
    </section>

    <section class="sermon-feature-section">
      <div class="feature-word" aria-hidden="true">LIVING WATER</div>
      <div class="content-shell">
        <div class="section-heading section-heading-light">
          <div><span class="eyebrow">SUNDAY MESSAGE</span><h2>{{ t('home.recentSermon') }}</h2></div>
          <nuxt-link to="/sermons" class="section-more section-more-light">+</nuxt-link>
        </div>
        <div class="sermon-feature-grid">
          <nuxt-link to="/sermons" class="sermon-main-image"><img src="/images/bg_01.webp" alt="" /><span class="play-mark">▶</span></nuxt-link>
          <div class="sermon-feature-copy">
            <span class="feature-date">2026. 08. 23 · SUNDAY WORSHIP</span>
            <h3>{{ t('home.sermonTitle') }}</h3>
            <p class="feature-passage">{{ t('home.sermonPassage') }}</p>
            <p class="feature-summary">{{ t('sermons.subtitle') }}</p>
            <nuxt-link to="/sermons" class="outline-link">{{ t('home.watchSermon') }} <span>→</span></nuxt-link>
            <div class="sermon-mini-grid">
              <nuxt-link to="/sermons" class="sermon-mini"><img src="/images/bg_02.webp" alt="" /><span>{{ t('home.shortcut.sermonsDesc') }}</span></nuxt-link>
              <nuxt-link to="/qt" class="sermon-mini"><img src="/images/bg_03.webp" alt="" /><span>{{ t('home.shortcut.qtDesc') }}</span></nuxt-link>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="editorial-section notice-section">
      <div class="content-shell">
        <div class="section-heading">
          <div><span class="eyebrow">NOTICE &amp; INFORMATION</span><h2>{{ t('home.shortcut.noticesTitle') }}</h2></div>
          <nuxt-link to="/notices" class="section-more">+</nuxt-link>
        </div>
        <div class="notice-columns">
          <ul class="notice-list">
            <li><span class="notice-badge badge-red">{{ t('notices.pinned') }}</span><nuxt-link to="/notices">{{ t('home.news.retreat') }}</nuxt-link><time>08.21</time></li>
            <li><span class="notice-badge badge-blue">NEWS</span><nuxt-link to="/notices">{{ t('home.news.bazaar') }}</nuxt-link><time>08.18</time></li>
            <li><span class="notice-badge badge-blue">INFO</span><nuxt-link to="/notices">{{ t('home.news.welcome') }}</nuxt-link><time>08.17</time></li>
          </ul>
          <ul class="notice-list">
            <li><span class="notice-badge badge-red">QT</span><nuxt-link to="/qt">{{ t('qt.subtitle') }}</nuxt-link><time>08.16</time></li>
            <li><span class="notice-badge badge-blue">BIBLE</span><nuxt-link to="/events">{{ t('events.subtitle') }}</nuxt-link><time>08.12</time></li>
            <li><span class="notice-badge badge-blue">WORSHIP</span><nuxt-link to="/events">{{ t('home.worshipGuide') }}</nuxt-link><time>08.10</time></li>
          </ul>
        </div>
      </div>
    </section>

    <section class="community-section">
      <div class="content-shell community-grid">
        <article class="community-feature">
          <div class="community-heading"><span>DAILY MEDITATION</span><h2>{{ t('home.shortcut.qtTitle') }}</h2></div>
          <div class="community-image"><img src="/images/bg_02.webp" alt="" /></div>
          <div class="community-copy"><p>{{ t('qt.subtitle') }}</p><nuxt-link to="/qt">{{ t('common.viewDetail') }} →</nuxt-link></div>
        </article>
        <article class="community-feature">
          <div class="community-heading"><span>TOGETHER IN THE WORD</span><h2>{{ t('home.shortcut.eventsTitle') }}</h2></div>
          <div class="community-image"><img src="/images/bg_05.webp" alt="" /></div>
          <div class="community-copy"><p>{{ t('events.subtitle') }}</p><nuxt-link to="/events">{{ t('common.viewDetail') }} →</nuxt-link></div>
        </article>
      </div>
    </section>

    <section class="worship-section">
      <div class="content-shell worship-layout">
        <div class="worship-intro"><span class="eyebrow">WORSHIP WITH US</span><h2>{{ t('home.worshipGuide') }}</h2><p>{{ t('church.fullName') }}</p></div>
        <div class="worship-times">
          <div><strong>{{ t('home.worship.sunday') }}</strong><span>{{ t('home.worship.sundayTime') }}</span></div>
          <div><strong>{{ t('home.worship.wednesday') }}</strong><span>{{ t('home.worship.wednesdayTime') }}</span></div>
          <div><strong>{{ t('home.worship.dawn') }}</strong><span>{{ t('home.worship.dawnTime') }}</span></div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
const { language, t } = useLanguage()

const newsItems = computed(() => [
  { image: '/images/bg_04.webp', category: 'CHURCH NEWS', title: t('home.news.retreat'), date: '2026. 08. 21', to: '/notices' },
  { image: '/images/bg_05.webp', category: 'MISSION', title: t('home.news.bazaar'), date: '2026. 08. 18', to: '/notices' },
  { image: '/images/bg_06.webp', category: 'COMMUNITY', title: t('home.news.welcome'), date: '2026. 08. 17', to: '/notices' },
  { image: '/images/bg_07.webp', category: 'BIBLE PROJECT', title: t('home.shortcut.eventsDesc'), date: '2026. 08. 10', to: '/events' },
])
</script>

<style lang="scss" scoped>
.home-page { min-width: 0; overflow: hidden; color: #18243a; background: #fff; }
.content-shell { width: min(1380px, calc(100% - clamp(40px, 7vw, 112px))); margin: 0 auto; }

.hero-section { position: relative; min-height: 520px; display: flex; align-items: center; overflow: hidden; background: url('/images/bg_03.webp') 72% 46% / cover no-repeat; }
.hero-shade { position: absolute; inset: 0; background: linear-gradient(90deg, rgba(#102038,.91), rgba(#12243c,.73) 40%, rgba(#102038,.2) 78%, rgba(#102038,.08)), linear-gradient(180deg, rgba(#071323,.14), transparent 62%, rgba(#071323,.38)); }
.hero-inner { position: relative; z-index: 1; width: min(1380px, calc(100% - clamp(40px, 7vw, 112px))); margin: 0 auto; padding: 72px 0 82px; }
.hero-copy { width: min(720px, 67%); color: #fff; animation: copy-enter .7s ease both; }
@keyframes copy-enter { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }
.verse-tag { display: inline-flex; align-items: center; gap: 9px; margin-bottom: 22px; font-size: .78rem; font-weight: 800; letter-spacing: .08em; }
.tag-dot { width: 9px; height: 9px; border-radius: 50%; background: $mn-red; box-shadow: 0 0 0 5px rgba($mn-red,.2); }
.verse-main { max-width: 700px; margin: 0 0 24px; color: #fff; font-size: clamp(2rem,3vw,2.8rem); font-weight: 700; line-height: 1.5; letter-spacing: -.045em; white-space: pre-line; text-shadow: 0 2px 18px rgba(#000,.18); }
.verse-translation { max-width: 660px; margin-bottom: 16px; color: rgba(#fff,.72); font-size: .96rem; font-style: italic; line-height: 1.75; white-space: pre-line; }
.verse-reference { display: inline-flex; align-items: center; gap: 12px; color: #fff; font-size: .86rem; font-weight: 800; letter-spacing: .04em; }
.verse-reference::before { content: ''; width: 34px; height: 2px; background: $mn-blue; }
.hero-place { position: absolute; right: 0; bottom: 42px; display: flex; align-items: center; gap: 12px; color: rgba(#fff,.72); font-size: .68rem; font-weight: 700; letter-spacing: .2em; }
.place-line { width: 54px; height: 1px; background: rgba(#fff,.5); }

.quick-section { position: relative; z-index: 3; margin-top: -32px; }
.quick-grid { display: grid; grid-template-columns: repeat(4,1fr); background: #fff; border-top: 4px solid $mn-blue; box-shadow: 0 18px 44px rgba(#18314f,.13); }
.quick-link { position: relative; min-width: 0; min-height: 104px; display: flex; align-items: center; gap: 14px; padding: 22px 20px; color: #18243a; border-right: 1px solid #e7edf4; }
.quick-link:last-child { border-right: 0; }
.quick-link:hover { color: #18243a; background: #f7fbff; }
.quick-link:hover .quick-arrow { transform: translate(2px,-2px); color: $mn-red; }
.quick-link:focus-visible { outline: 3px solid rgba($mn-blue,.28); outline-offset: -3px; }
.quick-number { position: absolute; top: 10px; right: 12px; color: #dce4ee; font-size: .67rem; font-weight: 800; }
.quick-icon { width: 42px; height: 42px; flex: 0 0 42px; display: grid; place-items: center; border-radius: 50%; }
.quick-icon svg { width: 19px; height: 19px; fill: currentColor; }
.quick-red { color: $mn-red; background: rgba($mn-red,.09); }
.quick-blue { color: $mn-blue; background: rgba($mn-blue,.09); }
.quick-copy { min-width: 0; display: flex; flex: 1; flex-direction: column; gap: 3px; }
.quick-copy strong { font-size: .9rem; line-height: 1.35; }
.quick-copy small { color: #8a94a5; font-size: .72rem; line-height: 1.4; }
.quick-arrow { color: $mn-blue; font-size: .92rem; transition: .2s ease; }

.editorial-section { padding: 88px 0; }
.section-heading { display: flex; align-items: flex-end; justify-content: space-between; margin-bottom: 28px; padding-bottom: 14px; border-bottom: 2px solid #24354c; }
.section-heading h2 { display: flex; align-items: center; margin-top: 4px; font-size: clamp(1.65rem,2.4vw,2.15rem); line-height: 1.2; }
.eyebrow { color: #8792a3; font-size: .68rem; font-weight: 800; letter-spacing: .16em; }
.section-more { width: 34px; height: 34px; display: grid; place-items: center; color: #18243a; border-radius: 50%; font-size: 1.45rem; font-weight: 300; line-height: 1; }
.section-more:hover { color: #fff; background: $mn-blue; transform: rotate(90deg); }
.news-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 18px; }
.news-card { min-width: 0; color: #18243a; }
.news-card:hover { color: #18243a; }
.news-card:hover img { transform: scale(1.045); }
.news-image { aspect-ratio: 1.45/1; overflow: hidden; background: #eaf0f6; }
.news-image img { width: 100%; height: 100%; object-fit: cover; display: block; transition: transform .45s ease; }
.news-card-copy { padding: 15px 2px 0; }
.category { color: $mn-blue; font-size: .65rem; font-weight: 800; letter-spacing: .08em; }
.news-card h3 { min-height: 2.75em; margin: 6px 0 10px; font-size: .92rem; line-height: 1.48; }
.news-card time { color: #9aa3b1; font-size: .7rem; }

.sermon-feature-section { position: relative; overflow: hidden; padding: 76px 0 82px; color: #fff; background: #0b625d; }
.feature-word { position: absolute; right: -10px; bottom: -42px; color: rgba(#fff,.055); font-size: clamp(5rem,12vw,11rem); font-weight: 900; letter-spacing: -.07em; white-space: nowrap; }
.section-heading-light { border-color: rgba(#fff,.55); }
.section-heading-light h2,.section-heading-light .eyebrow { color: #fff; }
.section-more-light { color: #fff; }
.section-more-light:hover { color: #005f58; background: #fff; }
.sermon-feature-grid { position: relative; display: grid; grid-template-columns: 1.08fr .92fr; gap: 44px; align-items: stretch; }
.sermon-main-image { position: relative; min-height: 360px; overflow: hidden; background: #073e3b; }
.sermon-main-image img { width: 100%; height: 100%; object-fit: cover; display: block; transition: transform .5s ease; }
.sermon-main-image:hover img { transform: scale(1.025); }
.play-mark { position: absolute; left: 28px; bottom: 28px; width: 52px; height: 52px; display: grid; place-items: center; padding-left: 3px; color: #005f58; background: rgba(#fff,.92); border-radius: 50%; box-shadow: 0 8px 26px rgba(#000,.18); }
.sermon-feature-copy { display: flex; flex-direction: column; justify-content: center; }
.feature-date { color: rgba(#fff,.62); font-size: .68rem; font-weight: 700; letter-spacing: .1em; }
.sermon-feature-copy h3 { margin: 12px 0 10px; color: #fff; font-size: clamp(1.7rem,2.4vw,2.3rem); line-height: 1.35; }
.feature-passage { color: #9ee0d4; font-weight: 700; }
.feature-summary { margin: 16px 0 22px; color: rgba(#fff,.74); font-size: .86rem; line-height: 1.75; }
.outline-link { width: fit-content; padding-bottom: 5px; color: #fff; border-bottom: 1px solid rgba(#fff,.7); font-size: .8rem; font-weight: 800; }
.outline-link:hover { color: #b7eee5; }
.sermon-mini-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 30px; }
.sermon-mini { position: relative; height: 94px; overflow: hidden; color: #fff; }
.sermon-mini::after { content: ''; position: absolute; inset: 0; background: linear-gradient(transparent,rgba(#001b19,.8)); }
.sermon-mini img { width: 100%; height: 100%; object-fit: cover; }
.sermon-mini span { position: absolute; z-index: 1; left: 12px; right: 12px; bottom: 10px; font-size: .7rem; font-weight: 700; }

.notice-section { padding-bottom: 76px; }
.notice-columns { display: grid; grid-template-columns: 1fr 1fr; gap: 44px; }
.notice-list { list-style: none; }
.notice-list li { min-width: 0; display: grid; grid-template-columns: auto minmax(0,1fr) auto; gap: 12px; align-items: center; padding: 14px 0; border-bottom: 1px solid #e8edf3; }
.notice-list a { overflow: hidden; color: #354156; font-size: .82rem; font-weight: 600; white-space: nowrap; text-overflow: ellipsis; }
.notice-list a:hover { color: $mn-blue; }
.notice-list time { color: #9aa3b1; font-size: .7rem; }
.notice-badge { min-width: 42px; padding: 3px 7px; color: #fff; font-size: .58rem; font-weight: 800; text-align: center; }
.badge-red { background: $mn-red; }
.badge-blue { background: $mn-blue; }

.community-section { padding: 78px 0; background: linear-gradient(rgba(#f7f4ed,.93),rgba(#f7f4ed,.93)),url('/images/bg_06.webp') center/cover; }
.community-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 34px; }
.community-feature { display: grid; grid-template-columns: 1fr 1fr; grid-template-areas: 'heading heading' 'image copy'; column-gap: 20px; }
.community-heading { grid-area: heading; display: flex; align-items: flex-end; justify-content: space-between; margin-bottom: 18px; padding-bottom: 12px; border-bottom: 2px solid #314358; }
.community-heading span { color: #8b917f; font-size: .62rem; font-weight: 800; letter-spacing: .1em; }
.community-heading h2 { font-size: 1.35rem; }
.community-image { grid-area: image; aspect-ratio: 1.25/1; overflow: hidden; }
.community-image img { width: 100%; height: 100%; object-fit: cover; }
.community-copy { grid-area: copy; display: flex; flex-direction: column; justify-content: space-between; padding: 7px 0; }
.community-copy p { color: #687284; font-size: .8rem; line-height: 1.7; }
.community-copy a { width: fit-content; color: $mn-blue; font-size: .76rem; font-weight: 800; }

.worship-section { padding: 58px 0; color: #fff; background: #14243a; }
.worship-layout { display: grid; grid-template-columns: .8fr 1.2fr; gap: 70px; align-items: center; }
.worship-intro .eyebrow { color: #89a3c2; }
.worship-intro h2 { margin: 7px 0 8px; color: #fff; font-size: 1.8rem; }
.worship-intro p { color: rgba(#fff,.55); font-size: .82rem; }
.worship-times { display: grid; grid-template-columns: repeat(3,1fr); }
.worship-times div { display: flex; flex-direction: column; gap: 7px; padding: 8px 22px; border-left: 1px solid rgba(#fff,.18); }
.worship-times strong { font-size: .86rem; }
.worship-times span { color: rgba(#fff,.58); font-size: .75rem; }

@media (max-width:1100px) {
  .quick-grid { grid-template-columns: 1fr 1fr; }
  .quick-link:nth-child(2) { border-right: 0; }
  .quick-link:nth-child(-n+2) { border-bottom: 1px solid #e7edf4; }
  .news-grid { grid-template-columns: 1fr 1fr; row-gap: 32px; }
  .sermon-feature-grid { grid-template-columns: 1fr 1fr; gap: 28px; }
  .community-feature { grid-template-columns: 1fr; grid-template-areas: 'heading' 'image' 'copy'; }
  .community-copy { gap: 16px; padding-top: 16px; }
}

@media (max-width:768px) {
  .content-shell,.hero-inner { width: calc(100% - 32px); }
  .hero-section { min-height: 510px; background-position: 66% center; }
  .hero-shade { background: linear-gradient(90deg,rgba(#102038,.9),rgba(#102038,.62)); }
  .hero-inner { padding: 56px 0 70px; }
  .hero-copy { width: 92%; }
  .verse-main { font-size: clamp(1.7rem,6vw,2.2rem); }
  .hero-place { display: none; }
  .quick-section { margin-top: 0; }
  .quick-grid { width: 100%; border-top: 0; box-shadow: none; }
  .editorial-section { padding: 64px 0; }
  .sermon-feature-section { padding: 62px 0; }
  .sermon-feature-grid { grid-template-columns: 1fr; }
  .sermon-main-image { min-height: 320px; }
  .notice-columns,.community-grid,.worship-layout { grid-template-columns: 1fr; gap: 34px; }
  .worship-times { grid-template-columns: 1fr; }
  .worship-times div { padding: 13px 0; border-left: 0; border-top: 1px solid rgba(#fff,.16); }
}

@media (max-width:520px) {
  .hero-section { min-height: 500px; }
  .hero-copy { width: 100%; }
  .verse-main { font-size: 1.52rem; line-height: 1.58; }
  .verse-translation { font-size: .82rem; }
  .quick-grid,.news-grid { grid-template-columns: 1fr; }
  .quick-link { min-height: 88px; border-right: 0; border-bottom: 1px solid #e7edf4; }
  .quick-link:last-child { border-bottom: 0; }
  .section-heading { align-items: center; }
  .news-image { aspect-ratio: 1.7/1; }
  .sermon-main-image { min-height: 240px; }
  .sermon-mini-grid { grid-template-columns: 1fr; }
  .notice-columns { gap: 0; }
}

@media (prefers-reduced-motion:reduce) {
  .hero-copy { animation: none; }
  *,*::before,*::after { transition-duration: .01ms !important; }
}
</style>
