<template>
  <div v-if="canRenderAdmin" class="admin-shell">
    <aside class="admin-sidebar">
      <nuxt-link to="/admin" class="admin-brand" :aria-label="t('admin.tool')">
        <img src="/images/church-logo-v1.png" alt="" class="admin-brand-mark" />
        <span class="admin-brand-copy">
          <strong>{{ t('admin.tool') }}</strong>
          <small>NALAKH CHURCH</small>
        </span>
      </nuxt-link>

      <div class="admin-navigation">
        <p class="navigation-label">{{ t('admin.navigation') }}</p>
        <nav :aria-label="t('admin.navigation')">
          <nuxt-link to="/admin" class="navigation-item" exact-active-class="active">
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM19 8v6M22 11h-6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <span>{{ t('admin.memberManagement') }}</span>
          </nuxt-link>
          <nuxt-link to="/admin/posts" class="navigation-item" exact-active-class="active">
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M5 4h14a2 2 0 012 2v12a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2zM7 8h10M7 12h10M7 16h6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <span>{{ t('admin.postManagement') }}</span>
          </nuxt-link>
          <nuxt-link to="/admin/sermon-categories" class="navigation-item" exact-active-class="active">
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M4 5h16M4 12h16M4 19h16M8 3v4M13 10v4M17 17v4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <span>{{ t('admin.sermonCategories') }}</span>
          </nuxt-link>
          <nuxt-link to="/admin/hero" class="navigation-item" exact-active-class="active">
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M4 5h16v14H4V5zM4 15l4-4 3 3 3-3 6 6M16.5 9a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <span>{{ t('admin.heroManagement') }}</span>
          </nuxt-link>
        </nav>
      </div>

      <div class="admin-sidebar-footer">
        <nuxt-link to="/" class="sidebar-action">
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M3 11l9-8 9 8v10h-6v-6H9v6H3V11z" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <span>{{ t('admin.homepage') }}</span>
        </nuxt-link>
        <button type="button" class="sidebar-action" @click="handleLogout">
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M10 17l5-5-5-5M15 12H3M14 3h5a2 2 0 012 2v14a2 2 0 01-2 2h-5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <span>{{ t('auth.logout') }}</span>
        </button>

        <div class="admin-language" :aria-label="t('language.select')">
          <button type="button" :class="{ active: language === 'ko' }" @click="setLanguage('ko')">
            <span class="language-short">KO</span><span class="language-full">한국어</span>
          </button>
          <button type="button" :class="{ active: language === 'mn' }" @click="setLanguage('mn')">
            <span class="language-short">MN</span><span class="language-full">Монгол хэл</span>
          </button>
        </div>

        <div class="admin-profile">
          <span class="admin-avatar">{{ userName.slice(0, 1) }}</span>
          <span class="admin-profile-copy">
            <strong>{{ userName }}</strong>
            <small>@{{ profile?.userId || 'master' }}</small>
          </span>
        </div>
      </div>
    </aside>

    <main class="admin-content">
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
const { profile, userName, isAdmin, waitForAuthReady, logout } = useAuth()
const { language, setLanguage, t } = useLanguage()
const canRenderAdmin = ref(false)

onBeforeMount(async () => {
  await waitForAuthReady()

  if (!isAdmin.value) {
    await navigateTo('/', { replace: true })
    return
  }

  canRenderAdmin.value = true
})

const handleLogout = async () => {
  await logout()
  await navigateTo('/login')
}
</script>

<style lang="scss" scoped>
.admin-shell {
  min-width: 0;
  min-height: 100vh;
  display: flex;
  color: $text-primary;
  background: #fff;
}

.admin-sidebar {
  position: sticky;
  top: 0;
  width: 244px;
  height: 100vh;
  flex: 0 0 244px;
  display: flex;
  flex-direction: column;
  padding: 30px 20px 22px;
  color: #454744;
  background: #fff;
  border-right: 1px solid #e7e9e7;
}

