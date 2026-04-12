<script setup lang="ts">
import type { ChangePasswordFormRequest } from '@/components/features/auth/change-password-form';
import type { UsernameFormRequest } from '@/components/features/auth/username-form';

import { ref } from 'vue';

import { FormCard } from '@/components/common/form-card';
import { PageBackground } from '@/components/common/page-background';
import { PageContainer } from '@/components/common/page-container';
import { TitledSection } from '@/components/common/titled-section';
import { ChangePasswordForm } from '@/components/features/auth/change-password-form';
import { UsernameForm } from '@/components/features/auth/username-form';
import { useCommonSnackbar } from '@/composables/snackbar/useCommonSnackbar';
import { useAuthStore } from '@/stores/auth/useAuthStore';

const authStore = useAuthStore();
const { showSuccessSnackbar, showAPIErrorSnackbar } = useCommonSnackbar();

const usernameFormId = 'username-form';
const passwordFormId = 'change-password-form';

const usernameRequest = ref<UsernameFormRequest>({
  username: authStore.user?.username ?? '',
});
const isUsernameFormValid = ref<boolean>(false);

const passwordRequest = ref<ChangePasswordFormRequest>({
  password: '',
  password_confirmed: '',
});
const isPasswordFormValid = ref<boolean>(false);

const submitUsername = async (): Promise<void> => {
  if (!isUsernameFormValid.value) {
    return;
  }

  try {
    await authStore.updateUser({ username: usernameRequest.value.username });
    showSuccessSnackbar('Username updated successfully.');
  } catch (error: unknown) {
    showAPIErrorSnackbar(error);
  }
};

const submitPassword = async (): Promise<void> => {
  if (!isPasswordFormValid.value) {
    return;
  }

  try {
    await authStore.updateUser({
      password: passwordRequest.value.password,
      password_confirmed: passwordRequest.value.password_confirmed,
    });
    showSuccessSnackbar('Password updated successfully.');
    passwordRequest.value = { password: '', password_confirmed: '' };
  } catch (error: unknown) {
    showAPIErrorSnackbar(error);
  }
};
</script>

<template>
  <page-background />
  <page-container class="position-relative">
    <v-row>
      <v-col cols="12" sm="6">
        <titled-section title="Change Password">
          <form-card>
            <change-password-form
              v-model:is-valid="isPasswordFormValid"
              v-model:request="passwordRequest"
              @submit="submitPassword"
              :id="passwordFormId"
            />

            <div class="d-flex justify-end">
              <v-btn
                :disabled="!isPasswordFormValid"
                :form="passwordFormId"
                :loading="authStore.isLoading"
                color="primary"
                type="submit"
              >
                Save Password
              </v-btn>
            </div>
          </form-card>
        </titled-section>
      </v-col>
      <v-col cols="12" sm="6">
        <titled-section title="Change Username">
          <form-card>
            <username-form
              v-model:is-valid="isUsernameFormValid"
              v-model:request="usernameRequest"
              @submit="submitUsername"
              :id="usernameFormId"
            />

            <div class="d-flex justify-end">
              <v-btn
                :disabled="!isUsernameFormValid"
                :form="usernameFormId"
                :loading="authStore.isLoading"
                color="primary"
                type="submit"
              >
                Save Username
              </v-btn>
            </div>
          </form-card>
        </titled-section>
      </v-col>
    </v-row>
  </page-container>
</template>
