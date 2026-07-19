<template>
  <div class="app-shell" :class="{ 'sidebar-collapsed': isCollapsed }">

    <!-- ── 좌측 사이드바 ─────────────────────── -->
    <aside class="sidebar" :class="{ 'sidebar-open': isMobileMenuOpen, collapsed: isCollapsed }">
      <!-- 상단 로고 -->
      <div class="sidebar-logo">
        <div class="logo-mark">
          <span class="logo-cross">✝</span>
        </div>
        <transition name="fade-text">
          <div v-show="!isCollapsed" class="logo-text-wrap">
            <span class="logo-name">생명수 교회</span>
            <span class="logo-sub">날라흐</span>
          </div>
        </transition>
      </div>

      <!-- 상단 그라데이션 구분선 -->
      <div class="sidebar-divider"></div>

      <!-- 내비게이션 메뉴 -->
      <nav class="sidebar-nav">
        <nuxt-link
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          class="nav-item"
          active-class="active"
          :exact="item.exact"
          @mouseenter="(e: MouseEvent) => showTooltip(e, item.label)"
          @mouseleave="hideTooltip"
        >
          <svg class="nav-icon" viewBox="0 0 24 24" fill="none"><path :d="item.icon" fill="currentColor"/></svg>
          <span class="nav-label">{{ item.label }}</span>
        </nuxt-link>

        <!-- 교사 전용 -->
        <nuxt-link
          v-if="isTeacher"
          to="/teachers-room"
          class="nav-item"
          active-class="active"
          @mouseenter="(e: MouseEvent) => showTooltip(e, '선생님방')"
          @mouseleave="hideTooltip"
        >
          <svg class="nav-icon" viewBox="0 0 24 24" fill="none"><path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3zM5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z" fill="currentColor"/></svg>
          <span class="nav-label">선생님방</span>
        </nuxt-link>

        <!-- 관리자 전용 -->
        <nuxt-link
          v-if="isMaster"
          to="/admin"
          class="nav-item"
          active-class="active"
          @mouseenter="(e: MouseEvent) => showTooltip(e, '관리자')"
          @mouseleave="hideTooltip"
        >
          <svg class="nav-icon" viewBox="0 0 24 24" fill="none"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill="currentColor"/></svg>
          <span class="nav-label">관리자</span>
        </nuxt-link>
      </nav>

      <!-- 사이드바 접기/펼치기 버튼 -->
      <button class="collapse-toggle" @click="toggleCollapse" :title="isCollapsed ? '사이드바 펼치기' : '사이드바 접기'">
        <svg class="collapse-icon" :class="{ rotated: isCollapsed }" viewBox="0 0 24 24" fill="none">
          <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" fill="currentColor"/>
        </svg>
      </button>

      <!-- 하단 사용자 정보 -->
      <div class="sidebar-footer">
        <div class="user-card">
          <div
            class="user-avatar"
            @mouseenter="(e: MouseEvent) => showTooltip(e, `${userName} · ${roleLabel}`)"
            @mouseleave="hideTooltip"
          >
            {{ userName.charAt(0) }}
          </div>
          <transition name="fade-text">
            <div v-show="!isCollapsed" class="user-info">
              <span class="user-name">{{ userName }}</span>
              <span :class="['badge', `badge-${userRole}`]">{{ roleLabel }}</span>
            </div>
          </transition>
          <transition name="fade-text">
            <button v-show="!isCollapsed" @click="handleLogout" class="logout-btn" title="로그아웃">
              <svg viewBox="0 0 24 24" fill="none"><path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5-5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z" fill="currentColor"/></svg>
            </button>
          </transition>
        </div>
      </div>
    </aside>

    <!-- 모바일 오버레이 -->
    <div v-if="isMobileMenuOpen" class="mobile-overlay" @click="isMobileMenuOpen = false"></div>

    <!-- ── 우측 메인 영역 ──────────────────────── -->
    <div class="main-area" :style="pageBackgroundStyle">

      <!-- 상단 헤더 -->
      <header class="topbar">
        <!-- 모바일: 햄버거 메뉴 -->
        <button class="hamburger-btn mobile-only" @click="isMobileMenuOpen = !isMobileMenuOpen">
          <svg viewBox="0 0 24 24" fill="none"><path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" fill="currentColor"/></svg>
        </button>
        <span class="topbar-title mobile-only">날라흐 생명수 교회</span>

        <!-- 우측: 알림 + 사용자 -->
        <div class="topbar-right">
          <button class="topbar-icon-btn" title="알림">
            <svg viewBox="0 0 24 24" fill="none"><path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2zm-2 1H8v-6c0-2.48 1.51-4.5 4-4.5s4 2.02 4 4.5v6z" fill="currentColor"/></svg>
          </button>
          <div class="topbar-user">
            <div class="topbar-avatar">{{ userName.charAt(0) }}</div>
            <span class="topbar-role">{{ roleLabel }} ▾</span>
          </div>
        </div>
      </header>

      <!-- 콘텐츠 -->
      <main class="content-area">
        <slot />
      </main>
    </div>

    <!-- ── 말풍선 (Teleport → body) ──────────── -->
    <Teleport to="body">
      <transition name="tooltip-fade">
        <div
          v-if="tooltip.visible"
          class="sidebar-tooltip"
          :style="{ top: tooltip.top + 'px', left: tooltip.left + 'px' }"
        >
          {{ tooltip.text }}
        </div>
      </transition>
    </Teleport>

  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'

