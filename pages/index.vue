<template>
  <div class="home-page">

    <!-- ── 히어로 영역 (풀와이드 배경 + 말씀) ──────── -->
    <section class="hero-section">
      <div class="hero-bg"></div>
      <div class="hero-inner">
        <div class="verse-tag">오늘의 말씀</div>
        <p class="verse-korean" ref="koreanVerseRef"></p>
        <p class="verse-mongolian" ref="mongolianVerseRef"></p>
        <span class="verse-ref" ref="verseRefRef">요한복음 4:14 · Иохан 4:14</span>
      </div>
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
              <h3>이번주 말씀</h3>
              <p>주일 강단 설교 아카이브</p>
            </div>
            <span class="sc-arrow">→</span>
          </nuxt-link>

          <nuxt-link to="/notices" class="shortcut-card">
            <div class="sc-icon mn-blue">
              <svg viewBox="0 0 24 24" fill="none"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H5.17L4 17.17V4h16v12z" fill="currentColor"/></svg>
            </div>
            <div class="sc-text">
              <h3>공지사항</h3>
              <p>교회 주요 소식 및 안내</p>
            </div>
            <span class="sc-arrow">→</span>
          </nuxt-link>

          <nuxt-link to="/qt" class="shortcut-card">
            <div class="sc-icon mn-red">
              <svg viewBox="0 0 24 24" fill="none"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="currentColor"/></svg>
            </div>
            <div class="sc-text">
              <h3>QT 묵상 나눔</h3>
              <p>오늘의 말씀 묵상 &amp; 나눔</p>
            </div>
            <span class="sc-arrow">→</span>
          </nuxt-link>

          <nuxt-link to="/events" class="shortcut-card">
            <div class="sc-icon mn-blue">
              <svg viewBox="0 0 24 24" fill="none"><path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V9h14v10zM7 11h5v5H7z" fill="currentColor"/></svg>
            </div>
            <div class="sc-text">
              <h3>성경 통독 릴레이</h3>
              <p>온 교회 함께하는 통독 레이스</p>
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
              최근 설교
            </h2>
            <div class="sermon-card">
              <div class="sermon-thumb">
                <img src="https://picsum.photos/seed/sermon/280/160" alt="설교 썸네일" />
              </div>
              <div class="sermon-info">
                <h3>생수의 강이 흐르는 삶</h3>
                <p class="sermon-meta">요한복음 7:37~39</p>
                <p class="sermon-meta">2024. 05. 19 · 주일 예배</p>
                <button class="btn btn-secondary btn-sm">설교 다시보기</button>
              </div>
            </div>
          </div>

          <!-- 교회 소식 -->
          <div class="info-card">
            <h2 class="info-title">
              <svg viewBox="0 0 24 24" fill="none" width="18" height="18"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" fill="currentColor"/></svg>
              교회 소식
            </h2>
            <ul class="news-list">
              <li>
                <span class="news-text">몽고동부 여름 수련회 안내</span>
                <span class="news-date">05.21</span>
              </li>
              <li>
                <span class="news-text">선교 바자회 안내</span>
                <span class="news-date">05.18</span>
              </li>
              <li>
                <span class="news-text">새가족 환영 모임</span>
                <span class="news-date">05.17</span>
              </li>
            </ul>
            <nuxt-link to="/notices" class="more-link">더보기 →</nuxt-link>
          </div>

          <!-- 예배 안내 -->
          <div class="info-card">
            <h2 class="info-title">
              <svg viewBox="0 0 24 24" fill="none" width="18" height="18"><path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V9h14v10z" fill="currentColor"/></svg>
              예배 안내
            </h2>
            <table class="schedule-table">
              <tbody>
                <tr>
                  <td class="sch-name">주일 예배</td>
                  <td class="sch-time">주일 오전 11:00</td>
                </tr>
                <tr>
                  <td class="sch-name">수요 예배</td>
                  <td class="sch-time">수요일 오후 7:30</td>
                </tr>
                <tr>
                  <td class="sch-name">새벽 기도회</td>
                  <td class="sch-time">월 ~ 금 오전 6:00</td>
                </tr>
              </tbody>
            </table>
            <nuxt-link to="/events" class="more-link">전체 일정 보기 →</nuxt-link>
          </div>

        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { gsap } from 'gsap'

const { userName } = useAuth()

const koreanVerseRef = ref<HTMLElement | null>(null)
const mongolianVerseRef = ref<HTMLElement | null>(null)
const verseRefRef = ref<HTMLElement | null>(null)

const krText = '" 내가 주는 물을 마시는 자는 영원히 목마르지 아니하리니\n내가 주는 물은 그 속에서 영생하도록 솟아나는 샘물이 되리라."'
const mnText = 'Харин миний өгөх уснаас уух хүн ч хэзээ ч цангахгүй.\nХарин миний өгөх ус тэр хүний дотор мөнх амьдрал уруу оргилох булгийн ус болно.'

