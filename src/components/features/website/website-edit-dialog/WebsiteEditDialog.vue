<script setup lang="ts">
import type { DialogComponentProps } from '@/components/layouts/dialog-provider';
import type { Website } from '@/interfaces/api/models/Website';
import type { WebsiteTag } from '@/interfaces/api/models/WebsiteTag';
import type { CreateWebsiteRequest } from '@/interfaces/api/requests/CreateWebsiteRequest';

import { computed, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { BaseDialog } from '@/components/common/base-dialog';
import { BaseForm } from '@/components/common/base-form';
import { MdiIconAutocomplete } from '@/components/common/mdi-icon-autocomplete';
import { useConfirmDialog } from '@/composables/dialog/useConfirmDialog';
import { useCommonSnackbar } from '@/composables/snackbar/useCommonSnackbar';
import { useCreatePendingWebsiteTags } from '@/composables/website/useCreatePendingWebsiteTags';
import { WebsiteIconKind } from '@/enums/website/WebsiteIconKind';
import { websiteService } from '@/services/website/websiteService';
import { getChangedObject } from '@/utils/object/hasObjectChanged';
import { getAutofilledWebsiteTitle } from '@/utils/website/getAutofilledWebsiteTitle';
import { getWebsiteDisplayName } from '@/utils/website/getWebsiteDisplayName';
import { getWebsiteIconKind } from '@/utils/website/getWebsiteIconKind';
import { normalizeWebsiteUrl } from '@/utils/website/normalizeWebsiteUrl';
import { WebsiteIcon } from '../website-icon';
import { WebsiteTagAutocomplete } from '../website-tag-autocomplete';
import { getRules } from './websiteEditDialogRules';

const props = defineProps<DialogComponentProps<boolean>>();

const website = defineModel<Website>('website', { required: true });
const isDialogVisible = defineModel<boolean>({ required: true });

const initialIconKind = getWebsiteIconKind(website.value.icon);

const tagIds = ref<number[]>(website.value.tags.map((tag) => tag.id));
const pendingTags = ref<WebsiteTag[]>([]);
/** URL the icon preview uses. It follows the field on blur, so typing does not fetch a favicon per keystroke. */
const previewUrl = ref<string>(normalizeWebsiteUrl(website.value.url ?? ''));
/** Title last filled in from the URL, so a later URL change can replace it but never a title the user typed. */
const autofilledTitle = ref<string | null>(null);
const iconKind = ref<WebsiteIconKind>(initialIconKind);
const mdiIcon = ref<string>(initialIconKind === WebsiteIconKind.Mdi ? (website.value.icon ?? '') : 'mdi-web');
const imageUrl = ref<string>(initialIconKind === WebsiteIconKind.Image ? (website.value.icon ?? '') : '');
const originalRequest = ref<CreateWebsiteRequest | null>(null);
const isFormValid = ref<boolean>(false);
const isSaving = ref<boolean>(false);

const { confirm } = useConfirmDialog();
const { showAPIErrorSnackbar, showSuccessSnackbar } = useCommonSnackbar();
const { createPendingTags } = useCreatePendingWebsiteTags();
const { t } = useI18n();
const rules = getRules();

const iconKindOptions = computed(() => [
  { value: WebsiteIconKind.Favicon, label: t('website.iconFavicon'), icon: 'mdi-web' },
  { value: WebsiteIconKind.Mdi, label: t('website.iconIcon'), icon: 'mdi-emoticon-outline' },
  { value: WebsiteIconKind.Image, label: t('website.iconImage'), icon: 'mdi-image-outline' },
]);

/** Icon value saved for the chosen icon kind; null lets the site's favicon show. */
const resolvedIcon = computed<string | null>(() => {
  if (iconKind.value === WebsiteIconKind.Mdi) {
    return mdiIcon.value || null;
  }

  if (iconKind.value === WebsiteIconKind.Image) {
    return imageUrl.value.trim() || null;
  }

  return null;
});

const normalizedUrl = computed<string>(() => normalizeWebsiteUrl(website.value.url ?? ''));

/**
 * Builds the full save payload from the form, trimming text and turning blanks into null.
 * @returns The request.
 */
const buildRequest = (): CreateWebsiteRequest => {
  return {
    url: normalizedUrl.value,
    title: website.value.title?.trim() || null,
    icon: resolvedIcon.value,
    description: website.value.description?.trim() || null,
    is_favorite: website.value.is_favorite,
    tag_ids: tagIds.value.toSorted((a, b) => a - b),
  };
};

/**
 * Once the URL field loses focus, adds `https://` to a URL typed without a scheme and fills the title from it.
 * @returns void
 */
const normalizeUrlInput = (): void => {
  website.value.url = normalizedUrl.value;
  previewUrl.value = normalizedUrl.value;

  const title = getAutofilledWebsiteTitle(website.value.title, autofilledTitle.value, normalizedUrl.value);

  if (title) {
    website.value.title = title;
    autofilledTitle.value = title;
  }
};

/**
 * Creates the new tags, then creates the website or patches only the changed fields of an existing one.
 * @returns Nothing.
 */
const saveWebsite = async (): Promise<void> => {
  await createPendingTags(tagIds, pendingTags);

  const request = buildRequest();

  if (website.value.id) {
    const changes = getChangedObject(originalRequest.value, request);

    if (!changes) {
      return;
    }

    await websiteService.update(website.value.id, changes);
    return;
  }

  const createdWebsite = await websiteService.create(request);
  website.value.id = createdWebsite.id;
};

const handleSave = async (): Promise<void> => {
  if (!isFormValid.value) {
    return;
  }

  isSaving.value = true;

  try {
    await saveWebsite();

    showSuccessSnackbar(t('website.saved'));

    props.close(true);
  } catch (error: unknown) {
    showAPIErrorSnackbar(error);
  } finally {
    isSaving.value = false;
  }
};

const deleteWebsite = async (): Promise<void> => {
  const confirmed = await confirm({
    message: t('website.deleteConfirm', { name: getWebsiteDisplayName(website.value) }),
    confirmText: t('common.delete'),
    confirmColor: 'error',
    cancelText: t('common.cancel'),
  });

  if (!confirmed) {
    return;
  }

  isSaving.value = true;

  try {
    await websiteService.remove(website.value.id);
    props.close(true);
  } catch (error: unknown) {
    showAPIErrorSnackbar(error);
  } finally {
    isSaving.value = false;
  }
};

onMounted(() => {
  if (website.value?.id) {
    originalRequest.value = buildRequest();
  }
});
</script>

<template>
  <base-dialog v-model="isDialogVisible" max-width="640px">
    <template #title>
      {{ website?.id ? 'Edit Website' : 'Add Website' }}
    </template>

    <template #default>
      <base-form v-model:is-valid="isFormValid" @submit="handleSave" id="website-form">
        <v-row>
          <v-col cols="12">
            <v-text-field
              v-model="website.url"
              :autofocus="!website.id"
              :label="t('website.url')"
              :rules="rules.url"
              class="required"
              placeholder="https://example.com"
              prepend-inner-icon="mdi-link-variant"
              type="url"
              @blur="normalizeUrlInput"
            />
          </v-col>

          <v-col cols="12">
            <v-text-field v-model="website.title" :label="t('website.title')" :rules="rules.title" />
          </v-col>

          <v-col cols="12">
            <v-textarea
              v-model="website.description"
              :counter="5000"
              :label="t('website.description')"
              :rules="rules.description"
              rows="3"
              auto-grow
            />
          </v-col>

          <v-col cols="12">
            <v-switch
              v-model="website.is_favorite"
              :hint="t('website.favoriteHint')"
              :label="t('website.favorite')"
              persistent-hint
            />
          </v-col>

          <v-col cols="12">
            <website-tag-autocomplete v-model="tagIds" v-model:pending-tags="pendingTags" :rules="rules.tags" />
          </v-col>

          <v-col class="d-flex align-center ga-4" cols="12">
            <website-icon :icon="resolvedIcon" :size="44" :url="previewUrl" />
            <v-btn-toggle v-model="iconKind" mandatory>
              <v-btn
                v-for="option in iconKindOptions"
                :prepend-icon="option.icon"
                :value="option.value"
                :key="option.value"
              >
                {{ option.label }}
              </v-btn>
            </v-btn-toggle>
          </v-col>

          <v-col cols="12" v-if="iconKind === WebsiteIconKind.Favicon">
            <p class="text-body-medium text-medium-emphasis">
              {{ t('website.faviconHint') }}
            </p>
          </v-col>

          <v-col cols="12" v-else-if="iconKind === WebsiteIconKind.Mdi">
            <mdi-icon-autocomplete v-model="mdiIcon" :rules="rules.mdiIcon" class="required" />
          </v-col>

          <v-col cols="12" v-else>
            <v-text-field
              v-model="imageUrl"
              :label="t('website.imageUrl')"
              :rules="rules.imageUrl"
              class="required"
              placeholder="https://example.com/logo.png"
              type="url"
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
        @click="deleteWebsite"
        v-if="website?.id"
      >
        {{ t('common.delete') }}
      </v-btn>
      <v-spacer />
      <v-btn :disabled="isSaving" variant="text" @click="props.close()"> {{ t('common.cancel') }} </v-btn>
      <v-btn
        :disabled="!isFormValid || isSaving"
        :loading="isSaving"
        color="primary"
        variant="flat"
        @click="handleSave"
      >
        {{ t('common.save') }}
      </v-btn>
    </template>
  </base-dialog>
</template>
