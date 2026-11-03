<script setup lang="ts">
import { useI18n } from 'vue-i18n';

const props = withDefaults(
  defineProps<{
    /** Icon after the main button's label. */
    appendIcon?: string;
    /** Stretches the group to its container, growing the main button. */
    block?: boolean;
    /** Color of both segments. */
    color?: string;
    /** Disables the main button. */
    disabled?: boolean;
    /** Shows the main button as loading. */
    loading?: boolean;
    /** Disables the menu arrow. */
    menuDisabled?: boolean;
    /** Accessible name of the menu arrow; defaults to "More options". */
    menuLabel?: string;
    /** Icon before the main button's label. */
    prependIcon?: string;
  }>(),
  {
    appendIcon: undefined,
    block: false,
    color: undefined,
    disabled: false,
    loading: false,
    menuDisabled: false,
    menuLabel: undefined,
    prependIcon: undefined,
  },
);

/** The main button was clicked. */
const emit = defineEmits<{
  click: [event: MouseEvent];
}>();

defineSlots<{
  /** The main button's label. */
  default?: () => unknown;
  /** The menu's items, such as `v-list-item`s. The arrow only shows when this slot is used. */
  menu?: () => unknown;
}>();

const { t } = useI18n();
</script>

<template>
  <!-- The main action stays one click; the other actions sit behind the arrow. -->
  <v-btn-group :class="{ 'w-100': props.block }" :color="props.color" variant="tonal" divided>
    <v-btn
      :append-icon="props.appendIcon"
      :class="{ 'flex-1-1': props.block }"
      :disabled="props.disabled"
      :loading="props.loading"
      :prepend-icon="props.prependIcon"
      @click="emit('click', $event)"
    >
      <slot />
    </v-btn>
    <v-menu location="bottom end" v-if="$slots.menu">
      <template #activator="{ props: menuProps }">
        <v-btn
          v-bind="menuProps"
          :aria-label="props.menuLabel ?? t('common.moreOptions')"
          :disabled="props.menuDisabled"
          icon="mdi-menu-down"
        />
      </template>
      <v-list density="compact">
        <slot name="menu" />
      </v-list>
    </v-menu>
  </v-btn-group>
</template>
