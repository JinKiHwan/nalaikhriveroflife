<template>
  <div class="auth-card">
    <template v-if="!isComplete">
      <div class="auth-card-header">
        <span>MEMBERSHIP REQUEST</span>
        <h1>회원가입</h1>
        <p>가입 신청 후 마스터 계정의 승인이 필요합니다.</p>
      </div>

      <form class="auth-form" @submit.prevent="handleRegister">
        <div class="form-group">
          <label for="register-id">아이디</label>
          <input id="register-id" v-model.trim="form.userId" type="text" required minlength="4" maxlength="24" autocomplete="username" placeholder="영문 소문자·숫자 4~24자" class="input-field" :disabled="isLoading" />
        </div>
        <div class="form-group">
          <label for="register-password">비밀번호</label>
          <input id="register-password" v-model="form.password" type="password" required minlength="6" autocomplete="new-password" placeholder="최소 6자 이상" class="input-field" :disabled="isLoading" />
        </div>
        <div class="form-group">
          <label for="register-password-confirm">비밀번호 확인</label>
          <input id="register-password-confirm" v-model="form.passwordConfirm" type="password" required minlength="6" autocomplete="new-password" placeholder="비밀번호를 한 번 더 입력하세요" class="input-field" :disabled="isLoading" />
        </div>
        <div class="form-group">
          <label for="register-name">이름</label>
          <input id="register-name" v-model.trim="form.name" type="text" required maxlength="30" autocomplete="name" placeholder="성함을 입력하세요" class="input-field" :disabled="isLoading" />
        </div>

        <p v-if="errorMsg" class="form-alert error">{{ errorMsg }}</p>

        <button type="submit" class="btn btn-primary submit-button" :disabled="isLoading">
          <span v-if="isLoading" class="spinner"></span>
          <span v-else>가입 승인 요청</span>
        </button>
      </form>
    </template>

    <div v-else class="complete-state">
      <span class="complete-icon">✓</span>
      <h1>가입 신청 완료</h1>
      <p>마스터 계정이 승인하면 로그인이 가능합니다.</p>
      <nuxt-link to="/login" class="btn btn-primary">로그인 화면으로</nuxt-link>
    </div>

    <div v-if="!isComplete" class="auth-card-footer">
      <span>이미 계정이 있으신가요?</span>
      <nuxt-link to="/login">로그인</nuxt-link>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'auth' })

const { register } = useAuth()
const form = ref({ userId: '', password: '', passwordConfirm: '', name: '' })
const isLoading = ref(false)
const isComplete = ref(false)
const errorMsg = ref('')

const handleRegister = async () => {
  errorMsg.value = ''

  if (form.value.password !== form.value.passwordConfirm) {
    errorMsg.value = '비밀번호가 서로 일치하지 않습니다.'
    return
  }

  isLoading.value = true

  try {
    await register(form.value.userId, form.value.password, form.value.name)
    isComplete.value = true
  } catch (error: any) {
    if (error.code === 'auth/email-already-in-use') errorMsg.value = '이미 사용 중인 아이디입니다.'
    else if (error.code === 'auth/weak-password') errorMsg.value = '비밀번호는 최소 6자 이상이어야 합니다.'
    else errorMsg.value = error.message || '가입 신청 중 오류가 발생했습니다.'
  } finally {
    isLoading.value = false
  }
}
</script>

<style lang="scss" scoped>
.auth-card { width: min(450px,100%); padding: 40px 38px; background: #fff; border: 1px solid $border-color; border-radius: 22px; box-shadow: 0 18px 50px rgba(#1e382e,.1); }
.auth-card-header { margin-bottom: 26px; }
.auth-card-header > span { display: block; margin-bottom: 9px; color: $mn-blue; font-size: 13px; font-weight: 800; letter-spacing: .1em; }
.auth-card-header h1,.complete-state h1 { margin: 0 0 7px; font-size: 34px; }
.auth-card-header p,.complete-state p { color: $text-secondary; font-size: 18px; line-height: 1.6; }
.auth-form { display: flex; flex-direction: column; gap: 5px; }
.form-group label { text-transform: none; letter-spacing: 0; font-size: 13px; }
.input-field { min-height: 48px; font-size: 18px; }
.form-alert { margin: 5px 0; padding: 12px 14px; border-radius: 8px; font-size: 13px; }
.form-alert.error { color: #b42318; background: #fff3f1; border: 1px solid #ffd5cf; }
.submit-button { width: 100%; min-height: 50px; margin-top: 6px; font-size: 18px; }
.auth-card-footer { display: flex; justify-content: center; gap: 9px; margin-top: 22px; padding-top: 19px; border-top: 1px solid $border-color; font-size: 13px; }
.auth-card-footer span { color: $text-muted; }
.auth-card-footer a { font-weight: 800; }
.complete-state { display: flex; flex-direction: column; align-items: center; text-align: center; padding: 18px 0; }
.complete-icon { width: 58px; height: 58px; display: grid; place-items: center; margin-bottom: 19px; color: #fff; background: $mn-blue; border-radius: 50%; font-size: 28px; }
.complete-state .btn { margin-top: 25px; }
@media (max-width:520px) { .auth-card { padding: 34px 24px; } }
</style>
