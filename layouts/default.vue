<template>
  <div class="app-shell" :class="{ 'home-mode': isHome, 'menu-open': isMobileMenuOpen, scrolled: isScrolled }">
    <header class="site-header">
      <div class="header-inner">
        <nuxt-link to="/" class="brand" @click="closeMenu">
          <span class="brand-mark" aria-hidden="true"><span>†</span></span>
          <span class="brand-copy">
            <strong>{{ t('church.name') }}</strong>
            <small>{{ t('church.region') }} · RIVER OF LIFE</small>
          </span>
        </nuxt-link>

        <nav class="desktop-nav" :aria-label="t('nav.home')">
          <nuxt-link
            v-for="item in visibleNavItems"
            :key="item.to"
            :to="item.to"
            :exact="item.exact"
            active-class="active"
          >{{ item.label }}</nuxt-link>
        </nav>

        <div class="header-tools">
          <label class="language-selector">
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M12 2a10 10 0 100 20 10 10 0 000-20zm6.92 6h-3.03a15.7 15.7 0 00-1.38-3.56A8.04 8.04 0 0118.92 8zM12 4c.83 1.2 1.47 2.53 1.82 4h-3.64A13.6 13.6 0 0112 4zM4.26 14a8.2 8.2 0 010-4h3.39a16.4 16.4 0 000 4H4.26zm.82 2h3.03c.3 1.27.77 2.47 1.38 3.56A8.04 8.04 0 015.08 16zM8.11 8H5.08a8.04 8.04 0 014.41-3.56A15.7 15.7 0 008.11 8zM12 20a13.6 13.6 0 01-1.82-4h3.64A13.6 13.6 0 0112 20zm2.22-6H9.78a14.4 14.4 0 010-4h4.44a14.4 14.4 0 010 4zm.29 5.56A15.7 15.7 0 0015.89 16h3.03a8.04 8.04 0 01-4.41 3.56zM16.35 14a16.4 16.4 0 000-4h3.39a8.2 8.2 0 010 4h-3.39z" fill="currentColor"/>
            </svg>
            <select v-model="selectedLanguage" :aria-label="t('language.select')">
              <option value="ko">{{ t('language.ko') }}</option>
              <option value="mn">{{ t('language.mn') }}</option>
            </select>
            <svg class="language-chevron" viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <path d="M6 8l4 4 4-4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </label>

          <button class="menu-toggle" :aria-expanded="isMobileMenuOpen" :aria-label="isMobileMenuOpen ? '메뉴 닫기' : '메뉴 열기'" @click="isMobileMenuOpen = !isMobileMenuOpen">
            <span></span><span></span><span></span>
          </button>
        </div>
      </div>
    </header>

    <transition name="menu-drop">
      <div v-if="isMobileMenuOpen" class="mobile-menu">
        <nav class="mobile-nav" :aria-label="t('nav.home')">
          <nuxt-link
            v-for="(item, index) in visibleNavItems"
            :key="item.to"
            :to="item.to"
            :exact="item.exact"
            active-class="active"
            @click="closeMenu"
          >
            <span>{{ String(index + 1).padStart(2, '0') }}</span>
            <strong>{{ item.label }}</strong>
            <i>↗</i>
          </nuxt-link>
        </nav>
        <button class="mobile-logout" @click="handleLogout">{{ t('auth.logout') }}</button>
      </div>
    </transition>

    <main class="site-main" :style="pageBackgroundStyle">
      <slot />
    </main>

    <footer class="site-footer">
      <div class="footer-inner">
        <nuxt-link to="/" class="footer-brand">
          <span class="brand-mark" aria-hidden="true"><span>†</span></span>
          <span><strong>{{ t('church.fullName') }}</strong><small>NALAIKH · MONGOLIA</small></span>
        </nuxt-link>
        <nav class="footer-nav">
          <nuxt-link v-for="item in visibleNavItems.slice(0, 5)" :key="item.to" :to="item.to">{{ item.label }}</nuxt-link>
          <button @click="handleLogout">{{ t('auth.logout') }}</button>
        </nav>
        <p>© {{ currentYear }} RIVER OF LIFE CHURCH. ALL RIGHTS RESERVED.</p>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'