const { userRole, userName, isTeacher, isMaster, logout } = useAuth()
const route = useRoute()
const isMobileMenuOpen = ref(false)
const isCollapsed = ref(false)

const pageBackgroundStyle = computed<Record<string, string>>(() => {
  const path = route.path
  let image = '/images/bg_03.webp'

  if (path.startsWith('/sermons')) image = '/images/bg_01.webp'
  else if (path.startsWith('/notices')) image = '/images/bg_02.webp'
  else if (path.startsWith('/qt')) image = '/images/bg_04.webp'
  else if (path.startsWith('/events')) image = '/images/bg_05.webp'
  else if (path.startsWith('/teachers-room')) image = '/images/bg_06.webp'
  else if (path.startsWith('/admin')) image = '/images/bg_07.webp'

  return { '--page-bg-image': `url('${image}')` }
})

// 네비게이션 아이템
const navItems = [
  { to: '/', label: '홈', icon: 'M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z', exact: true },
  { to: '/sermons', label: '이번주 말씀', icon: 'M21 5c-1.11-.35-2.33-.5-3.5-.5-1.95 0-4.05.4-5.5 1.5-1.45-1.1-3.55-1.5-5.5-1.5S2.45 4.9 1 6v14.65c0 .25.25.5.5.5.1 0 .15-.05.25-.05C3.1 20.45 5.05 20 6.5 20c1.95 0 4.05.4 5.5 1.5 1.35-.85 3.8-1.5 5.5-1.5 1.65 0 3.35.3 4.75 1.05.1.05.15.05.25.05.25 0 .5-.25.5-.5V6c-.6-.45-1.25-.75-2-1zm0 13.5c-1.1-.35-2.3-.5-3.5-.5-1.7 0-4.15.65-5.5 1.5V8c1.35-.85 3.8-1.5 5.5-1.5 1.2 0 2.4.15 3.5.5v11.5z' },
  { to: '/notices', label: '공지사항', icon: 'M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H5.17L4 17.17V4h16v12z' },
  { to: '/qt', label: 'QT 묵상', icon: 'M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z' },
  { to: '/events', label: '성경 통독', icon: 'M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V9h14v10zM7 11h5v5H7z' },
]

// ── 말풍선 (position: fixed, body에 렌더) ──────
const tooltip = reactive({
  visible: false,
  text: '',
  top: 0,
  left: 0,
})

let tooltipTimer: ReturnType<typeof setTimeout> | null = null

const showTooltip = (e: MouseEvent, text: string) => {
  if (!isCollapsed.value) return
  if (tooltipTimer) clearTimeout(tooltipTimer)

  const target = (e.currentTarget as HTMLElement)
  const rect = target.getBoundingClientRect()

  tooltip.text = text
  tooltip.top = rect.top + rect.height / 2
  tooltip.left = rect.right + 12
  tooltip.visible = true
}

const hideTooltip = () => {
  tooltipTimer = setTimeout(() => {
    tooltip.visible = false
  }, 80)
}

// localStorage에서 사이드바 상태 복원
onMounted(() => {
  if (process.client) {
    const saved = localStorage.getItem('sidebar-collapsed')
    if (saved === 'true') isCollapsed.value = true
  }
})

const toggleCollapse = () => {
  isCollapsed.value = !isCollapsed.value
  tooltip.visible = false
  if (process.client) {
    localStorage.setItem('sidebar-collapsed', String(isCollapsed.value))
  }
}

const roleLabel = computed(() => {
  if (userRole.value === 'master') return '마스터'
  if (userRole.value === 'teacher') return '교사'
  return '성도'
})

const handleLogout = async () => {
  try {
    await logout()
    navigateTo('/login')
  } catch (err) {
    console.error('Logout error:', err)
  }
}
</script>

