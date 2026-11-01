<script setup lang="ts">
import type { RegisterRequest } from '@/components/features/auth/register-form';
import type { AuthLoginRequest } from '@/interfaces/api/requests/AuthLoginRequest';

import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';

import { HeadingText } from '@/components/common/heading-text';
import { LoginForm } from '@/components/features/auth/login-form';
import { RegisterForm } from '@/components/features/auth/register-form';
import { LanguageMenu } from '@/components/features/locale/language-menu';
import { useCommonSnackbar } from '@/composables/snackbar/useCommonSnackbar';
import { useAuthStore } from '@/stores/auth/useAuthStore';

const authStore = useAuthStore();
const router = useRouter();
const { showSuccessSnackbar, showAPIErrorSnackbar } = useCommonSnackbar();
const { t } = useI18n();

const loginFormId = 'login-form';
const registerFormId = 'register-form';

const mode = ref<'login' | 'register'>('login');

const loginRequest = ref<AuthLoginRequest>({
  username: '',
  password: '',
});

const isLoginFormValid = ref<boolean>(false);

const registerRequest = ref<RegisterRequest>({
  username: '',
  password: '',
  password_confirmation: '',
});

const isRegisterFormValid = ref<boolean>(false);

const submitLogin = async (): Promise<void> => {
  if (!isLoginFormValid.value) {
    return;
  }

  try {
    await authStore.login(loginRequest.value);
    showSuccessSnackbar(t('auth.loggedIn'));
    void router.push({ name: 'authenticated-home' });
  } catch (error: unknown) {
    showAPIErrorSnackbar(error);
  }
};

const submitRegister = async (): Promise<void> => {
  if (!isRegisterFormValid.value) {
    return;
  }

  try {
    await authStore.register(registerRequest.value);
    showSuccessSnackbar(t('auth.accountCreated'));
    void router.push({ name: 'authenticated-home' });
  } catch (error: unknown) {
    showAPIErrorSnackbar(error);
  }
};
</script>

<template>
  <v-container
    class="d-flex flex-lg-column flex-row align-center justify-center position-relative"
    style="height: 100vh; z-index: 1"
    fluid
  >
    <div
      class="position-absolute w-100 h-100"
      style="background-image: url('/backgrounds/movie-background.jpg'); background-size: cover"
    ></div>
    <div class="position-absolute" style="top: 16px; right: 16px">
      <language-menu />
    </div>
    <v-row align="center" class="position-relative" gap="64" justify="center">
      <v-col cols="12" lg="6">
        <div class="d-flex flex-column align-start ga-4">
          <v-chip color="secondary" variant="flat">MovieBrowser 3</v-chip>
          <heading-text :subtitle="t('auth.heroSubtitle')" :title="t('auth.heroTitle')" />
        </div>
      </v-col>
      <v-col cols="12" lg="5">
        <v-card border="sm" color="rgba(var(--v-theme-surface), 0.88)" rounded="xl" style="backdrop-filter: blur(5px)">
          <v-card-text class="pa-8 d-flex flex-column ga-6">
            <v-btn-toggle v-model="mode" color="secondary" mandatory>
              <v-btn value="login">{{ t('auth.login') }}</v-btn>
              <v-btn value="register">{{ t('auth.register') }}</v-btn>
            </v-btn-toggle>

            <div style="max-width: 450px">
              <heading-text
                :level="2"
                :subtitle="t('auth.welcomeSubtitle')"
                :title="t('auth.welcomeTitle')"
                v-if="mode === 'login'"
              />
              <heading-text :level="2" :subtitle="t('auth.createSubtitle')" :title="t('auth.createTitle')" v-else />
            </div>

            <template v-if="mode === 'login'">
              <login-form
                v-model:is-valid="isLoginFormValid"
                v-model:request="loginRequest"
                @submit="submitLogin"
                :id="loginFormId"
              />
              <v-btn
                :disabled="!isLoginFormValid"
                :form="loginFormId"
                :loading="authStore.isLoading"
                color="primary"
                type="submit"
              >
                {{ t('auth.login') }}
              </v-btn>
            </template>

            <template v-else>
              <register-form
                v-model:is-valid="isRegisterFormValid"
                v-model:request="registerRequest"
                @submit="submitRegister"
                :id="registerFormId"
              />
              <v-btn
                :disabled="!isRegisterFormValid"
                :form="registerFormId"
                :loading="authStore.isLoading"
                color="primary"
                type="submit"
              >
                {{ t('auth.register') }}
              </v-btn>
            </template>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