const { isTeacher, isMaster, logout } = useAuth()
const { language: selectedLanguage, t } = useLanguage()
const route = useRoute()
const isMobileMenuOpen = ref(false)
const isScrolled = ref(false)
const currentYear = new Date().getFullYear()

const isHome = computed(() => route.path === '/')

const visibleNavItems = computed(() => {
  const items = [
    { to: '/', label: t('nav.home'), exact: true },
    { to: '/sermons', label: t('nav.sermons') },
    { to: '/notices', label: t('nav.notices') },
    { to: '/qt', label: t('nav.qt') },
    { to: '/events', label: t('nav.events') },
  ]

  if (isTeacher.value) items.push({ to: '/teachers-room', label: t('nav.teachers') })
  if (isMaster.value) items.push({ to: '/admin', label: t('nav.admin') })
  return items
})

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

const closeMenu = () => { isMobileMenuOpen.value = false }
const updateScrollState = () => { isScrolled.value = window.scrollY > 32 }

watch(() => route.fullPath, () => {
  closeMenu()
  if (import.meta.client) requestAnimationFrame(updateScrollState)
})

onMounted(() => {
  updateScrollState()
  window.addEventListener('scroll', updateScrollState, { passive: true })
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', updateScrollState)
})

const handleLogout = async () => {
  try {
    await logout()
    closeMenu()
    await navigateTo('/login')
  } catch (err) {
    console.error('Logout error:', err)
  }
}
</script>

<style lang="scss" scoped>
.app-shell { min-width: 0; min-height: 100vh; display: flex; flex-direction: column; background: $bg-main; }

