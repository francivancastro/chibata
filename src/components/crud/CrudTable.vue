<script setup>
import { useRouter } from "vue-router";

const props = defineProps({
  config: Object,
  items: Array,
  loading: Boolean,
  statusMap: Array,
});

const router = useRouter();

const emit = defineEmits(["open"]);

function goFlow(item) {
  router.push({
    name: "funil-editor",
    params: {
      id: item.id,
    },
  });
}

function getStatus(value) {
  return props.statusMap?.find((i) => Number(i.value) === Number(value));
}
</script>

<template>
  <v-card flat>
    <v-data-table
      :items="items"
      :loading="loading"
      :headers="config.headers"
      disable-sort
      @click:row="(_, row) => emit('open', row.item)"
    >
      <!-- HEADER -->
      <template #top>
        <v-toolbar density="compact">
          <v-toolbar-title>
            {{ config.title }}
          </v-toolbar-title>

          <v-spacer />

          <v-btn color="primary" @click="emit('open', null)"> Novo </v-btn>
        </v-toolbar>
      </template>

      <!-- CELULAS -->
      <template
        v-for="h in config.headers"
        :key="h.key"
        v-slot:[`item.${h.key}`]="{ value, item }"
      >
        <!-- AÇÕES -->
        <template v-if="h.key === 'actions'">
          <v-btn
            v-if="config.actions"
            icon="mdi-sitemap"
            size="small"
            variant="text"
            @click.stop="goFlow(item)"
          />
        </template>

        <!-- STATUS -->
        <v-chip
          v-else-if="h.key === 'status' && getStatus(value)"
          :color="getStatus(value).color"
          size="small"
          variant="outlined"
        >
          {{ getStatus(value).label }}
        </v-chip>

        <!-- FORMATTER -->
        <span v-else-if="h.formatter">
          {{ h.formatter(value) }}
        </span>

        <!-- DEFAULT -->
        <span v-else>
          {{ value }}
        </span>
      </template>
    </v-data-table>
  </v-card>
</template>
