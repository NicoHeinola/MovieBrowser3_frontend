<script setup lang="ts">
import { PageBackground } from '@/components/common/page-background';
import { PageContainer } from '@/components/common/page-container';
</script>

<template>
  <page-background />
  <page-container>
    <v-row class="mb-6">
      <v-col cols="12">
        <v-card border="sm" rounded="xl">
          <v-card-text class="pa-8 pa-md-10 d-flex flex-column ga-4">
            <div>
              <p class="text-overline text-medium-emphasis">Show Management</p>
              <h1 class="text-h3">Control Panel Shows</h1>
            </div>

            <p class="text-body-1 text-medium-emphasis">
              The admin show workspace is now wired for show entries, episodes, and show-link data access.
            </p>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12" md="4">
        <v-card border="sm" height="100%" rounded="xl">
          <v-card-title>Show Entries</v-card-title>
          <v-card-text class="text-medium-emphasis">
            Typed API support is in place for listing, reading, creating, updating, and deleting entries under a show.
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="4">
        <v-card border="sm" height="100%" rounded="xl">
          <v-card-title>Episodes</v-card-title>
          <v-card-text class="text-medium-emphasis">
            Nested episode endpoints are ready for a future admin UI once per-show management flows are introduced.
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="4">
        <v-card border="sm" height="100%" rounded="xl">
          <v-card-title>Show Links</v-card-title>
          <v-card-text class="text-medium-emphasis">
            Related-show link operations are available in the show service, and the show model can now expose link
            relationships.
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </page-container>
</template>
