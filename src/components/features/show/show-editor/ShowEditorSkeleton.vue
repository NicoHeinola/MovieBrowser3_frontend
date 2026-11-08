<template>
  <!-- Mirrors the editor's layout (hero, table of contents, sections), so nothing jumps when the show arrives. -->
  <div class="d-flex flex-column ga-6">
    <v-card border="sm" class="d-flex align-end" min-height="300" rounded="xl">
      <div class="w-100 d-flex align-end ga-6 pa-6 pa-md-8">
        <v-skeleton-loader
          class="show-editor-skeleton__poster flex-shrink-0 rounded-lg"
          height="225"
          type="image"
          width="150"
        />
        <v-skeleton-loader class="flex-1-1 bg-transparent" max-width="480" type="subtitle, heading, chip@3, text" />
      </div>
    </v-card>

    <v-row>
      <v-col class="d-none d-md-block" cols="12" lg="2" md="3">
        <v-skeleton-loader class="bg-transparent" type="subtitle, list-item@4" />
      </v-col>

      <v-col cols="12" lg="10" md="9">
        <v-row gap="48">
          <v-col v-for="section in 2" cols="12" xl="6" :key="section">
            <v-skeleton-loader class="bg-transparent mb-4" max-width="360" type="heading, text" />
            <v-card border="sm" rounded="xl">
              <v-skeleton-loader class="bg-transparent pa-2" type="text" />
              <v-skeleton-loader class="bg-transparent pa-2" type="paragraph" />
              <v-skeleton-loader class="bg-transparent pa-2" type="text" />
            </v-card>
          </v-col>
          <v-col v-for="section in 2" cols="12" :key="'section-' + section">
            <v-skeleton-loader class="bg-transparent mb-4" max-width="360" type="heading, text" />
            <v-card border="sm" rounded="xl">
              <v-skeleton-loader class="bg-transparent pa-2" type="list-item-two-line@3" />
            </v-card>
          </v-col>
        </v-row>
      </v-col>
    </v-row>
  </div>
</template>
