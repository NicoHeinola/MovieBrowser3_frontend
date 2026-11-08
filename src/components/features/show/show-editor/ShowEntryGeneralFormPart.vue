<script setup lang="ts">
import type { ShowEntryFormData } from './ShowEntryFormData';
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { ShowEntryType } from '@/enums/show/ShowEntryType';
import { getRules } from './showEntriesFormRules';

const { t } = useI18n();

const entry = defineModel<ShowEntryFormData>('entry', { required: true });

const rules = computed(() => getRules({ entries: [entry.value] }));

const entryTypeOptions = computed(() => [
  { title: t('showEntry.type.season'), value: ShowEntryType.Season },
  { title: t('showEntry.type.tv_special'), value: ShowEntryType.TvSpecial },
  { title: t('showEntry.type.movie'), value: ShowEntryType.Movie },
]);
</script>

<template>
  <v-row>
    <v-col cols="12">
      <v-text-field v-model="entry.name" :label="t('show.entryName')" :rules="rules.name" class="required" />
    </v-col>
    <v-col cols="12">
      <v-select
        v-model="entry.type"
        :items="entryTypeOptions"
        :label="t('show.entryType')"
        :rules="rules.type"
        class="required"
        item-title="title"
        item-value="value"
      />
    </v-col>
  </v-row>
</template>