<style lang="scss" scoped>
// ── 트랜지션 ──────────────────────────────────
.fade-text-enter-active,
.fade-text-leave-active {
  transition: opacity 0.2s ease;
}
.fade-text-enter-from,
.fade-text-leave-to {
  opacity: 0;
}

// ── 전체 쉘 ───────────────────────────────────
.app-shell {
  display: flex;
  min-height: 100vh;
  background: $bg-main;
}

// ── 사이드바 ────────────────────────────────────
.sidebar {
  width: $sidebar-width;
  min-height: 100vh;
  background: $bg-sidebar;
  border-right: 1px solid $border-color;
  display: flex;
  flex-direction: column;
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  z-index: 100;
  transition: width 0.28s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden; // 텍스트 클리핑 — 말풍선은 Teleport로 body에 렌더

  &.collapsed {
    width: $sidebar-collapsed;
  }

  @media (max-width: 768px) {
    width: $sidebar-width !important;
    transform: translateX(-100%);
    box-shadow: $shadow-sidebar;
    &.sidebar-open { transform: translateX(0); }
  }
}

// 로고
.sidebar-logo {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 20px 16px 18px;
  min-height: 72px;
  // collapsed 시에도 padding 동일 → 로고마크 위치 고정 (overflow: hidden이 텍스트를 자름)
}

.logo-mark {
  width: 36px;
  height: 36px;
  border-radius: $radius-sm;
  background: $gradient-mn;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 2px 8px rgba($mn-red, 0.3);
}

.logo-cross {
  color: #fff;
  font-size: 1rem;
  line-height: 1;
}

.logo-text-wrap {
  display: flex;
  flex-direction: column;
  white-space: nowrap;
  overflow: hidden;
}

.logo-name {
  font-family: $font-title;
  font-size: 0.95rem;
  font-weight: 800;
  color: $text-primary;
  letter-spacing: -0.02em;
  line-height: 1.2;
}

.logo-sub {
  font-size: 0.72rem;
  font-weight: 500;
  color: $text-muted;
}

// 상단 구분선 (몽골 그라데이션)
.sidebar-divider {
  height: 3px;
  background: $gradient-mn-h;
  margin: 0 16px 16px;
  border-radius: $radius-full;

  .collapsed & {
    margin: 0 12px 16px;
  }
}

// 내비게이션
.sidebar-nav {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 0 10px;
  overflow-y: auto;
  overflow-x: hidden;

  .collapsed & {
    padding: 0 8px;
    align-items: center;
  }
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: $radius-sm;
  color: $text-secondary;
  font-size: 0.9rem;
  font-weight: 500;
  text-decoration: none;
  transition: all 0.15s ease;
  cursor: pointer;
  white-space: nowrap;
  position: relative;

  .nav-icon {
    width: 20px;
    height: 20px;
    flex-shrink: 0;
    transition: all 0.15s ease;
  }

  .nav-label {
    transition: opacity 0.2s ease, width 0.2s ease;
    overflow: hidden;
  }

  .collapsed & {
    padding: 10px;
    justify-content: center;
    width: 44px;

    .nav-label {
      opacity: 0;
      width: 0;
      overflow: hidden;
      position: absolute;
      pointer-events: none;
    }
  }

  &:hover {
    background: $bg-hover;
    color: $mn-blue;

    .nav-icon { color: $mn-blue; }
  }

  &.active {
    background: linear-gradient(90deg, rgba($mn-blue, 0.1) 0%, rgba($mn-red, 0.06) 100%);
    color: $mn-blue;
    font-weight: 700;

    .nav-icon { color: $mn-blue; }

    &::before {
      content: '';
      position: absolute;
      left: 0;
      top: 20%;
      bottom: 20%;
      width: 3px;
      background: $gradient-mn;
      border-radius: 0 $radius-full $radius-full 0;
    }
  }
}

// ── 사이드바 접기/펼치기 버튼 ─────────────────
.collapse-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 4px 10px 8px;
  padding: 6px;
  border: 1px solid $border-color;
  border-radius: $radius-sm;
  background: $bg-main;
  cursor: pointer;
  color: $text-muted;
  transition: all 0.18s ease;

  .collapsed & {
    margin: 4px 8px 8px;
  }

  &:hover {
    background: $bg-hover;
    color: $mn-blue;
    border-color: rgba($mn-blue, 0.3);
  }

  @media (max-width: 768px) {
    display: none;
  }
}

.collapse-icon {
  width: 18px;
  height: 18px;
  transition: transform 0.28s cubic-bezier(0.4, 0, 0.2, 1);

  &.rotated {
    transform: rotate(180deg);
  }
}

// 하단 사용자 카드
.sidebar-footer {
  border-top: 1px solid $border-color;
  padding: 14px 12px;

  .collapsed & {
    padding: 14px 8px;
  }
}

