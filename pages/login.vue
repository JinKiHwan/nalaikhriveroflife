<template>
  <div class="login-card">
    <div class="login-header">
      <h2>로그인</h2>
      <p class="login-desc">성도 전용 폐쇄형 시스템입니다.</p>
    </div>

    <form @submit.prevent="handleLogin" class="login-form">
      <div class="form-group">
        <label for="email">이메일 주소</label>
        <input
          id="email"
          v-model="email"
          type="email"
          required
          placeholder="email@example.com"
          class="input-field"
          :disabled="isLoading"
        />
      </div>

      <div class="form-group">
        <label for="password">비밀번호</label>
        <input
          id="password"
          v-model="password"
          type="password"
          required
          placeholder="••••••••"
          class="input-field"
          :disabled="isLoading"
        />
      </div>

      <div v-if="errorMsg" class="error-alert">
        {{ errorMsg }}
      </div>

      <button type="submit" class="btn btn-primary btn-login" :disabled="isLoading">
        <span v-if="isLoading" class="spinner"></span>
        <span v-else>로그인</span>
      </button>
    </form>

    <p class="login-notice">
      계정이 없으신가요? 담당 목회자에게 문의하세요.
    </p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

definePageMeta({ layout: 'auth' })

const { login } = useAuth()
const email = ref('')
const password = ref('')
const isLoading = ref(false)
const errorMsg = ref('')

const handleLogin = async () => {
  isLoading.value = true
  errorMsg.value = ''
  try {
    await login(email.value, password.value)
    navigateTo('/')
  } catch (err: any) {
    if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
      errorMsg.value = '이메일 또는 비밀번호가 올바르지 않습니다.'
    } else if (err.code === 'auth/invalid-email') {
      errorMsg.value = '유효하지 않은 이메일 형식입니다.'
    } else {
      errorMsg.value = err.message || '로그인 중 오류가 발생했습니다.'
    }
  } finally {
    isLoading.value = false
  }
}
</script>

<style lang="scss" scoped>
.login-card {
  background: $bg-card;
  border: 1px solid $border-color;
  border-radius: $radius-lg;
  padding: 40px 36px;
  box-shadow: $shadow-md;
  width: 100%;
  max-width: 400px;
}

.login-header {
  margin-bottom: 28px;

  h2 {
    font-size: 1.6rem;
    font-weight: 800;
    color: $text-primary;
    margin-bottom: 4px;
  }

  .login-desc {
    font-size: 0.88rem;
    color: $text-secondary;
  }
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.error-alert {
  background: rgba($danger, 0.06);
  border: 1px solid rgba($danger, 0.2);
  color: $danger;
  padding: 10px 14px;
  border-radius: $radius-sm;
  font-size: 0.85rem;
  margin: 8px 0;
}

.btn-login {
  width: 100%;
  margin-top: 8px;
  padding: 12px;
  font-size: 0.95rem;
}

.login-notice {
  margin-top: 20px;
  text-align: center;
  font-size: 0.8rem;
  color: $text-muted;
}
</style>
