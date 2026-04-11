<script setup lang="ts">
import { PageBackground } from '@/components/common/page-background';
</script>

<template>
  <v-container class="fill-height position-relative" fluid>
    <page-background />
    <v-row align="center" class="fill-height position-relative" justify="center">
      <v-col cols="12" lg="6" md="8" xl="5">
        <v-card border="sm" rounded="xl">
          <v-card-text class="pa-8 pa-md-10 d-flex flex-column ga-4">
            <div>
              <p class="text-overline text-medium-emphasis">Placeholder View</p>
              <h1 class="text-h3">Profile</h1>
            </div>

            <p class="text-body-1 text-medium-emphasis">
              This page is set up and routed. Replace this content with your profile layout when you're ready.
            </p>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
