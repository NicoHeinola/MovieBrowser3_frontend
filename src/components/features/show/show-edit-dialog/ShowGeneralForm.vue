<script setup lang="ts">
import type { Show } from '@/interfaces/api/models/Show';
import { BaseForm } from '@/components/common/base-form';
import { useConfirmDialog } from '@/composables/dialog/useConfirmDialog';

const props = defineProps<{
  id: string;
}>();

const show = defineModel<Show | null>('show', { required: true });
const isValid = defineModel<boolean>('isValid', {
  default: false,
});

const { confirm } = useConfirmDialog();

const getShowTitleRoundedClass = (index: number) => {
  if (index === 0) {
    return 'b-0';
  }

  if (index === (show.value?.titles.length || 1) - 1) {
    return 't-0';
  }

  return '0';
};

const removeTitle = async (index: number) => {
  const isConfirmed = await confirm({
    message: 'Are you sure you want to remove this title?',
    confirmColor: 'error',
    confirmText: 'Remove',
  });

  if (isConfirmed) {
    show.value?.titles.splice(index, 1);
  }
};

const setPrimaryTitle = (index: number) => {
  if (!show.value) {
    return;
  }

  for (const [i, title] of show.value.titles.entries()) {
    title.is_primary = i === index;
  }
};
</script>

<template>
  <base-form v-model:is-valid="isValid" :id="props.id">
    <v-row gap="0">
      <v-col v-for="(title, index) in show?.titles" cols="12" :key="title.id">
        <v-text-field
          v-model="show!.titles[index].title"
          :label="index === 0 ? 'Show title' : undefined"
          :rounded="getShowTitleRoundedClass(index)"
          :style="{ marginTop: index === 0 ? undefined : '-1px' }"
        >
          <template #append>
            <div class="d-flex ga-2">
              <v-btn
                :icon="title.is_primary ? 'mdi-star' : 'mdi-star-outline'"
                size="x-small"
                @click="setPrimaryTitle(index)"
              ></v-btn>
              <v-btn color="error" icon="mdi-trash-can" size="x-small" @click="removeTitle(index)"></v-btn>
            </div>
          </template>
        </v-text-field>
      </v-col>
    </v-row>
  </base-form>
</template>
