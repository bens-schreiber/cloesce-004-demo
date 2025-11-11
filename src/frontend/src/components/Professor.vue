<template>
  <v-container fluid>
    <v-btn
      prepend-icon="mdi-arrow-left"
      variant="text"
      class="mb-4"
      @click="$router.back()"
    >
      Back
    </v-btn>

    <!-- Professor Details -->
    <v-card class="pa-6 mb-6" elevation="3" v-if="professor">
      <v-row>
        <v-col cols="12" sm="8">
          <h1 class="text-h5 font-weight-bold">{{ professor.name }}</h1>
          <p class="text-subtitle-1">
            Department:
            <strong>{{ professor.department?.name || "Unknown" }}</strong>
          </p>
          <p>ID: {{ professor.id }}</p>
        </v-col>
        <v-col cols="12" sm="4" class="text-end">
          <v-chip
            v-if="professor.cumulative_rating"
            color="primary"
            text-color="white"
            label
          >
            ⭐ {{ professor.cumulative_rating.toFixed(2) }}
          </v-chip>
        </v-col>
      </v-row>


      <!-- Add rating -->
      <v-divider class="my-4" />
      <h2 class="text-h6 font-weight-bold mb-3">Add Your Rating</h2>

      <v-form @submit.prevent="saveRating">
        <v-row>
          <v-col cols="12" sm="6">
            <v-label>Quality</v-label>
            <v-rating v-model="newRating.quality" color="yellow darken-3" />
          </v-col>
          <v-col cols="12" sm="6">
            <v-label>Difficulty</v-label>
            <v-rating v-model="newRating.difficulty" color="blue darken-3" />
          </v-col>
        </v-row>

        <v-select
          v-model="newRating.courseId"
          :items="courseOptions"
          item-title="label"
          item-value="value"
          label="Select Course"
          outlined
          class="mt-2"
          required
        />

        <v-textarea
          v-model="newRating.comment"
          label="Comment"
          rows="3"
          auto-grow
          outlined
          class="mt-2"
        />

        <v-btn
          color="primary"
          class="mt-3"
          :loading="saving"
          type="submit"
          block
        >
          Submit Rating
        </v-btn>
      </v-form>
    </v-card>

    <!-- Ratings -->
    <v-card class="pa-4" elevation="2">
      <template v-if="loading">
        <v-row justify="center" class="my-6">
          <v-progress-circular indeterminate color="primary" size="64" />
        </v-row>
      </template>

      <template v-else-if="ratings.length">
        <h2 class="text-h6 font-weight-bold mb-4">
          All Comments ({{ ratings.length }})
        </h2>
        <v-divider class="mb-4" />
        <v-list>
          <v-list-item v-for="r in ratings" :key="r.id" class="border-b py-3">
            <v-list-item-title>
              <strong>Quality:</strong> {{ r.rmp_quality }} |
              <strong>Difficulty:</strong> {{ r.rmp_difficulty }}
            </v-list-item-title>
            <v-list-item-subtitle class="mt-1">
              "{{ r.rmp_comment }}"
            </v-list-item-subtitle>
          </v-list-item>
        </v-list>
      </template>

      <v-alert v-else type="info" text border="start" color="blue" class="mt-4">
        No comments found for this professor.
      </v-alert>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { useRoute } from "vue-router";
import { Professor, Rating } from "../../../../.generated/client";

const route = useRoute();
const professor = ref<Professor | null>(null);
const ratings = ref<Rating[]>([]);
const loading = ref(true);
const saving = ref(false);

const newRating = ref({
  quality: 0,
  difficulty: 0,
  comment: "",
  courseId: null as number | null,
});

const courseOptions = computed(() => {
  if (!professor.value?.courseRatings?.length) return [];
  return professor.value.courseRatings.map((cr) => ({
    label: `${cr.course?.name} (${cr.count} ratings))`,
    value: cr.courseId,
  }));
});

async function loadProfessor() {
  const id = Number(route.params.id);
  if (!id) {
    loading.value = false;
    return;
  }

  const profRes = await Professor.get(id, "withRatings");
  if (!profRes.ok) {
    loading.value = false;
    console.error("Failed to load professor: ", profRes.message);
    return;
  }

  professor.value = profRes.data ?? null;
  ratings.value = professor.value?.ratings ?? [];
  loading.value = false;
}

async function saveRating() {
  if (!professor.value || !newRating.value.courseId) return;
  saving.value = true;

  try {
    const rating: Rating = {
      id: 0,
      professorId: professor.value.id,
      courseId: newRating.value.courseId,
      rmp_quality: newRating.value.quality,
      rmp_difficulty: newRating.value.difficulty,
      rmp_comment: newRating.value.comment,
    };

    const res = await Rating.rate(rating);
    if (res.ok) {
      await loadProfessor();
      newRating.value = { quality: 0, difficulty: 0, comment: "", courseId: null };
    } else {
      console.error("Failed to submit rating:", res.message);
    }
  } catch (err) {
    console.error("Error submitting rating:", err);
  } finally {
    saving.value = false;
  }
}

onMounted(loadProfessor);
</script>
