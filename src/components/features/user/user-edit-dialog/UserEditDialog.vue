<script setup lang="ts">
import type { UserFormData } from './UserFormData';
import type { DialogComponentProps } from '@/components/layouts/dialog-provider';
import type { UpdateUserRequest } from '@/interfaces/api/requests/UpdateUserRequest';

import { computed, onMounted, ref, useTemplateRef, watch } from 'vue';
import { BaseDialog } from '@/components/common/base-dialog';
import { BaseForm } from '@/components/common/base-form';
import { useConfirmDialog } from '@/composables/dialog/useConfirmDialog';
import { useCommonSnackbar } from '@/composables/snackbar/useCommonSnackbar';
import { userService } from '@/services/user/userService';
import { useAuthStore } from '@/stores/auth/useAuthStore';
import { deepClone } from '@/utils/clone/deepClone';
import { getChangedObject } from '@/utils/object/hasObjectChanged';
import { getRules } from './userEditDialogRules';

const props = defineProps<DialogComponentProps<boolean>>();

const user = defineModel<UserFormData>('user', { required: true });
const originalUser = ref<UserFormData | null>(null);

const isFormValid = ref<boolean>(false);
const isSaving = ref<boolean>(false);
const confirmPasswordField = useTemplateRef<{ validate: (silent?: boolean) => Promise<string[]> }>(
  'confirmPasswordField',
);

const isDialogVisible = defineModel<boolean>({ required: true });

const authStore = useAuthStore();
const { confirm } = useConfirmDialog();
const { showAPIErrorSnackbar, showSuccessSnackbar } = useCommonSnackbar();
const rules = getRules(
  () => !user.value.id,
  () => user.value.password,
);

/** The backend refuses deleting yourself, and removing your own admin rights would lock you out of this page. */
const isCurrentUser = computed<boolean>(() => Boolean(user.value.id) && user.value.id === authStore.user?.id);

/**
 * Collects the fields that differ from the opened user. The password starts blank, so leaving it blank keeps the
 * current one, and a new password always carries its confirmation.
 *
 * @returns The update request, or `undefined` when nothing changed.
 */
const getUpdateRequest = (): UpdateUserRequest | undefined => {
  if (!originalUser.value) {
    return undefined;
  }

  const changes = getChangedObject(originalUser.value, user.value, {
    include: ['username', 'is_admin', 'password'],
  });

  if (!changes?.password) {
    return changes;
  }

  return { ...changes, password_confirmation: user.value.password_confirmation };
};

const saveUser = async (): Promise<void> => {
  if (user.value.id) {
    const request = getUpdateRequest();

    if (!request) {
      return;
    }

    const updatedUser = await userService.update(user.value.id, request);

    // Keep the navigation and profile in sync when admins edit themselves here.
    if (isCurrentUser.value) {
      authStore.user = updatedUser;
    }
    return;
  }

  const createdUser = await userService.create({
    username: user.value.username,
    password: user.value.password,
    password_confirmation: user.value.password_confirmation,
    is_admin: user.value.is_admin,
  });
  user.value.id = createdUser.id;
};

const handleSave = async (): Promise<void> => {
  if (!isFormValid.value) {
    return;
  }

  isSaving.value = true;

  try {
    await saveUser();

    showSuccessSnackbar('User saved successfully.');

    props.close(true);
  } catch (error: unknown) {
    showAPIErrorSnackbar(error);
  } finally {
    isSaving.value = false;
  }
};

const deleteUser = async (): Promise<void> => {
  const confirmed = await confirm({
    message: `Are you sure you want to delete “${originalUser.value?.username}”? This action cannot be undone.`,
    confirmText: 'Delete',
    confirmColor: 'error',
    cancelText: 'Cancel',
  });

  if (!confirmed) {
    return;
  }

  isSaving.value = true;

  try {
    await userService.remove(user.value.id);
    props.close(true);
  } catch (error: unknown) {
    showAPIErrorSnackbar(error);
  } finally {
    isSaving.value = false;
  }
};

watch(
  () => user.value.password,
  () => {
    // The confirmation only re-checks its own input, so a new password would otherwise leave a blank confirmation
    // valid. Stay silent until it is typed into so the error does not appear while the password is being entered.
    void confirmPasswordField.value?.validate(!user.value.password_confirmation);
  },
);

onMounted(() => {
  if (user.value?.id) {
    originalUser.value = deepClone<UserFormData>(user.value);
  }
});
</script>

<template>
  <base-dialog v-model="isDialogVisible" max-width="600px">
    <template #title>
      {{ user?.id ? 'Edit User' : 'Create User' }}
    </template>

    <template #default>
      <base-form v-model:is-valid="isFormValid" @submit="handleSave" id="user-form">
        <v-row>
          <v-col cols="12">
            <v-text-field
              v-model="user.username"
              :rules="rules.username"
              autocomplete="off"
              class="required"
              label="Username"
            />
          </v-col>

          <v-col cols="12" sm="6">
            <v-text-field
              v-model="user.password"
              :class="{ required: !user.id }"
              :hint="user.id ? 'Leave blank to keep the current password.' : undefined"
              :rules="rules.password"
              autocomplete="new-password"
              label="Password"
              type="password"
              persistent-hint
            />
          </v-col>

          <v-col cols="12" sm="6">
            <v-text-field
              v-model="user.password_confirmation"
              :class="{ required: !user.id || user.password }"
              :rules="rules.confirmPassword"
              autocomplete="new-password"
              label="Confirm password"
              type="password"
              ref="confirmPasswordField"
            />
          </v-col>

          <v-col cols="12">
            <v-switch
              v-model="user.is_admin"
              :disabled="isCurrentUser"
              :hint="isCurrentUser ? 'You cannot remove your own admin rights.' : undefined"
              color="primary"
              label="Admin"
              persistent-hint
            />
          </v-col>
        </v-row>
      </base-form>
    </template>

    <template #actions>
      <v-btn
        :disabled="isSaving"
        color="error"
        prepend-icon="mdi-trash-can"
        variant="text"
        @click="deleteUser"
        v-if="user?.id && !isCurrentUser"
      >
        Delete
      </v-btn>
      <v-spacer />
      <v-btn :disabled="isSaving" variant="text" @click="props.close()"> Cancel </v-btn>
      <v-btn
        :disabled="!isFormValid || isSaving"
        :loading="isSaving"
        color="primary"
        variant="flat"
        @click="handleSave"
      >
        Save
      </v-btn>
    </template>
  </base-dialog>
</template>
