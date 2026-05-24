<script setup lang="ts">
import type { ShowEntryFormData } from './ShowEntriesFormData';
import { computed } from 'vue';
import { ShowEntryType } from '@/enums/show/ShowEntryType';
import { getRules } from './showEntriesFormRules';

const entry = defineModel<ShowEntryFormData>('entry', { required: true });

const rules = computed(() => getRules({ entries: [entry.value] }));

const entryTypeOptions = [
  { title: 'Season', value: ShowEntryType.Season },
  { title: 'TV Special', value: ShowEntryType.TvSpecial },
  { title: 'Movie', value: ShowEntryType.Movie },
];
</script>

<template>
  <v-row>
    <v-col cols="12">
      <v-text-field v-model="entry.name" :rules="rules.name" class="required" label="Entry name" />
    </v-col>
    <v-col cols="12">
      <v-select
        v-model="entry.type"
        :items="entryTypeOptions"
        :rules="rules.type"
        class="required"
        item-title="title"
        item-value="value"
        label="Entry type"
      />
    </v-col>
  </v-row>
</template>