.site-header {
  position: fixed; top: 0; left: 0; right: 0; z-index: 100; height: 76px;
  color: #16253a; background: rgba(#fff, .97);
  border-bottom: 1px solid rgba(#17263b, .1); box-shadow: 0 5px 22px rgba(#13283a, .055); backdrop-filter: blur(14px);
}
.home-mode .site-header {
  color: #fff;
  background: linear-gradient(180deg, rgba(#071524, .55), transparent);
  border-bottom-color: rgba(#fff, .2); box-shadow: none; backdrop-filter: none;
}
.home-mode.scrolled .site-header {
  color: #16253a; background: rgba(#fff, .96); border-bottom-color: rgba(#17263b, .1);
  box-shadow: 0 5px 22px rgba(#13283a, .075); backdrop-filter: blur(14px);
}
.home-mode.scrolled .brand-copy small { color: #8390a1; }
.home-mode.scrolled .language-selector { color: #58677b; background: rgba(#fff, .88); border-color: rgba(#192b43, .12); }
.home-mode.scrolled .language-selector > svg:first-child { color: $mn-blue; }
.home-mode.menu-open .site-header { color: #fff; background: #102f36; border-bottom-color: rgba(#fff, .14); box-shadow: none; }
.home-mode.menu-open .brand-copy small { color: rgba(#fff, .65); }
.home-mode.menu-open .language-selector { color: #fff; background: rgba(#071524, .18); border-color: rgba(#fff, .35); }
.home-mode.menu-open .language-selector > svg:first-child { color: #fff; }

.header-inner {
  width: min(1400px, calc(100% - 48px)); height: 100%; margin: 0 auto;
  display: grid; grid-template-columns: minmax(220px, 1fr) auto minmax(220px, 1fr);
  align-items: center; gap: 28px;
}
.brand { width: fit-content; display: inline-flex; align-items: center; gap: 11px; color: inherit; }
.brand:hover { color: inherit; }
.brand-mark {
  width: 38px; height: 38px; flex: 0 0 38px; display: grid; place-items: center;
  color: #fff; background: $gradient-mn;
  border-radius: 50%; box-shadow: 0 6px 18px rgba(#09192d, .2);
}
.brand-mark span { font-family: Georgia, serif; font-size: 1.28rem; line-height: 1; transform: translateY(-1px); }
.brand-copy { display: flex; flex-direction: column; min-width: 0; }
.brand-copy strong { font-family: $font-title; font-size: .93rem; font-weight: 800; line-height: 1.25; letter-spacing: -.02em; }
.brand-copy small { margin-top: 2px; color: #8390a1; font-size: .56rem; font-weight: 700; letter-spacing: .1em; }
.home-mode .brand-copy small { color: rgba(#fff, .65); }

.desktop-nav { display: flex; align-items: center; justify-content: center; gap: clamp(22px, 2.7vw, 46px); white-space: nowrap; }
.desktop-nav a { position: relative; padding: 28px 0 24px; color: inherit; font-size: .84rem; font-weight: 700; }
.desktop-nav a::after {
  content: ''; position: absolute; left: 50%; right: 50%; bottom: 16px; height: 2px;
  background: $mn-blue; transition: left .22s ease, right .22s ease;
}
.desktop-nav a:hover, .desktop-nav a.active { color: inherit; }
.desktop-nav a:hover::after, .desktop-nav a.active::after { left: 0; right: 0; }

.header-tools { justify-self: end; display: flex; align-items: center; gap: 12px; }
.language-selector {
  position: relative; min-width: 118px; height: 38px; display: flex; align-items: center; gap: 7px;
  padding: 0 30px 0 11px; color: #58677b; background: rgba(#fff, .88);
  border: 1px solid rgba(#192b43, .12); border-radius: 999px;
}
.home-mode .language-selector { color: #fff; background: rgba(#071524, .18); border-color: rgba(#fff, .35); }
.language-selector > svg:first-child { width: 16px; height: 16px; flex: 0 0 16px; color: $mn-blue; }
.home-mode .language-selector > svg:first-child { color: #fff; }
.language-selector select {
  width: 100%; appearance: none; border: 0; outline: 0; background: transparent; color: inherit;
  cursor: pointer; font-family: $font-body; font-size: .76rem; font-weight: 700;
}
.language-selector option { color: #16253a; background: #fff; }
.language-chevron { position: absolute; right: 10px; width: 14px; height: 14px; pointer-events: none; }

.menu-toggle { width: 38px; height: 38px; display: none; place-items: center; padding: 9px; color: inherit; background: transparent; border: 0; cursor: pointer; }
.menu-toggle span { width: 20px; height: 1.5px; display: block; margin: 2px 0; background: currentColor; transition: transform .22s ease, opacity .22s ease; }
.menu-open .menu-toggle span:nth-child(1) { transform: translateY(5.5px) rotate(45deg); }
.menu-open .menu-toggle span:nth-child(2) { opacity: 0; }
.menu-open .menu-toggle span:nth-child(3) { transform: translateY(-5.5px) rotate(-45deg); }

.mobile-menu {
  position: fixed; z-index: 90; inset: 76px 0 0; display: flex; flex-direction: column;
  padding: 24px; color: #fff; background: #10253a; overflow-y: auto;
}
.mobile-nav { width: min(680px, 100%); margin: auto; border-top: 1px solid rgba(#fff, .25); }
.mobile-nav a {
  display: grid; grid-template-columns: 38px minmax(0, 1fr) auto; align-items: center; gap: 14px;
  padding: 20px 4px; color: #fff; border-bottom: 1px solid rgba(#fff, .16);
}
.mobile-nav a span { color: #7994ad; font-size: .66rem; letter-spacing: .08em; }
.mobile-nav a strong { font-size: 1.04rem; }
.mobile-nav a i { color: #7994ad; font-style: normal; }
.mobile-nav a.active strong { color: #62c2ff; }
.mobile-logout {
  width: min(680px, 100%); margin: 20px auto 0; padding: 12px 0; color: rgba(#fff, .62);
  background: transparent; border: 0; text-align: left; cursor: pointer;
}
.menu-drop-enter-active, .menu-drop-leave-active { transition: opacity .2s ease, transform .2s ease; }
.menu-drop-enter-from, .menu-drop-leave-to { opacity: 0; transform: translateY(-12px); }

.site-main { position: relative; z-index: 1; flex: 1; min-width: 0; width: 100%; }
.app-shell:not(.home-mode) .site-main { padding-top: 76px; }
.app-shell:not(.home-mode) .site-main::before {
  content: ''; position: absolute; z-index: -1; inset: 0 0 auto; height: 565px;
  background: linear-gradient(180deg, rgba(#f7faff, .72) 0%, rgba(#f5f6fa, .6) 58%, $bg-main 100%), var(--page-bg-image) center top / cover no-repeat;
  pointer-events: none;
}

.site-footer { color: rgba(#fff, .74); background: #073e3d; }
.footer-inner {
  width: min(1380px, calc(100% - 64px)); min-height: 148px; margin: 0 auto;
  display: grid; grid-template-columns: 1fr auto; align-items: center; gap: 24px 48px;
}
.footer-brand { display: flex; align-items: center; gap: 12px; color: #fff; }
.footer-brand:hover { color: #fff; }
.footer-brand .brand-mark { width: 34px; height: 34px; flex-basis: 34px; }
.footer-brand > span:last-child { display: flex; flex-direction: column; }
.footer-brand strong { font-size: .9rem; }
.footer-brand small { margin-top: 2px; color: rgba(#fff, .48); font-size: .58rem; letter-spacing: .12em; }
.footer-nav { display: flex; flex-wrap: wrap; justify-content: flex-end; gap: 12px 24px; }
.footer-nav a { color: rgba(#fff, .72); font-size: .72rem; }
.footer-nav a:hover { color: #fff; }
.footer-nav button { padding: 0; color: rgba(#fff, .72); background: transparent; border: 0; cursor: pointer; font: inherit; font-size: .72rem; }
.footer-nav button:hover { color: #fff; }
.footer-inner p { grid-column: 1 / -1; align-self: start; padding-top: 16px; border-top: 1px solid rgba(#fff, .14); color: rgba(#fff, .4); font-size: .6rem; letter-spacing: .07em; }

@media (max-width: 1100px) {
  .header-inner { grid-template-columns: 1fr auto; }
  .desktop-nav { display: none; }
  .menu-toggle { display: block; }
}
@media (max-width: 768px) {
  .site-header { height: 64px; }
  .header-inner { width: calc(100% - 28px); gap: 10px; }
  .brand { gap: 8px; }
  .brand-mark { width: 32px; height: 32px; flex-basis: 32px; }
  .brand-copy strong { max-width: 145px; overflow: hidden; font-size: .82rem; text-overflow: ellipsis; white-space: nowrap; }
  .brand-copy small { display: none; }
  .language-selector { min-width: 106px; height: 34px; }
  .mobile-menu { inset: 64px 0 0; }
  .app-shell:not(.home-mode) .site-main { padding-top: 64px; }
  .app-shell:not(.home-mode) .site-main::before { height: 480px; }
  .footer-inner { width: calc(100% - 32px); padding: 34px 0; grid-template-columns: 1fr; }
  .footer-nav { justify-content: flex-start; }
}
@media (max-width: 420px) {
  .header-inner { width: calc(100% - 20px); }
  .brand-copy strong { max-width: 122px; }
  .language-selector { min-width: 92px; padding-left: 9px; }
  .language-selector > svg:first-child { display: none; }
}
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { transition-duration: .01ms !important; }
}
</style>
