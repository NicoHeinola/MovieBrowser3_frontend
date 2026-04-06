<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';

import { LoginForm, type LoginRequest } from '@/components/features/auth/login-form';
import { RegisterForm, type RegisterRequest } from '@/components/features/auth/register-form';
import { useAuthStore } from '@/stores/auth/useAuthStore';

const authStore = useAuthStore();
const router = useRouter();

const mode = ref<'login' | 'register'>('login');

const loginRequest = ref<LoginRequest>({
  email: '',
  password: '',
});

const isLoginFormValid = ref(false);

const registerRequest = ref<RegisterRequest>({
  email: '',
  password: '',
  confirmPassword: '',
});

const isRegisterFormValid = ref(false);

const submitLogin = async (): Promise<void> => {
  if (!isLoginFormValid.value) {
    return;
  }

  authStore.login(loginRequest.value.email);

  await router.push('/');
};

const submitRegister = async (): Promise<void> => {
  if (!isRegisterFormValid.value) {
    return;
  }

  authStore.register(registerRequest.value.email);

  await router.push('/');
};
</script>

<template>
  <v-container class="d-flex flex-lg-column flex-row align-center justify-center" style="height: 100vh">
    <v-row align="center" gap="64" justify="center">
      <v-col cols="12" lg="6">
        <div class="d-flex flex-column align-start ga-4">
          <v-chip color="secondary" variant="flat">MovieBrowser 3</v-chip>
          <div>
            <h1>Your movie library — at your fingertips.</h1>
            <p class="text-medium-emphasis">
              View trailers, watch shows, rate movies, and get personalized recommendations. All in one place.
            </p>
          </div>
        </div>
      </v-col>
      <v-col cols="12" lg="5">
        <v-card border="sm" color="rgba(var(--v-theme-surface), 0.88)" rounded="xl" style="backdrop-filter: blur(5px)">
          <v-card-text class="pa-8 d-flex flex-column ga-6">
            <v-btn-toggle v-model="mode" color="secondary" mandatory>
              <v-btn value="login">Login</v-btn>
              <v-btn value="register">Register</v-btn>
            </v-btn-toggle>

            <div style="width: 450px">
              <template v-if="mode === 'login'">
                <h2>Welcome back</h2>
                <p class="text-medium-emphasis">Sign in to continue browsing your library and picks.</p>
              </template>
              <template v-else>
                <h2>Create your account</h2>
                <p class="text-medium-emphasis">Register to start building your movie library.</p>
              </template>
            </div>

            <template v-if="mode === 'login'">
              <login-form v-model:is-valid="isLoginFormValid" v-model:request="loginRequest" />
              <v-btn :disabled="!isLoginFormValid" color="primary" block @click="submitLogin"> Login </v-btn>
            </template>

            <template v-else>
              <register-form v-model:is-valid="isRegisterFormValid" v-model:request="registerRequest" />
              <v-btn :disabled="!isRegisterFormValid" color="primary" block @click="submitRegister"> Register </v-btn>
            </template>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