onMounted(() => {
  if (!process.client) return

  const prepareChars = (el: HTMLElement, text: string) => {
    el.innerHTML = text.split('').map(char => {
      if (char === '\n') return '<br/>'
      return `<span style="opacity:0;display:inline">${char === ' ' ? '&nbsp;' : char}</span>`
    }).join('')
    return el.querySelectorAll('span')
  }

  const krSpans = koreanVerseRef.value ? prepareChars(koreanVerseRef.value, krText) : []
  const mnSpans = mongolianVerseRef.value ? prepareChars(mongolianVerseRef.value, mnText) : []
  if (verseRefRef.value) gsap.set(verseRefRef.value, { opacity: 0 })

  const tl = gsap.timeline()

  if (krSpans.length) {
    tl.to(krSpans, {
      opacity: 1,
      duration: 0.4,
      stagger: 0.02,
      ease: 'power2.out',
    })
  }

  tl.to({}, { duration: 0.3 })

  if (mnSpans.length) {
    tl.to(mnSpans, {
      opacity: 1,
      duration: 0.35,
      stagger: 0.012,
      ease: 'power2.out',
    })
  }

  if (verseRefRef.value) tl.to(verseRefRef.value, { opacity: 1, duration: 0.8 }, '+=0.3')
})
</script>

<style lang="scss" scoped>
.inner {
  padding: 0;
}


.home-page {
  display: flex;
  flex-direction: column;
  
}

// ── 히어로 섹션 (풀와이드 배경) ──────────────────
.hero-section {
  position: relative;
  overflow: hidden;
  min-height: 340px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 min(100px, 10vw);

}

.hero-bg {
  position: absolute;
  inset: 0;
  background:
    linear-gradient(135deg, rgba(#a8c8ff, 0.6) 0%, rgba(#d4b8ff, 0.3) 30%, rgba(#fff, 0.1) 60%, rgba(#87ceeb, 0.4) 100%),
    linear-gradient(180deg, #e8f0fe 0%, #f0e6ff 40%, #dbeafe 70%, #f5f6fa 100%);
  background-size: cover;
  z-index: 0;

  // 하단 페이드아웃
  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 80px;
    background: linear-gradient(transparent, $bg-main);
  }
}

.hero-inner {
  position: relative;
  z-index: 1;
  text-align: center;
  max-width: 800px;

}

.verse-tag {
  display: inline-block;
  background: $gradient-mn;
  color: #fff;
  font-size: 0.72rem;
  font-weight: 700;
  padding: 5px 16px;
  border-radius: $radius-full;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin-bottom: 20px;
}

.verse-korean {
  font-family: $font-title;
  font-size: 1.35rem;
  font-weight: 800;
  color: $text-primary;
  line-height: 2;
  height: 5.4em; // 고정 높이 (2줄 + 여유)
  margin-bottom: 16px;
}

.verse-mongolian {
  font-size: 0.92rem;
  color: $text-secondary;
  line-height: 1.8;
  font-style: italic;
  height: 3.6em; // 고정 높이 (2줄)
  margin-bottom: 12px;
}

.verse-ref {
  font-size: 0.85rem;
  font-weight: 700;
  color: $mn-blue;
  letter-spacing: 0.04em;
}

// ── 바로가기 섹션 ────────────────────────────────
.shortcuts-section {
  
  position: relative;
  z-index: 2;
  padding: 0 min(100px, 10vw) 32px;

}

.shortcut-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  

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
  gap: 14px;
  padding: 16px 18px;
  background: $bg-card;
  border: 1px solid $border-color;
  border-radius: $radius-md;
  box-shadow: $shadow-sm;
  text-decoration: none;
  cursor: pointer;
  transition: $transition-smooth;

  &:hover {
    box-shadow: $shadow-md;
    transform: translateY(-2px);
  }
}

.sc-icon {
  width: 38px;
  height: 38px;
  border-radius: $radius-sm;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  svg {
    width: 18px;
    height: 18px;
    color: #fff;
  }

  &.mn-red  { background: $mn-red; }
  &.mn-blue { background: $mn-blue; }
}

.sc-text {
  flex: 1;
  min-width: 0;

  h3 {
    font-size: 0.88rem;
    font-weight: 700;
    color: $text-primary;
    margin-bottom: 1px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  p {
    font-size: 0.75rem;
    color: $text-muted;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}

.sc-arrow {
  font-size: 0.9rem;
  color: $mn-blue;
  flex-shrink: 0;
  transition: all 0.15s ease;
}

.shortcut-card:hover .sc-arrow {
  transform: translateX(3px);
}

// ── 3열 정보 섹션 ────────────────────────────────
.info-section {
  padding: 0 min(100px, 10vw) 48px
}

.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 20px;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
}

.info-card {
  background: $bg-card;
  border: 1px solid $border-color;
  border-radius: $radius-md;
  padding: 22px 24px;
  box-shadow: $shadow-sm;
}

.info-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.92rem;
  font-weight: 700;
  color: $text-primary;
  margin-bottom: 18px;
  padding-bottom: 12px;
  border-bottom: 1px solid $border-color;

  svg {
    color: $mn-blue;
    flex-shrink: 0;
  }
}

// 최근 설교
.sermon-card {
  display: flex;
  gap: 16px;

  @media (max-width: 500px) {
    flex-direction: column;
  }
}

.sermon-thumb {
  width: 140px;
  flex-shrink: 0;
  border-radius: $radius-sm;
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
    font-size: 0.92rem;
    font-weight: 700;
    color: $text-primary;
    margin-bottom: 2px;
  }

  .sermon-meta {
    font-size: 0.78rem;
    color: $text-muted;
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
  color: $text-primary;
  font-weight: 500;
}

.news-date {
  font-size: 0.78rem;
  color: $text-muted;
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
    font-weight: 600;
    color: $text-primary;
  }

  .sch-time {
    text-align: right;
    color: $text-secondary;
    font-size: 0.82rem;
  }
}
</style>
