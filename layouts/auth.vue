<template>
  <div class="auth-layout">
    <!-- 좌측 브랜딩 패널 -->
    <div class="auth-brand">
      <div class="brand-inner">
        <div class="brand-logo-wrap">
          <img src="/images/church-logo-v1.png" alt="" class="brand-logo-mark" />
          <div class="brand-logo-text">
            <span class="brand-name">{{ t('church.fullName') }}</span>
            <span class="brand-sub">River of Life Church</span>
          </div>
        </div>
        <blockquote class="brand-verse">
          <p>{{ t('home.verseMain') }}</p>
          <cite>{{ t('home.verseRef') }}</cite>
        </blockquote>
      </div>
      <!-- 몽골 국기 세로 바 -->
      <div class="mn-flag-bar">
        <div class="flag-stripe red"></div>
        <div class="flag-stripe blue"></div>
        <div class="flag-stripe red"></div>
      </div>
    </div>

    <!-- 우측 폼 영역 -->
    <div class="auth-form-area">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
const { t } = useLanguage()
</script>

<style lang="scss" scoped>
.auth-layout {
  display: flex;
  min-width: 0;
  min-height: 100vh;
  min-height: 100dvh;
  overflow-x: hidden;
  background: $bg-main;
}

// 좌측 브랜딩 패널
.auth-brand {
  width: 420px;
  background: $bg-sidebar;
  border-right: 1px solid $border-color;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
  flex-shrink: 0;

  @media (max-width: 768px) {
    display: none;
  }
}

.brand-inner {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 48px 40px;
  gap: 40px;
}

.brand-logo-wrap {
  display: flex;
  align-items: center;
  gap: 14px;
}

.brand-logo-mark {
  width: 58px;
  height: 72px;
  display: block;
  object-fit: contain;
  filter: drop-shadow(0 5px 10px rgba(#174c5b,.18));
  flex-shrink: 0;
}

.brand-logo-text {
  display: flex;
  flex-direction: column;
}

.brand-name {
  font-family: $font-title;
  font-size: 1.2rem;
  font-weight: 800;
  color: $text-primary;
  letter-spacing: -0.02em;
}

.brand-sub {
  font-size: 0.78rem;
  font-weight: 500;
  color: $text-muted;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.brand-verse {
  border-left: 3px solid;
  border-left-color: $mn-blue;
  padding-left: 16px;

  p {
    font-size: 1rem;
    color: $text-primary;
    font-style: italic;
    line-height: 1.7;
    white-space: pre-line;
    margin-bottom: 8px;
  }

  cite {
    font-size: 0.8rem;
    font-weight: 600;
    color: $mn-blue;
    font-style: normal;
  }
}

// 몽골 국기 세로 스트라이프 바
.mn-flag-bar {
  display: flex;
  height: 6px;
  width: 100%;
}

.flag-stripe {
  flex: 1;
  &.red  { background: $mn-red; }
  &.blue { background: $mn-blue; }
}

// 우측 폼 영역
.auth-form-area {
  width: 100%;
  min-width: 0;
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 24px;
  background: $bg-main;
}

@media (max-width: 768px) {
  .auth-form-area { align-items: flex-start; padding: max(24px, env(safe-area-inset-top)) 16px max(24px, env(safe-area-inset-bottom)); }
}
</style>
