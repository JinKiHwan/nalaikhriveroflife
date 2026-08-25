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
            :class="{ active: isNavItemActive(item.to) }"
          >{{ item.label }}</nuxt-link>
        </nav>

        <div class="header-tools">
          <div class="language-selector" @focusout="handleLanguageBlur">
            <button
              type="button"
              class="language-trigger"
              :aria-label="t('language.select')"
              :aria-expanded="isLanguageMenuOpen"
              aria-haspopup="listbox"
              @click="isLanguageMenuOpen = !isLanguageMenuOpen"
              @keydown.esc="isLanguageMenuOpen = false"
            >
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M12 2a10 10 0 100 20 10 10 0 000-20zm6.92 6h-3.03a15.7 15.7 0 00-1.38-3.56A8.04 8.04 0 0118.92 8zM12 4c.83 1.2 1.47 2.53 1.82 4h-3.64A13.6 13.6 0 0112 4zM4.26 14a8.2 8.2 0 010-4h3.39a16.4 16.4 0 000 4H4.26zm.82 2h3.03c.3 1.27.77 2.47 1.38 3.56A8.04 8.04 0 015.08 16zM8.11 8H5.08a8.04 8.04 0 014.41-3.56A15.7 15.7 0 008.11 8zM12 20a13.6 13.6 0 01-1.82-4h3.64A13.6 13.6 0 0112 20zm2.22-6H9.78a14.4 14.4 0 010-4h4.44a14.4 14.4 0 010 4zm.29 5.56A15.7 15.7 0 0015.89 16h3.03a8.04 8.04 0 01-4.41 3.56zM16.35 14a16.4 16.4 0 000-4h3.39a8.2 8.2 0 010 4h-3.39z" fill="currentColor"/>
              </svg>
              <span>{{ currentLanguageLabel }}</span>
              <svg class="language-chevron" :class="{ open: isLanguageMenuOpen }" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <path d="M6 8l4 4 4-4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
            <transition name="language-menu">
              <div v-if="isLanguageMenuOpen" class="language-options" role="listbox" :aria-label="t('language.select')">
                <button
                  v-for="option in languageOptions"
                  :key="option.value"
                  type="button"
                  role="option"
                  :aria-selected="selectedLanguage === option.value"
                  :class="{ active: selectedLanguage === option.value }"
                  @click="selectLanguage(option.value)"
                >
                  <span>{{ option.label }}</span>
                  <span class="language-check" aria-hidden="true">✓</span>
                </button>
              </div>
            </transition>
          </div>

          <nuxt-link v-if="!isAuthenticated" to="/login" class="header-auth">{{ t('auth.login') }}</nuxt-link>
          <button v-else type="button" class="header-auth" @click="handleLogout">{{ t('auth.logout') }}</button>

          <nuxt-link v-if="isAdmin" to="/admin" class="admin-redirect" :aria-label="t('admin.tool')">
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M4 5.5h7v5H4v-5zm9 0h7v8h-7v-8zM4 12.5h7v6H4v-6zm9 3h7v3h-7v-3z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/>
            </svg>
            <span>{{ t('admin.tool') }}</span>
          </nuxt-link>

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
            :class="{ active: isNavItemActive(item.to) }"
            @click="closeMenu"
          >
            <span>{{ String(index + 1).padStart(2, '0') }}</span>
            <strong>{{ item.label }}</strong>
            <i>↗</i>
          </nuxt-link>
        </nav>
        <nuxt-link v-if="isAdmin" to="/admin" class="mobile-admin-link" @click="closeMenu">{{ t('admin.tool') }} <span>↗</span></nuxt-link>
        <nuxt-link v-if="!isAuthenticated" to="/login" class="mobile-auth" @click="closeMenu">{{ t('auth.login') }}</nuxt-link>
        <button v-else class="mobile-auth" @click="handleLogout">{{ t('auth.logout') }}</button>
      </div>
    </transition>

    <main class="site-main">
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
          <nuxt-link v-if="isAdmin" to="/admin">{{ t('admin.tool') }}</nuxt-link>
          <nuxt-link v-if="!isAuthenticated" to="/login">{{ t('auth.login') }}</nuxt-link>
          <button v-else @click="handleLogout">{{ t('auth.logout') }}</button>
        </nav>
        <p>© {{ currentYear }} RIVER OF LIFE CHURCH. ALL RIGHTS RESERVED.</p>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'

const { isAuthenticated, isAdmin, logout } = useAuth()
const { language: selectedLanguage, t } = useLanguage()
const route = useRoute()
const isMobileMenuOpen = ref(false)
const isScrolled = ref(false)
const isLanguageMenuOpen = ref(false)
const currentYear = new Date().getFullYear()
const languageOptions = [
  { value: 'ko' as const, label: '한국어' },
  { value: 'mn' as const, label: 'Монгол хэл' },
]