.user-card {
  display: flex;
  align-items: center;
  gap: 10px;

  .collapsed & {
    justify-content: center;
  }
}

.user-avatar {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: $gradient-mn;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: $font-title;
  font-weight: 800;
  font-size: 0.95rem;
  flex-shrink: 0;
  cursor: default;
}

.user-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
  white-space: nowrap;
  overflow: hidden;
}

.user-name {
  font-size: 0.85rem;
  font-weight: 700;
  color: $text-primary;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.logout-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  color: $text-muted;
  border-radius: $radius-sm;
  display: flex;
  align-items: center;
  transition: all 0.15s ease;
  flex-shrink: 0;

  svg {
    width: 18px;
    height: 18px;
  }

  &:hover {
    background: rgba($danger, 0.08);
    color: $danger;
  }
}

// ── 모바일 오버레이 ──────────────────────────────
.mobile-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.35);
  z-index: 99;
  backdrop-filter: blur(2px);
}

// ── 우측 메인 영역 ───────────────────────────────
.main-area {
  flex: 1;
  margin-left: $sidebar-width;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  transition: margin-left 0.28s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;

  // 모든 페이지에서 공유하는 풀와이드 배경
  &::before {
    content: '';
    position: absolute;
    top: $header-height;
    left: 0;
    right: 0;
    height: 565px;
    background:
      linear-gradient(180deg, rgba(#f7faff, 0.7) 0%, rgba(#f5f6fa, 0.58) 58%, $bg-main 100%),
      var(--page-bg-image) center top / cover no-repeat;
    pointer-events: none;
    z-index: 0;
  }

  .sidebar-collapsed & {
    margin-left: $sidebar-collapsed;
  }

  @media (max-width: 768px) {
    margin-left: 0 !important;

    &::before {
      height: 480px;
    }
  }
}

// 상단 헤더
.topbar {
  display: flex;
  align-items: center;
  gap: 14px;
  height: $header-height;
  padding: 0 28px;
  background: $bg-sidebar;
  border-bottom: 1px solid $border-color;
  position: sticky;
  top: 0;
  z-index: 50;
}

.mobile-only {
  display: none;
  @media (max-width: 768px) {
    display: flex;
  }
}

.hamburger-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  color: $text-secondary;
  align-items: center;

  svg { width: 22px; height: 22px; }
}

.topbar-title {
  font-family: $font-title;
  font-size: 1rem;
  font-weight: 800;
  color: $text-primary;
}

.topbar-right {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 12px;
}

.topbar-icon-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  color: $text-secondary;
  border-radius: $radius-sm;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s ease;

  svg {
    width: 22px;
    height: 22px;
  }

  &:hover {
    background: $bg-hover;
    color: $mn-blue;
  }
}

.topbar-user {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 4px 8px 4px 4px;
  border-radius: $radius-full;
  transition: all 0.15s ease;

  &:hover {
    background: $bg-hover;
  }
}

.topbar-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: $gradient-mn;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: $font-title;
  font-weight: 800;
  font-size: 0.85rem;
}

.topbar-role {
  font-size: 0.82rem;
  font-weight: 600;
  color: $text-secondary;
}

// 콘텐츠 영역의 배경은 풀와이드, 각 페이지 콘텐츠는 공통 1300px
.content-area {
  flex: 1;
  position: relative;
  z-index: 1;
  width: 100%;
}
</style>

<!-- 말풍선은 Teleport로 body에 렌더되므로 scoped 밖에서 스타일 지정 -->
<style lang="scss">
@use '../assets/scss/variables' as *;

// ── 말풍선 (position: fixed, body 레벨) ─────────
.sidebar-tooltip {
  position: fixed;
  transform: translateY(-50%);
  background: #1f2937;
  color: #fff;
  font-size: 0.78rem;
  font-weight: 600;
  padding: 6px 14px;
  border-radius: $radius-sm;
  white-space: nowrap;
  pointer-events: none;
  z-index: 9999;
  box-shadow: 0 4px 14px rgba(0,0,0,0.2);
  font-family: $font-body;

  // 말풍선 화살표
  &::before {
    content: '';
    position: absolute;
    right: 100%;
    top: 50%;
    transform: translateY(-50%);
    border: 5px solid transparent;
    border-right-color: #1f2937;
  }
}

// 말풍선 트랜지션
.tooltip-fade-enter-active,
.tooltip-fade-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}
.tooltip-fade-enter-from {
  opacity: 0;
  transform: translateY(-50%) translateX(-6px);
}
.tooltip-fade-leave-to {
  opacity: 0;
  transform: translateY(-50%) translateX(-6px);
}
</style>