.admin-brand {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 8px 30px;
  color: #252825;
  border-bottom: 1px solid #eceeec;
}
.admin-brand:hover { color: #252825; }
.admin-brand-mark {
  width: 38px;
  height: 48px;
  flex: 0 0 38px;
  display: block;
  object-fit: contain;
  filter: drop-shadow(0 4px 8px rgba(#31554a,.16));
}
.admin-brand-copy { display: flex; flex-direction: column; min-width: 0; }
.admin-brand-copy strong { color: #252825; font-size: 20px; line-height: 1.25; }
.admin-brand-copy small { margin-top: 2px; color: #989d99; font-size: 11px; font-weight: 700; letter-spacing: .08em; }

.admin-navigation { flex: 1; padding-top: 30px; }
.navigation-label { margin: 0 10px 12px; color: #a1a5a2; font-size: 13px; font-weight: 700; letter-spacing: .06em; }
.admin-navigation nav { display: flex; flex-direction: column; gap: 6px; }
.navigation-item,
.sidebar-action {
  width: 100%;
  min-height: 48px;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 13px;
  color: #686d69;
  background: transparent;
  border: 0;
  border-radius: 8px;
  cursor: pointer;
  font-family: $font-body;
  font-size: 13px;
  font-weight: 700;
  text-align: left;
}
.navigation-item svg,
.sidebar-action svg { width: 20px; height: 20px; flex: 0 0 20px; }
.navigation-item:hover,
.sidebar-action:hover { color: #252825; background: #f5f6f5; }
.navigation-item.active { color: #137352; background: #eef7f3; box-shadow: inset 3px 0 #16815d; }

.admin-sidebar-footer { display: flex; flex-direction: column; gap: 4px; }
.admin-language {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6px;
  margin-top: 14px;
  padding: 14px 0;
  border-top: 1px solid #eceeec;
  border-bottom: 1px solid #eceeec;
}
.admin-language button {
  min-height: 36px;
  padding: 0 8px;
  color: #6f7470;
  background: transparent;
  border: 1px solid #dde1de;
  border-radius: 7px;
  cursor: pointer;
  font-family: $font-body;
  font-size: 11px;
  font-weight: 800;
}
.admin-language button:hover { color: #137352; background: #f2f8f5; border-color: #b9d6c9; }
.admin-language button.active { color: #fff; background: #16815d; border-color: #16815d; }
.language-short { display: none; }
.admin-profile {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 18px;
  padding: 18px 8px 0;
  border-top: 1px solid #eceeec;
}
.admin-avatar {
  width: 36px;
  height: 36px;
  flex: 0 0 36px;
  display: grid;
  place-items: center;
  color: #5e645f;
  background: #ecefed;
  border-radius: 50%;
  font-size: 18px;
  font-weight: 800;
}
.admin-profile-copy { display: flex; flex-direction: column; min-width: 0; }
.admin-profile-copy strong { overflow: hidden; color: #303330; font-size: 13px; text-overflow: ellipsis; white-space: nowrap; }
.admin-profile-copy small { overflow: hidden; color: #9ca09d; font-size: 11px; text-overflow: ellipsis; white-space: nowrap; }

.admin-content {
  min-width: 0;
  flex: 1;
  padding: 0 clamp(24px, 4vw, 64px);
  background: #fff;
}

@media (max-width: 720px) {
  .admin-sidebar { width: 82px; flex-basis: 82px; padding: 22px 12px 18px; }
  .admin-brand { justify-content: center; padding: 0 0 24px; }
  .admin-brand-copy,
  .navigation-label,
  .navigation-item span,
  .sidebar-action span,
  .admin-profile-copy { display: none; }
  .admin-language { grid-template-columns: 1fr; }
  .admin-language button { padding: 0; }
  .language-full { display: none; }
  .language-short { display: inline; }
  .navigation-item,
  .sidebar-action { justify-content: center; padding: 0; }
  .admin-profile { justify-content: center; padding-left: 0; padding-right: 0; }
  .admin-content { padding: 0 16px; }
}
</style>
