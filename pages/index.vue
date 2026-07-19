<template>
  <div class="home-page">

    <!-- ── 히어로 영역 (풀와이드 배경 + 말씀) ──────── -->
    <section class="hero-section">
      <div class="hero-inner">
        <div :key="language" class="hero-copy">
          <div class="verse-tag">
            <span class="drop-icon" aria-hidden="true"></span>
            {{ t('home.dailyWord') }}
          </div>
          <p class="verse-korean">{{ t('home.verseMain') }}</p>
          <div class="verse-rule" aria-hidden="true"></div>
          <p class="verse-mongolian">{{ t('home.verseSecondary') }}</p>
          <span class="verse-ref">{{ t('home.verseRef') }}</span>
        </div>

        <div class="mongol-identity" aria-hidden="true">
          <img src="/images/mongol.png" alt="" />
          <span class="nalaikh-point"></span>
        </div>
      </div>

      <svg class="hero-wave" viewBox="0 0 1440 270" preserveAspectRatio="none" aria-hidden="true">
        <defs>
          <linearGradient id="river-blue" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stop-color="#278bd4" stop-opacity="0.05" />
            <stop offset="52%" stop-color="#278bd4" stop-opacity="0.28" />
            <stop offset="100%" stop-color="#d93652" stop-opacity="0.13" />
          </linearGradient>
          <linearGradient id="river-light" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stop-color="#ffffff" stop-opacity="0" />
            <stop offset="60%" stop-color="#70c8ef" stop-opacity="0.22" />
            <stop offset="100%" stop-color="#ffffff" stop-opacity="0.12" />
          </linearGradient>
        </defs>
        <path d="M0 192C260 90 446 242 698 153C938 68 1110 52 1440 119V270H0Z" fill="url(#river-blue)" />
        <path d="M0 221C258 143 470 257 737 179C1012 99 1190 105 1440 156V270H0Z" fill="url(#river-light)" />
        <path d="M-40 205C240 107 478 250 720 164C972 74 1188 78 1480 143" fill="none" stroke="#ffffff" stroke-opacity="0.5" stroke-width="2" />
      </svg>
    </section>

    <!-- ── 바로가기 카드 (4열) ────────────────────── -->
    <section class="shortcuts-section">
      <div class="inner">
        <div class="shortcut-grid">
          <nuxt-link to="/sermons" class="shortcut-card">
            <div class="sc-icon mn-red">
              <svg viewBox="0 0 24 24" fill="none"><path d="M21 5c-1.11-.35-2.33-.5-3.5-.5-1.95 0-4.05.4-5.5 1.5-1.45-1.1-3.55-1.5-5.5-1.5S2.45 4.9 1 6v14.65c0 .25.25.5.5.5.1 0 .15-.05.25-.05C3.1 20.45 5.05 20 6.5 20c1.95 0 4.05.4 5.5 1.5 1.35-.85 3.8-1.5 5.5-1.5 1.65 0 3.35.3 4.75 1.05.1.05.15.05.25.05.25 0 .5-.25.5-.5V6c-.6-.45-1.25-.75-2-1z" fill="currentColor"/></svg>
            </div>
            <div class="sc-text">
              <h3>{{ t('home.shortcut.sermonsTitle') }}</h3>
              <p>{{ t('home.shortcut.sermonsDesc') }}</p>
            </div>
            <span class="sc-arrow">→</span>
          </nuxt-link>

          <nuxt-link to="/notices" class="shortcut-card">
            <div class="sc-icon mn-blue">
              <svg viewBox="0 0 24 24" fill="none"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H5.17L4 17.17V4h16v12z" fill="currentColor"/></svg>
            </div>
            <div class="sc-text">
              <h3>{{ t('home.shortcut.noticesTitle') }}</h3>
              <p>{{ t('home.shortcut.noticesDesc') }}</p>
            </div>
            <span class="sc-arrow">→</span>
          </nuxt-link>

          <nuxt-link to="/qt" class="shortcut-card">
            <div class="sc-icon mn-red">
              <svg viewBox="0 0 24 24" fill="none"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="currentColor"/></svg>
            </div>
            <div class="sc-text">
              <h3>{{ t('home.shortcut.qtTitle') }}</h3>
              <p>{{ t('home.shortcut.qtDesc') }}</p>
            </div>
            <span class="sc-arrow">→</span>
          </nuxt-link>

          <nuxt-link to="/events" class="shortcut-card">
            <div class="sc-icon mn-blue">
              <svg viewBox="0 0 24 24" fill="none"><path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V9h14v10zM7 11h5v5H7z" fill="currentColor"/></svg>
            </div>
            <div class="sc-text">
              <h3>{{ t('home.shortcut.eventsTitle') }}</h3>
              <p>{{ t('home.shortcut.eventsDesc') }}</p>
            </div>
            <span class="sc-arrow">→</span>
          </nuxt-link>
        </div>
      </div>
    </section>

    <!-- ── 하단 3열 정보 섹션 ──────────────────────── -->
    <section class="info-section">
      <div class="inner">
        <div class="info-grid">

          <!-- 최근 설교 -->
          <div class="info-card">
            <h2 class="info-title">
              <svg viewBox="0 0 24 24" fill="none" width="18" height="18"><path d="M8 5v14l11-7z" fill="currentColor"/></svg>
              {{ t('home.recentSermon') }}
            </h2>
            <div class="sermon-card">
              <div class="sermon-thumb">
                <img src="https://picsum.photos/seed/sermon/280/160" :alt="t('home.recentSermon')" />
              </div>
              <div class="sermon-info">
                <h3>{{ t('home.sermonTitle') }}</h3>
                <p class="sermon-meta">{{ t('home.sermonPassage') }}</p>
                <p class="sermon-meta">{{ t('home.sermonDate') }}</p>
                <button class="btn btn-secondary btn-sm">{{ t('home.watchSermon') }}</button>
              </div>
            </div>
          </div>

          <!-- 교회 소식 -->
          <div class="info-card">
            <h2 class="info-title">
              <svg viewBox="0 0 24 24" fill="none" width="18" height="18"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" fill="currentColor"/></svg>
              {{ t('home.churchNews') }}
            </h2>
            <ul class="news-list">
              <li>
                <span class="news-text">{{ t('home.news.retreat') }}</span>
                <span class="news-date">05.21</span>
              </li>
              <li>
                <span class="news-text">{{ t('home.news.bazaar') }}</span>
                <span class="news-date">05.18</span>
              </li>
              <li>
                <span class="news-text">{{ t('home.news.welcome') }}</span>
                <span class="news-date">05.17</span>
              </li>
            </ul>
            <nuxt-link to="/notices" class="more-link">{{ t('home.more') }}</nuxt-link>
          </div>

          <!-- 예배 안내 -->
          <div class="info-card">
            <h2 class="info-title">
              <svg viewBox="0 0 24 24" fill="none" width="18" height="18"><path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V9h14v10z" fill="currentColor"/></svg>
              {{ t('home.worshipGuide') }}
            </h2>
            <table class="schedule-table">
              <tbody>
                <tr>
                  <td class="sch-name">{{ t('home.worship.sunday') }}</td>
                  <td class="sch-time">{{ t('home.worship.sundayTime') }}</td>
                </tr>
                <tr>
                  <td class="sch-name">{{ t('home.worship.wednesday') }}</td>
                  <td class="sch-time">{{ t('home.worship.wednesdayTime') }}</td>
                </tr>
                <tr>
                  <td class="sch-name">{{ t('home.worship.dawn') }}</td>
                  <td class="sch-time">{{ t('home.worship.dawnTime') }}</td>
                </tr>
              </tbody>
            </table>
            <nuxt-link to="/events" class="more-link">{{ t('home.allSchedule') }}</nuxt-link>
          </div>

        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
