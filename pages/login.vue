<template>
  <div class="auth-card">
    <div class="auth-language" :aria-label="language === 'mn' ? 'Хэл сонгох' : '언어 선택'">
      <button type="button" :class="{ active: language === 'mn' }" @click="setLanguage('mn')">Монгол хэл</button>
      <button type="button" :class="{ active: language === 'ko' }" @click="setLanguage('ko')">한국어</button>
    </div>
    <div class="auth-card-header">
      <span>MEMBERS ONLY</span>
      <h1>{{ language === 'mn' ? 'Нэвтрэх' : '로그인' }}</h1>
      <p>{{ language === 'mn' ? 'Зөвхөн зөвшөөрөгдсөн чуулганы гишүүд ашиглана.' : '승인된 교회 회원만 이용할 수 있습니다.' }}</p>
    </div>

    <form class="auth-form" @submit.prevent="handleLogin">
      <div class="form-group">
        <label for="user-id">{{ language === 'mn' ? 'Нэвтрэх нэр' : '아이디' }}</label>
        <input
          id="user-id"
          v-model.trim="userId"
          type="text"
          required
          autocomplete="username"
          :placeholder="language === 'mn' ? 'Нэвтрэх нэрээ оруулна уу' : '아이디를 입력하세요'"
          class="input-field"
          :disabled="isLoading"
        />
      </div>

      <div class="form-group">
        <label for="password">{{ language === 'mn' ? 'Нууц үг' : '비밀번호' }}</label>
        <input
          id="password"
          v-model="password"
          type="password"
          required
          autocomplete="current-password"
          :placeholder="language === 'mn' ? 'Нууц үгээ оруулна уу' : '비밀번호를 입력하세요'"
          class="input-field"
          :disabled="isLoading"
        />
      </div>

      <p v-if="errorMsg" class="form-alert error">{{ errorMsg }}</p>

      <button type="submit" class="btn btn-primary submit-button" :disabled="isLoading">
        <span v-if="isLoading" class="spinner"></span>
        <span v-else>{{ language === 'mn' ? 'Нэвтрэх' : '로그인' }}</span>
      </button>
    </form>

    <div class="auth-card-footer">
      <span>{{ language === 'mn' ? 'Бүртгэлгүй юу?' : '아직 계정이 없으신가요?' }}</span>
      <nuxt-link to="/register">{{ language === 'mn' ? 'Бүртгүүлэх хүсэлт' : '회원가입 신청' }}</nuxt-link>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'auth' })

const { login } = useAuth()
const { language, setLanguage } = useLanguage()
const userId = ref('')
const password = ref('')
const isLoading = ref(false)
const errorMsg = ref('')

const handleLogin = async () => {
  isLoading.value = true
  errorMsg.value = ''

  try {
    await login(userId.value, password.value)
    await navigateTo('/')
  } catch (error: any) {
    if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
      errorMsg.value = language.value === 'mn' ? 'Нэвтрэх нэр эсвэл нууц үг буруу байна.' : '아이디 또는 비밀번호가 올바르지 않습니다.'
    } else if (error.code === 'auth/pending-approval') {
      errorMsg.value = language.value === 'mn' ? 'Бүртгэлийн хүсэлт хүлээн авсан. Мастерын зөвшөөрлийг хүлээнэ үү.' : '가입 신청이 접수되었습니다. 마스터 계정의 승인을 기다려 주세요.'
    } else if (error.code === 'auth/profile-not-found') {
      errorMsg.value = language.value === 'mn' ? 'Гишүүний мэдээлэл холбогдоогүй байна. Удирдлагад хандана уу.' : '회원 정보가 연결되지 않은 계정입니다. 관리자에게 문의해 주세요.'
    } else {
      errorMsg.value = error.message || (language.value === 'mn' ? 'Нэвтрэх үед алдаа гарлаа.' : '로그인 중 오류가 발생했습니다.')
    }
  } finally {
    isLoading.value = false
  }
}
</script>

<style lang="scss" scoped>
.auth-card { width: min(430px,100%); padding: 42px 38px; background: #fff; border: 1px solid $border-color; border-radius: 22px; box-shadow: 0 18px 50px rgba(#1e382e,.1); }
.auth-language { display: flex; justify-content: flex-end; gap: 6px; margin-bottom: 24px; }
.auth-language button { min-height: 34px; padding: 0 11px; color: #6f7b74; background: #fff; border: 1px solid #d9e1dc; border-radius: 18px; cursor: pointer; font-family: $font-body; font-size: 11px; font-weight: 800; }
.auth-language button.active { color: #fff; background: $mn-blue; border-color: $mn-blue; }
.auth-card-header { margin-bottom: 30px; }
.auth-card-header > span { display: block; margin-bottom: 9px; color: $mn-blue; font-size: 13px; font-weight: 800; letter-spacing: .12em; }
.auth-card-header h1 { margin: 0 0 7px; font-size: 36px; }
.auth-card-header p { color: $text-secondary; font-size: 18px; }
.auth-form { display: flex; flex-direction: column; gap: 7px; }
.form-group label { text-transform: none; letter-spacing: 0; font-size: 13px; }
.input-field { min-height: 50px; font-size: 18px; }
.form-alert { margin: 5px 0; padding: 12px 14px; border-radius: 8px; font-size: 13px; line-height: 1.55; }
.form-alert.error { color: #b42318; background: #fff3f1; border: 1px solid #ffd5cf; }
.submit-button { width: 100%; min-height: 50px; margin-top: 5px; font-size: 18px; }
.auth-card-footer { display: flex; align-items: center; justify-content: center; gap: 9px; margin-top: 24px; padding-top: 20px; border-top: 1px solid $border-color; font-size: 13px; }
.auth-card-footer span { color: $text-muted; }
.auth-card-footer a { font-weight: 800; }
@media (max-width:520px) {
  .auth-card { width: 100%; padding: 26px 20px 24px; border-radius: 16px; box-shadow: 0 12px 32px rgba(#1e382e,.09); }
  .auth-language { margin-bottom: 20px; }
  .auth-language button { flex: 1; min-width: 0; padding: 0 7px; }
  .auth-card-header { margin-bottom: 24px; }
  .auth-card-header h1 { font-size: 30px; line-height: 1.25; }
  .auth-card-header p { font-size: 16px; line-height: 1.55; }
  .input-field, .submit-button { min-height: 48px; font-size: 16px; }
  .auth-card-footer { flex-wrap: wrap; gap: 5px 9px; margin-top: 20px; padding-top: 18px; text-align: center; }
}
@media (max-width:350px) { .auth-card { padding-left: 16px; padding-right: 16px; } .auth-language button { font-size: 10px; } }
</style>
