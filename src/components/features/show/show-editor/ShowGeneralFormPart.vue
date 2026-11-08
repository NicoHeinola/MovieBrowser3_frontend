<script setup lang="ts">
import type { ShowGeneralFormData } from './ShowGeneralFormData';
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { FormItemList } from '@/components/common/form-item-list';
import { CategoryAutocomplete } from '@/components/features/category-autocomplete';
import { useConfirmDialog } from '@/composables/dialog/useConfirmDialog';
import { getPrimaryTitle } from '@/utils/show/getPrimaryTitle';
import { getRules } from './showGeneralFormRules';

const show = defineModel<ShowGeneralFormData>('show', { required: true });

const rules = computed(() => getRules(show.value));

const { confirm } = useConfirmDialog();
const { t } = useI18n();

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
  const hasTitleTitle = !!show.value?.titles[index].title;
  if (hasTitleTitle) {
    const isConfirmed = await confirm({
      message: t('show.removeTitleConfirm'),
      confirmColor: 'error',
      confirmText: t('common.remove'),
    });

    if (!isConfirmed) {
      return;
    }
  }

  const wasPrimary = show.value?.titles[index].is_primary;

  show.value?.titles.splice(index, 1);

  if (wasPrimary) {
    setPrimaryTitle(0);
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

const addTitle = () => {
  show.value?.titles.push({ title: '', is_primary: false });
};

const googleSearch = (searchTerm: string) => {
  const baseUrl = 'https://www.google.com/search';
  const params = new URLSearchParams({ q: searchTerm });
  window.open(`${baseUrl}?${params.toString()}`, '_blank');
};
</script>

<template>
  <form-item-list :has-items="(show?.titles.length ?? 0) > 0">
    <v-row gap="0">
      <v-col v-for="(title, index) in show?.titles" cols="12" :key="index">
        <div class="d-flex ga-2 align-center">
          <v-text-field
            v-model="show!.titles[index].title"
            :class="{ required: index === 0 }"
            :label="index === 0 ? t('show.title') : undefined"
            :rounded="getShowTitleRoundedClass(index)"
            :rules="[...rules.title, (value: string) => rules.titles(value, index)]"
            :style="{ marginTop: index === 0 ? undefined : '-1px' }"
          />
          <v-btn
            :icon="title.is_primary ? 'mdi-star' : 'mdi-star-outline'"
            color="primary"
            size="x-small"
            @click="setPrimaryTitle(index)"
          ></v-btn>
          <v-btn
            :disabled="show!.titles.length === 1"
            color="error"
            icon="mdi-trash-can"
            size="x-small"
            @click="removeTitle(index)"
          ></v-btn>
        </div>
      </v-col>
    </v-row>

    <template #actions>
      <v-btn size="small" variant="text" @click="addTitle"> {{ t('show.addTitle') }} </v-btn>
    </template>
  </form-item-list>

  <v-row>
    <v-col cols="12">
      <div class="d-flex ga-2 align-start">
        <v-textarea v-model="show!.description" :label="t('show.description')" :rules="rules.description" />
        <v-btn
          icon="mdi-auto-fix"
          size="x-small"
          @click="googleSearch('Short description for show: ' + getPrimaryTitle(show))"
          v-tooltip:bottom="t('show.autofill')"
        />
      </div>
    </v-col>
  </v-row>

  <v-row>
    <v-col cols="12">
      <category-autocomplete
        v-model="show!.categories"
        :label="t('show.categories')"
        chips
        closable-chips
        multiple
        return-object
      />
    </v-col>
  </v-row>
</template>