const { language, t } = useLanguage()
</script>

<style lang="scss" scoped>
.inner {
  width: 100%;
  max-width: 1280px;
  margin: 0 auto;
  padding: 0;
}

.home-page {
  position: relative;
  isolation: isolate;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  min-height: calc(100vh - 64px);
  min-width: 0;
  background:
    radial-gradient(circle at 78% 18%, rgba(#278bd4, 0.1), transparent 30%),
    radial-gradient(circle at 24% 12%, rgba(#d93652, 0.055), transparent 24%),
    linear-gradient(180deg, #f8fbff 0%, #f5f8fc 100%);
}

// ── 히어로 섹션 (풀와이드 배경) ──────────────────
.hero-section {
  position: relative;
  width: 100%;
  min-height: 600px;
  display: flex;
  align-items: center;
  overflow: hidden;
  padding: 60px clamp(24px, 5vw, 72px) 112px;
  background: url('/images/bg_03.webp') 78% center / cover no-repeat;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(
      90deg,
      rgba(#f7fbff, 0.99) 0%,
      rgba(#f7fbff, 0.96) 38%,
      rgba(#f7fbff, 0.7) 67%,
      rgba(#f7fbff, 0.34) 100%
    );
  }

  &::after {
    content: '';
    position: absolute;
    inset: auto 0 0;
    height: 90px;
    background: linear-gradient(180deg, transparent, rgba(#f5f8fc, 0.9));
    pointer-events: none;
  }
}

.hero-inner {
  position: relative;
  z-index: 2;
  width: 100%;
  max-width: 1280px;
  margin: 0 auto;
}

.hero-copy {
  position: relative;
  z-index: 2;
  width: min(780px, 68%);
  text-align: left;

  > * {
    animation: verse-reveal 0.65s ease both;
  }

  > :nth-child(2) { animation-delay: 0.08s; }
  > :nth-child(3) { animation-delay: 0.16s; }
  > :nth-child(4) { animation-delay: 0.22s; }
  > :nth-child(5) { animation-delay: 0.3s; }
}

@keyframes verse-reveal {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.mongol-identity {
  position: absolute;
  z-index: 1;
  top: 50%;
  right: 1%;
  width: min(380px, 31vw);
  transform: translateY(-48%);
  opacity: 0.11;
  pointer-events: none;

  img {
    display: block;
    width: 100%;
    filter: sepia(1) saturate(2) hue-rotate(162deg);
  }
}

.nalaikh-point {
  position: absolute;
  right: 27%;
  bottom: 32%;
  width: 9px;
  height: 9px;
  border: 2px solid #fff;
  border-radius: 50%;
  background: $mn-red;
  box-shadow: 0 0 0 8px rgba($mn-red, 0.16), 0 0 20px rgba($mn-red, 0.45);
}

.hero-wave {
  position: absolute;
  z-index: 1;
  left: -2%;
  bottom: -36px;
  width: 104%;
  height: 270px;
  pointer-events: none;
  animation: river-drift 12s ease-in-out infinite alternate;
}

@keyframes river-drift {
  from { transform: translate3d(-10px, 3px, 0) scaleX(1.01); }
  to { transform: translate3d(12px, -3px, 0) scaleX(1.02); }
}

.verse-tag {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: $gradient-mn;
  color: #fff;
  font-size: 0.78rem;
  font-weight: 800;
  padding: 7px 16px;
  border-radius: $radius-full;
  letter-spacing: 0.04em;
  margin-bottom: 25px;
  box-shadow: 0 7px 18px rgba($mn-blue, 0.16);
}

.drop-icon {
  width: 9px;
  height: 12px;
  border-radius: 60% 40% 60% 40%;
  background: rgba(#fff, 0.9);
  transform: rotate(45deg);
}

.verse-korean {
  font-family: $font-title;
  font-size: clamp(2rem, 2.7vw, 2.5rem);
  font-weight: 700;
  color: #18243a;
  line-height: 1.62;
  min-height: 3.25em;
  margin-bottom: 22px;
  letter-spacing: -0.035em;
  text-wrap: balance;
  white-space: pre-line;
}

.verse-rule {
  width: 68px;
  height: 3px;
  margin-bottom: 22px;
  border-radius: $radius-full;
  background: linear-gradient(90deg, $mn-blue, rgba($mn-red, 0.72));
}

.verse-mongolian {
  max-width: 720px;
  min-height: 3.4em;
  margin-bottom: 17px;
  font-size: 1.02rem;
  color: #697487;
  line-height: 1.75;
  font-style: italic;
  white-space: pre-line;
}

.verse-ref {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 0.92rem;
  font-weight: 800;
  color: $mn-blue;
  letter-spacing: 0.04em;

  &::before {
    content: '';
    width: 20px;
    height: 1px;
    background: rgba($mn-blue, 0.55);
  }
}

// ── 바로가기 섹션 ────────────────────────────────
.shortcuts-section {
  position: relative;
  z-index: 10;
  width: 100%;
  margin-top: -74px;
  padding: 0 clamp(24px, 5vw, 72px) 42px;
}

.shortcut-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 22px;

  @media (max-width: 900px) {
    grid-template-columns: repeat(2, 1fr);
  }
  @media (max-width: 500px) {
    grid-template-columns: 1fr;
  }
}

.shortcut-card {
  display: flex;
  align-items: center;
  gap: 18px;
  min-height: 136px;
  padding: 25px 24px;
  background: rgba(#fff, 0.97);
  border: 1px solid rgba(#dce5ef, 0.9);
  border-radius: 18px;
  box-shadow: 0 14px 34px rgba(#1d3255, 0.09), 0 3px 10px rgba(#1d3255, 0.045);
  text-decoration: none;
  cursor: pointer;
  transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;

  &:hover {
    border-color: rgba($mn-blue, 0.25);
    box-shadow: 0 22px 44px rgba(#1d3255, 0.14), 0 5px 14px rgba(#1d3255, 0.07);
    transform: translateY(-5px);
  }

  &:focus-visible {
    outline: 3px solid rgba($mn-blue, 0.28);
    outline-offset: 3px;
  }
}

.sc-icon {
  width: 54px;
  height: 54px;
  border-radius: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 8px 16px rgba(#1d3255, 0.12);

  svg {
    width: 24px;
    height: 24px;
    color: #fff;
  }

  &.mn-red  { background: $mn-red; }
  &.mn-blue { background: $mn-blue; }
}

.sc-text {
  flex: 1;
  min-width: 0;

  h3 {
    margin-bottom: 5px;
    font-size: 1.02rem;
    font-weight: 800;
    color: #18243a;
    line-height: 1.35;
  }

  p {
    font-size: 0.8rem;
    color: #8a94a5;
    line-height: 1.5;
  }
}

.sc-arrow {
  align-self: flex-start;
  margin-left: auto;
  font-size: 1.05rem;
  color: $mn-blue;
  flex-shrink: 0;
  transition: transform 0.2s ease, color 0.2s ease;
}

.shortcut-card:hover .sc-arrow {
  color: $mn-red;
  transform: translateX(4px);
}

// ── 3열 정보 섹션 ────────────────────────────────
.info-section {
  width: 100%;
  padding: 0 clamp(24px, 5vw, 72px) 84px;
}

.info-grid {
  display: grid;
  grid-template-columns: 1.1fr 1fr 1fr;
  overflow: hidden;
  background: rgba(#fff, 0.96);
  border: 1px solid rgba(#e4eaf2, 0.92);
  border-radius: 22px;
  box-shadow: 0 16px 40px rgba(#1e3252, 0.075);

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
}

.info-card {
  min-width: 0;
  padding: 30px;

  & + & {
    border-left: 1px solid #e7edf5;
  }
}

.info-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 1rem;
  font-weight: 800;
  color: #18243a;
  margin-bottom: 22px;
  padding-bottom: 15px;
  border-bottom: 1px solid #e7edf5;

  svg {
    color: $mn-blue;
    flex-shrink: 0;
  }
}

// 최근 설교
.sermon-card {
  display: flex;
  gap: 18px;

  @media (max-width: 500px) {
    flex-direction: column;
  }
}

.sermon-thumb {
  width: 160px;
  min-height: 118px;
  flex-shrink: 0;
  border-radius: 12px;
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
}

.sermon-info {
  display: flex;
  flex-direction: column;
  gap: 4px;

  h3 {
    font-size: 0.96rem;
    font-weight: 800;
    color: #18243a;
    margin-bottom: 4px;
  }

  .sermon-meta {
    font-size: 0.78rem;
    color: #8a94a5;
  }

  .btn-sm {
    margin-top: auto;
    padding: 6px 14px;
    font-size: 0.78rem;
    width: fit-content;
  }
}

// 교회 소식
.news-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 0;

  li {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 0;
    border-bottom: 1px solid rgba($border-color, 0.6);

    &:last-child {
      border-bottom: none;
    }
  }
}

.news-text {
  font-size: 0.85rem;
  color: #354156;
  font-weight: 600;
}

.news-date {
  font-size: 0.78rem;
  color: #98a2b2;
  flex-shrink: 0;
  margin-left: 12px;
}

.more-link {
  display: inline-block;
  margin-top: 14px;
  font-size: 0.82rem;
  font-weight: 600;
  color: $mn-blue;
  text-decoration: none;
  transition: all 0.15s ease;

  &:hover {
    color: $mn-red;
  }
}

// 예배 안내
.schedule-table {
  width: 100%;
  border-collapse: collapse;

  tr {
    border-bottom: 1px solid rgba($border-color, 0.6);

    &:last-child {
      border-bottom: none;
    }
  }

  td {
    padding: 10px 0;
    font-size: 0.85rem;
  }

  .sch-name {
    font-weight: 700;
    color: #354156;
  }

  .sch-time {
    text-align: right;
    color: $text-secondary;
    font-size: 0.82rem;
  }
}

@media (max-width: 1100px) {
  .hero-copy {
    width: min(760px, 76%);
  }

  .shortcut-card {
    padding: 22px 20px;
  }

  .sc-icon {
    width: 50px;
    height: 50px;
  }

  .info-card {
    padding: 26px;
  }

  .sermon-card {
    flex-direction: column;
  }

  .sermon-thumb {
    width: 100%;
    height: 150px;
  }
}

@media (max-width: 900px) {
  .hero-section {
    min-height: 560px;
    padding-bottom: 102px;
    background-position: 70% center;
  }

  .hero-copy {
    width: 82%;
  }

  .verse-korean {
    font-size: clamp(1.75rem, 4vw, 2.1rem);
  }

  .mongol-identity {
    right: -8%;
    width: 40vw;
  }

  .shortcuts-section {
    margin-top: -64px;
  }

  .info-card + .info-card {
    border-top: 1px solid #e7edf5;
    border-left: 0;
  }

  .sermon-card {
    flex-direction: row;
  }

  .sermon-thumb {
    width: 180px;
    height: 130px;
  }
}

@media (max-width: 600px) {
  .hero-section {
    min-height: 530px;
    align-items: flex-start;
    padding: 52px 20px 94px;
    background-position: 68% center;

    &::before {
      background: linear-gradient(90deg, rgba(#f7fbff, 0.98), rgba(#f7fbff, 0.88));
    }
  }

  .hero-copy {
    width: 100%;
  }

  .verse-tag {
    margin-bottom: 20px;
  }

  .verse-korean {
    min-height: 5.1em;
    font-size: 1.55rem;
    line-height: 1.68;
  }

  .verse-mongolian {
    min-height: 5.25em;
    font-size: 0.88rem;
  }

  .mongol-identity {
    display: none;
  }

  .hero-wave {
    height: 180px;
    opacity: 0.72;
  }

  .shortcuts-section {
    margin-top: -48px;
    padding: 0 16px 32px;
  }

  .shortcut-grid {
    gap: 14px;
  }

  .shortcut-card {
    min-height: 112px;
    padding: 20px;
  }

  .info-section {
    padding: 0 16px 56px;
  }

  .info-card {
    padding: 24px 20px;
  }

  .sermon-card {
    flex-direction: column;
  }

  .sermon-thumb {
    width: 100%;
    height: 180px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .hero-wave,
  .hero-copy > *,
  .shortcut-card,
  .sc-arrow {
    animation: none;
    transition: none;
  }
}
</style>
