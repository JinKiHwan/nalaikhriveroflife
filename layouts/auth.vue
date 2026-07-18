<template>
  <div class="auth-layout">
    <!-- 좌측 브랜딩 패널 -->
    <div class="auth-brand">
      <div class="brand-inner">
        <div class="brand-logo-wrap">
          <div class="brand-logo-mark">✝</div>
          <div class="brand-logo-text">
            <span class="brand-name">날라흐 생명수 교회</span>
            <span class="brand-sub">River of Life Church</span>
          </div>
        </div>
        <blockquote class="brand-verse">
          <p>"내가 주는 물을 마시는 자는 영원히 목마르지 아니하리니"</p>
          <cite>요한복음 4:14</cite>
        </blockquote>
      </div>
      <!-- 몽골 국기 그라데이션 세로 바 -->
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

<style lang="scss" scoped>
.auth-layout {
  display: flex;
  min-height: 100vh;
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
  width: 48px;
  height: 48px;
  border-radius: $radius-md;
  background: $gradient-mn;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.4rem;
  box-shadow: 0 4px 14px rgba($mn-red, 0.3);
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
  border-image: $gradient-mn 1;
  padding-left: 16px;

  p {
    font-size: 1rem;
    color: $text-primary;
    font-style: italic;
    line-height: 1.7;
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
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 24px;
  background: $bg-main;
}
</style>