const currentLanguageLabel = computed(() => languageOptions.find(option => option.value === selectedLanguage.value)?.label ?? '한국어')

useHead(() => ({
  htmlAttrs: { lang: selectedLanguage.value },
}))

const isHome = computed(() => route.path === '/')

const visibleNavItems = computed(() => {
  return [
    { to: '/#worship-guide', label: t('nav.worshipGuide') },
    { to: '/news', label: t('nav.churchNews') },
    { to: '/sermons', label: t('nav.lifeWord') },
    { to: '/notices', label: t('nav.notices') },
    { to: '/events', label: t('nav.churchEvents') },
  ]
})

const isNavItemActive = (to: string) => {
  if (to.startsWith('/#')) return route.path === '/' && route.hash === to.slice(1)
  return route.path === to || route.path.startsWith(`${to}/`)
}

const closeMenu = () => {
  isMobileMenuOpen.value = false
  isLanguageMenuOpen.value = false
}
const updateScrollState = () => { isScrolled.value = window.scrollY > 32 }

const selectLanguage = (value: 'ko' | 'mn') => {
  selectedLanguage.value = value
  isLanguageMenuOpen.value = false
}

const handleLanguageBlur = (event: FocusEvent) => {
  const selector = event.currentTarget as HTMLElement
  const nextTarget = event.relatedTarget as Node | null
  if (!nextTarget || !selector.contains(nextTarget)) isLanguageMenuOpen.value = false
}

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
  color: #26342e; background: rgba(#fff, .97);
  border-bottom: 1px solid rgba(#2a3c34, .1); box-shadow: 0 5px 22px rgba(#20362d, .055); backdrop-filter: blur(14px);
}
.home-mode .site-header {
  color: #fff;
  background: rgba(#21170f, .46);
  border-bottom-color: rgba(#fff, .2); box-shadow: none; backdrop-filter: none;
}
.home-mode.scrolled .site-header {
  color: #26342e; background: rgba(#fff, .96); border-bottom-color: rgba(#2a3c34, .1);
  box-shadow: 0 5px 22px rgba(#20362d, .075); backdrop-filter: blur(14px);
}
.home-mode.scrolled .brand-copy small { color: #8390a1; }
.home-mode.scrolled .language-selector { color: #5b6a62; background: rgba(#fff, .88); border-color: rgba(#2b3b34, .12); }
.home-mode.scrolled .language-trigger > svg:first-child { color: $mn-blue; }
.home-mode.menu-open .site-header { color: #fff; background: #1b4235; border-bottom-color: rgba(#fff, .14); box-shadow: none; }
.home-mode.menu-open .brand-copy small { color: rgba(#fff, .65); }
.home-mode.menu-open .language-selector { color: #fff; background: rgba(#071524, .18); border-color: rgba(#fff, .35); }
.home-mode.menu-open .language-trigger > svg:first-child { color: #fff; }

.header-inner {
  width: min(1400px, calc(100% - 48px)); height: 100%; margin: 0 auto;
  display: grid; grid-template-columns: minmax(220px, 1fr) auto minmax(220px, 1fr);
  align-items: center; gap: 28px;
}
.brand { width: fit-content; display: inline-flex; align-items: center; gap: 11px; color: inherit; }
.brand:hover { color: inherit; }
.brand-mark {
  width: 38px; height: 38px; flex: 0 0 38px; display: grid; place-items: center;
  color: #fff; background: $mn-blue;
  border-radius: 50%; box-shadow: 0 6px 18px rgba(#183127, .2);
}
.brand-mark span { font-family: Georgia, serif; font-size: 1.28rem; line-height: 1; transform: translateY(-1px); }
.brand-copy { display: flex; flex-direction: column; min-width: 0; }
.brand-copy strong { font-family: $font-title; font-size: 18px; font-weight: 800; line-height: 1.25; letter-spacing: -.02em; }
.brand-copy small { margin-top: 2px; color: #78867f; font-size: 13px; font-weight: 700; letter-spacing: .06em; }
.home-mode .brand-copy small { color: rgba(#fff, .65); }

.desktop-nav { display: flex; align-items: center; justify-content: center; gap: clamp(22px, 2.7vw, 46px); white-space: nowrap; }
.desktop-nav a { position: relative; padding: 28px 0 24px; color: inherit; font-size: 18px; font-weight: 700; }
.desktop-nav a::after {
  content: ''; position: absolute; left: 50%; right: 50%; bottom: 16px; height: 2px;
  background: $mn-blue; transition: left .22s ease, right .22s ease;
}
.desktop-nav a:hover, .desktop-nav a.active { color: inherit; }
.desktop-nav a:hover::after, .desktop-nav a.active::after { left: 0; right: 0; }

.header-tools { justify-self: end; display: flex; align-items: center; gap: 12px; }
.header-auth {
  min-width: 76px; height: 40px; display: inline-flex; align-items: center; justify-content: center; padding: 0 15px;
  color: #fff; background: $mn-blue; border: 1px solid $mn-blue; border-radius: 999px; cursor: pointer;
  font-family: $font-body; font-size: 13px; font-weight: 800; white-space: nowrap;
}
.header-auth:hover { color: #fff; background: #126d50; border-color: #126d50; }
.header-auth:focus-visible { outline: 2px solid rgba(#70c9a3,.7); outline-offset: 3px; }
.admin-redirect {
  position: absolute; top: 18px; right: 24px; min-width: 110px; height: 40px;
  display: inline-flex; align-items: center; justify-content: center; gap: 7px; padding: 0 15px;
  color: #fff; background: #167c59; border: 1px solid #167c59; border-radius: 999px;
  font-size: 13px; font-weight: 800; white-space: nowrap; box-shadow: 0 5px 16px rgba(#123e2f, .2);
}
.admin-redirect svg { width: 17px; height: 17px; }
.admin-redirect:hover { color: #fff; background: #105f43; border-color: #105f43; }
.admin-redirect:focus-visible { outline: 2px solid rgba(#70c9a3,.85); outline-offset: 3px; }
.language-selector {
  position: relative; width: 148px; height: 40px; color: #5b6a62; background: rgba(#fff, .88);
  border: 1px solid rgba(#2b3b34, .12); border-radius: 999px;
}
.home-mode .language-selector { color: #fff; background: rgba(#2a1c12, .18); border-color: rgba(#fff, .35); }
.language-trigger {
  width: 100%; height: 100%; display: grid; grid-template-columns: 16px minmax(0,1fr) 14px; align-items: center; gap: 8px;
  padding: 0 12px; color: inherit; background: transparent; border: 0; border-radius: inherit; cursor: pointer;
  font-family: $font-body; font-size: 13px; font-weight: 700; text-align: left;
}
.language-trigger:focus-visible { outline: 2px solid rgba(#70c9a3,.85); outline-offset: 3px; }
.language-trigger > svg:first-child { width: 16px; height: 16px; color: $mn-blue; }
.home-mode .language-trigger > svg:first-child { color: #fff; }
.language-trigger > span { overflow: hidden; white-space: nowrap; text-overflow: ellipsis; }
.language-chevron { width: 14px; height: 14px; transition: transform .2s ease; }
.language-chevron.open { transform: rotate(180deg); }
.language-options {
  position: absolute; z-index: 120; top: calc(100% + 9px); left: -1px; width: calc(100% + 2px); overflow: hidden;
  padding: 6px; color: #26342e; background: rgba(#fff,.98); border: 1px solid rgba(#2b3b34,.14); border-radius: 14px;
  box-shadow: 0 14px 34px rgba(#1f352c,.18); backdrop-filter: blur(12px);
}
.language-options button {
  width: 100%; min-height: 38px; display: flex; align-items: center; justify-content: space-between; gap: 8px;
  padding: 0 10px; color: #425149; background: transparent; border: 0; border-radius: 9px; cursor: pointer;
  font-family: $font-body; font-size: 13px; font-weight: 700; text-align: left;
}
.language-options button:hover { color: #126c50; background: #eef7f2; }
.language-options button.active { color: #fff; background: $mn-blue; }
.language-check { opacity: 0; }
.language-options button.active .language-check { opacity: 1; }
.language-menu-enter-active,.language-menu-leave-active { transition: opacity .16s ease, transform .16s ease; transform-origin: top; }
.language-menu-enter-from,.language-menu-leave-to { opacity: 0; transform: translateY(-5px) scale(.98); }

.menu-toggle { position: relative; width: 38px; height: 38px; display: none; padding: 0; color: inherit; background: transparent; border: 0; cursor: pointer; }
.menu-toggle span { position: absolute; left: 9px; top: 50%; width: 20px; height: 1.5px; display: block; margin: 0; background: currentColor; transform-origin: center; transition: transform .22s ease, opacity .22s ease; }
.menu-toggle span:nth-child(1) { transform: translateY(-6px); }
.menu-toggle span:nth-child(2) { transform: translateY(-.75px); }
.menu-toggle span:nth-child(3) { transform: translateY(4.5px); }
.menu-open .menu-toggle span:nth-child(1) { transform: translateY(-.75px) rotate(45deg); }
.menu-open .menu-toggle span:nth-child(2) { opacity: 0; }
.menu-open .menu-toggle span:nth-child(3) { transform: translateY(-.75px) rotate(-45deg); }

.mobile-menu {
  position: fixed; z-index: 90; inset: 76px 0 0; display: flex; flex-direction: column;
  padding: 24px; color: #26332e; background: #fff; overflow-y: auto;
}
.mobile-nav { width: min(680px, 100%); margin: auto; border-top: 1px solid #dfe5e1; }
.mobile-nav a {
  display: grid; grid-template-columns: 38px minmax(0, 1fr) auto; align-items: center; gap: 14px;
  padding: 20px 4px; color: #26332e; border-bottom: 1px solid #e2e7e4;
}
.mobile-nav a:hover { color: #26332e; background: #f7f9f8; }
.mobile-nav a span { color: #8a9790; font-size: 13px; letter-spacing: .08em; }
.mobile-nav a strong { font-size: 18px; }
.mobile-nav a i { color: #668579; font-style: normal; }
.mobile-nav a.active strong { color: $mn-blue; }
.mobile-admin-link {
  width: min(680px, 100%); margin: 18px auto 0; display: flex; align-items: center; justify-content: space-between;
  padding: 15px 18px; color: #fff; background: #24775b; border: 1px solid rgba(#fff, .18); font-size: 18px; font-weight: 800;
}
.mobile-admin-link:hover { color: #fff; background: #2b8566; }
.mobile-auth {
  width: min(680px, 100%); margin: 20px auto 0; padding: 12px 0; color: #737f79;
  background: transparent; border: 0; text-align: left; cursor: pointer; font-size: 13px;
}
.mobile-auth:hover { color: #26332e; }
.menu-drop-enter-active, .menu-drop-leave-active { transition: opacity .2s ease, transform .2s ease; }
.menu-drop-enter-from, .menu-drop-leave-to { opacity: 0; transform: translateY(-12px); }

.site-main { position: relative; z-index: 1; flex: 1; min-width: 0; width: 100%; }
.app-shell:not(.home-mode) .site-main { padding-top: 76px; }

.site-footer { padding: 18px 0; color: rgba(#fff, .74); background: #173f34; }
.footer-inner {
  width: min(1380px, calc(100% - 64px)); min-height: 176px; margin: 0 auto; padding: 28px 0 22px;
  display: grid; grid-template-columns: 1fr auto; align-items: center; gap: 30px 48px;
}
.footer-brand { display: flex; align-items: center; gap: 12px; color: #fff; }
.footer-brand:hover { color: #fff; }
.footer-brand .brand-mark { width: 34px; height: 34px; flex-basis: 34px; }
.footer-brand > span:last-child { display: flex; flex-direction: column; }
.footer-brand strong { font-size: 18px; }
.footer-brand small { margin-top: 2px; color: rgba(#fff, .54); font-size: 13px; letter-spacing: .08em; }
.footer-nav { display: flex; flex-wrap: wrap; justify-content: flex-end; gap: 12px 24px; }
.footer-nav a { color: rgba(#fff, .72); font-size: 13px; }
.footer-nav a:hover { color: #fff; }
.footer-nav button { padding: 0; color: rgba(#fff, .72); background: transparent; border: 0; cursor: pointer; font: inherit; font-size: 13px; }
.footer-nav button:hover { color: #fff; }
.footer-inner p { grid-column: 1 / -1; align-self: start; padding-top: 22px; border-top: 1px solid rgba(#fff, .14); color: rgba(#fff, .46); font-size: 13px; letter-spacing: .05em; }

@media (max-width: 1660px) {
  .admin-redirect { position: static; }
}
@media (max-width: 1280px) {
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
  .language-selector { width: 138px; height: 36px; }
  .header-auth { min-width: 68px; height: 36px; padding: 0 12px; }
  .admin-redirect { display: none; }
  .mobile-menu { inset: 64px 0 0; }
  .app-shell:not(.home-mode) .site-main { padding-top: 64px; }
  .app-shell:not(.home-mode) .site-main::before { height: 480px; }
  .footer-inner { width: calc(100% - 32px); padding: 34px 0; grid-template-columns: 1fr; }
  .footer-nav { justify-content: flex-start; }
}
@media (max-width: 420px) {
  .header-inner { width: calc(100% - 20px); }
  .brand-copy strong { max-width: 122px; }
  .language-selector { width: 126px; }
  .header-auth { display: none; }
  .language-trigger { grid-template-columns: minmax(0,1fr) 14px; padding: 0 10px; }
  .language-trigger > svg:first-child { display: none; }
}
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { transition-duration: .01ms !important; }
}
</style>
