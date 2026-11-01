<script setup lang="ts">
import { useI18n } from 'vue-i18n';

import { useLocale } from '@/composables/locale/useLocale';
import { languageOptions } from '@/data/locale/languageOptions';

const { t } = useI18n();
const { locale, setLocale } = useLocale();
</script>

<template>
  <v-menu>
    <template #activator="{ props: menuProps }">
      <!-- Lets other menus open the language list from their own item, such as the account menu. -->
      <slot :props="menuProps" name="activator">
        <v-btn v-bind="menuProps" color="default" icon="mdi-translate" v-tooltip:bottom="t('locale.change')" />
      </slot>
    </template>
    <v-list :selected="[locale]" density="compact" mandatory>
      <v-list-item
        v-for="option in languageOptions"
        :title="option.name"
        :value="option.locale"
        @click="setLocale(option.locale)"
        :key="option.locale"
      />
    </v-list>
  </v-menu>
</template>
