<template>
  <v-container fluid>
    <!-- FILTER BAR -->
    <v-card class="pa-6 mb-8" elevation="3">
      <v-row dense>
        <v-col cols="12" sm="3">
          <v-text-field
            v-model="filters.nameLike"
            label="🔍 Search by Name"
            variant="outlined"
            clearable
          />
        </v-col>
        <v-col cols="12" sm="3">
          <v-autocomplete
            v-model="filters.departmentId"
            :items="departments"
            item-title="name"
            item-value="id"
            label="🏢 Department"
            clearable
            variant="outlined"
            hide-details
          />
        </v-col>

        <v-col cols="12" sm="3">
          <v-autocomplete
            v-model="filters.courseId"
            :items="courses"
            item-title="name"
            item-value="id"
            label="📘 Course"
            clearable
            variant="outlined"
            hide-details
          />
        </v-col>

        <v-col cols="12" sm="3">
          <v-text-field
            v-model.number="filters.limit"
            type="number"
            label="Result Limit"
            min="1"
            max="200"
            variant="outlined"
          />
        </v-col>
      </v-row>
    </v-card>

    <!-- PROFESSOR LIST -->
    <v-row>
      <v-col cols="12" class="text-center" v-if="loading">
        <v-progress-circular indeterminate color="primary" size="64" />
      </v-col>

      <v-col
        v-for="prof in professors"
        :key="prof.id"
        cols="12"
        sm="6"
        md="4"
        lg="3"
      >
        <v-card
          elevation="5"
          class="pa-4 hover:shadow-xl transition-all"
          style="cursor: pointer"
          @click="$router.push({ name: 'Professor', params: { id: prof.id } })"
        >
          <v-card-title
            class="text-h6 font-weight-bold d-flex justify-space-between align-center"
          >
            {{ prof.name }}
            <v-chip
              v-if="prof.cumulative_rating"
              color="primary"
              text-color="white"
              size="small"
              label
            >
              ⭐ {{ prof.cumulative_rating.toFixed(2) }}
            </v-chip>
          </v-card-title>
          <v-card-subtitle>{{
            prof.department?.name || "Unknown Dept."
          }}</v-card-subtitle>
          <v-divider class="my-2" />
          <v-card-text class="text-body-2">
            <div><strong>ID:</strong> {{ prof.id }}</div>
            <div v-if="prof.ratings?.length">
              <div class="text-subtitle-2 mt-3 mb-1">Recent Comments:</div>
              <ul>
                <li v-for="r in prof.ratings.slice(0, 2)" :key="r.id">
                  Q: {{ r.rmp_quality }} | D: {{ r.rmp_difficulty }} — "{{
                    r.rmp_comment
                  }}"
                </li>
              </ul>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col
        v-if="!loading && professors.length === 0"
        cols="12"
        class="text-center"
      >
        <v-alert type="info" variant="tonal" color="blue">
          No professors found.
        </v-alert>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from "vue";
import {
  Professor,
  Department,
  Course,
  TopProfessorFilterOptions,
} from "../../../../.generated/client";

const professors = ref<Professor[]>([]);
const departments = ref<Department[]>([]);
const courses = ref<Course[]>([]);
const loading = ref(false);

const filters = ref<Partial<TopProfessorFilterOptions>>({
  limit: 50,
});

function debounce(fn: (...args: any[]) => void, delay = 400) {
  let timer: number | undefined;
  return (...args: any[]) => {
    clearTimeout(timer);
    timer = window.setTimeout(() => fn(...args), delay);
  };
}

async function fetchProfessors() {
  loading.value = true;

  const result = await Professor.topProfessors(filters.value);
  professors.value = result.data ?? [];

  if (!result.ok) {
    console.error("Error fetching professors:", result.message);
  }

  loading.value = false;
}

async function initFilters() {
  const [deptRes, courseRes] = await Promise.all([
    Department.list(),
    Course.list(),
  ]);
  departments.value = deptRes.data ?? [];
  courses.value = courseRes.data ?? [];

  if (!deptRes.ok) {
    console.error("Error fetching departments:", deptRes.message);
  }

  if (!courseRes.ok) {
    console.error("Error fetching courses:", courseRes.message);
  }
}

const debouncedFetch = debounce(fetchProfessors, 400);
watch(filters, debouncedFetch, { deep: true });

onMounted(async () => {
  await initFilters();
  await fetchProfessors();
});
</script>
