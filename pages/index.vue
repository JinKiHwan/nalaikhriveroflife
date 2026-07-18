<template>
  <div class="home-page">

    <!-- 말씀 구절 (보더 없이 중앙 배치, 메시지에 포커싱) -->
    <section class="verse-section">
      <div class="verse-tag">오늘의 말씀</div>
      <p class="verse-korean" ref="koreanVerseRef"></p>
      <p class="verse-mongolian" ref="mongolianVerseRef"></p>
      <span class="verse-ref" ref="verseRefRef">요한복음 4:14 · Иохан 4:14</span>
      <div class="gradient-bar verse-bar"></div>
    </section>

    <!-- 바로가기 카드 그리드 -->
    <section class="shortcut-section">
      <div class="section-header">
        <h2 class="section-title">빠른 바로가기</h2>
      </div>
      <div class="shortcut-grid">
        <nuxt-link to="/sermons" class="shortcut-card card hoverable">
          <div class="sc-icon-wrap mn-red">
            <svg viewBox="0 0 24 24" fill="none"><path d="M21 5c-1.11-.35-2.33-.5-3.5-.5-1.95 0-4.05.4-5.5 1.5-1.45-1.1-3.55-1.5-5.5-1.5S2.45 4.9 1 6v14.65c0 .25.25.5.5.5.1 0 .15-.05.25-.05C3.1 20.45 5.05 20 6.5 20c1.95 0 4.05.4 5.5 1.5 1.35-.85 3.8-1.5 5.5-1.5 1.65 0 3.35.3 4.75 1.05.1.05.15.05.25.05.25 0 .5-.25.5-.5V6c-.6-.45-1.25-.75-2-1z" fill="currentColor"/></svg>
          </div>
          <div class="sc-content">
            <h3>이번주 말씀</h3>
            <p>주일 강단 설교 아카이브</p>
          </div>
          <span class="sc-arrow">→</span>
        </nuxt-link>

        <nuxt-link to="/notices" class="shortcut-card card hoverable">
          <div class="sc-icon-wrap mn-blue">
            <svg viewBox="0 0 24 24" fill="none"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" fill="currentColor"/></svg>
          </div>
          <div class="sc-content">
            <h3>공지사항</h3>
            <p>교회 주간 광고 및 안내</p>
          </div>
          <span class="sc-arrow">→</span>
        </nuxt-link>

        <nuxt-link to="/qt" class="shortcut-card card hoverable">
          <div class="sc-icon-wrap mn-red">
            <svg viewBox="0 0 24 24" fill="none"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="currentColor"/></svg>
          </div>
          <div class="sc-content">
            <h3>QT 묵상 나눔</h3>
            <p>오늘의 말씀 묵상 &amp; 댓글</p>
          </div>
          <span class="sc-arrow">→</span>
        </nuxt-link>

        <nuxt-link to="/events" class="shortcut-card card hoverable">
          <div class="sc-icon-wrap mn-blue">
            <svg viewBox="0 0 24 24" fill="none"><path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V9h14v10zM7 11h5v5H7z" fill="currentColor"/></svg>
          </div>
          <div class="sc-content">
            <h3>성경 통독 릴레이</h3>
            <p>온 교회 함께하는 통독 레이스</p>
          </div>
          <span class="sc-arrow">→</span>
        </nuxt-link>
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

const krText = '"내가 주는 물을 마시는 자는 영원히 목마르지 아니하리니 내가 주는 물은 그 속에서 영생하도록 솟아나는 샘물이 되리라."'
const mnText = '"Харин миний өгөх уснаас уух хэн ч хэзээ ч цангахгүй. Харин миний өгөх ус тэр хүний дотор мөнх амьдрал уруу оргилох булгийн ус болно."'

onMounted(() => {
  if (!process.client) return

  // 각 글자를 span으로 감싸서 미리 배치 (opacity: 0)
  const prepareChars = (el: HTMLElement, text: string) => {
    el.innerHTML = text.split('').map(char =>
      `<span style="opacity:0;display:inline">${char === ' ' ? '&nbsp;' : char}</span>`
    ).join('')
    return el.querySelectorAll('span')
  }

  const krSpans = koreanVerseRef.value ? prepareChars(koreanVerseRef.value, krText) : []
  const mnSpans = mongolianVerseRef.value ? prepareChars(mongolianVerseRef.value, mnText) : []
  if (verseRefRef.value) gsap.set(verseRefRef.value, { opacity: 0 })

  const tl = gsap.timeline()

  // 한국어 — 한 글자씩 opacity 페이드인
  if (krSpans.length) {
    tl.to(krSpans, {
      opacity: 1,
      duration: 0.4,
      stagger: 0.025,
      ease: 'power2.out',
    })
  }

  tl.to({}, { duration: 0.3 })

  // 몽골어 — 한 글자씩 opacity 페이드인
  if (mnSpans.length) {
    tl.to(mnSpans, {
      opacity: 1,
      duration: 0.35,
      stagger: 0.015,
      ease: 'power2.out',
    })
  }

  // 구절 출처
  if (verseRefRef.value) tl.to(verseRefRef.value, { opacity: 1, duration: 0.8 }, '+=0.3')
})
</script>

<style lang="scss" scoped>
.home-page {
  display: flex;
  flex-direction: column;
  gap: 48px;
}

// ── 말씀 섹션 (보더 없이 중앙 배치) ──────────────
.verse-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 16px;
  padding: 60px 24px 48px;
  max-width: 700px;
  margin: 0 auto;
}

.verse-tag {
  display: inline-block;
  background: $gradient-mn;
  color: #fff;
  font-size: 0.72rem;
  font-weight: 700;
  padding: 4px 14px;
  border-radius: $radius-full;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.verse-korean {
  font-family: $font-title;
  font-size: 1.25rem;
  font-weight: 700;
  color: $text-primary;
  line-height: 1.8;
  height: 4.5em; // 고정 높이 (약 2줄) — 타이핑 시 흔들림 방지
}

.verse-mongolian {
  font-size: 0.95rem;
  color: $text-secondary;
  line-height: 1.7;
  font-style: italic;
  height: 5.1em; // 고정 높이 (약 3줄) — 타이핑 시 흔들림 방지
}

.verse-ref {
  font-size: 0.82rem;
  font-weight: 700;
  color: $mn-blue;
  letter-spacing: 0.04em;
  margin-top: 4px;
}

.verse-bar {
  width: 80px;
  margin-top: 8px;
}

// ── 섹션 헤더 ──────────────────────────────────
.section-header {
  margin-bottom: 16px;
}

.section-title {
  font-size: 1rem;
  font-weight: 700;
  color: $text-secondary;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

// ── 바로가기 그리드 ─────────────────────────────
.shortcut-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
}

.shortcut-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 18px 20px;
  text-decoration: none;
  cursor: pointer;
  border-radius: $radius-md;
}

.sc-icon-wrap {
  width: 42px;
  height: 42px;
  border-radius: $radius-sm;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  svg {
    width: 20px;
    height: 20px;
    color: #fff;
  }

  &.mn-red  { background: $mn-red; }
  &.mn-blue { background: $mn-blue; }
}

.sc-content {
  flex: 1;

  h3 {
    font-size: 0.95rem;
    font-weight: 700;
    color: $text-primary;
    margin-bottom: 2px;
  }

  p {
    font-size: 0.82rem;
    color: $text-secondary;
  }
}

.sc-arrow {
  font-size: 1rem;
  color: $text-muted;
  transition: all 0.15s ease;
}

.shortcut-card:hover .sc-arrow {
  color: $mn-blue;
  transform: translateX(3px);
}
</style>
