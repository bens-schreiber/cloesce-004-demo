import Database from "better-sqlite3";
import {
  Course,
  Department,
  Professor,
  Rating,
  UCore,
} from "../../.generated/client";

// Script to use an existing db of WSU RateMyProfessor data and seed into Cloesce
// via the generated Workers API.
//
// The schema of the RMP db follows originates from this old project:
// https://github.com/bens-schreiber/course-advisor/blob/main/backend/scrape/ratemy.py
const db = new Database("./dist/scrape.db", { readonly: true });

async function safeSave(
  label: string,
  saveFn: (data: any) => Promise<any>,
  data: any
) {
  try {
    const res: any = await saveFn(data);
    if (!res || res.ok === false) {
      console.error(`❌ Failed to save ${label}:`, data, "\nResponse:", res);
    }
  } catch (err) {
    console.error(`❌ Exception while saving ${label}:`, data, "\nError:", err);
  }
}

async function seedDepartments() {
  const departments: any[] = db
    .prepare("SELECT id, name FROM departments")
    .all();
  for (const d of departments) {
    await safeSave("department", Department.save, {
      id: d.id,
      name: d.name,
      courses: [],
    });
  }
  console.log(`✅ Seeded ${departments.length} departments`);
}

async function seedUcores() {
  const ucores: any[] = db
    .prepare("SELECT DISTINCT ucore_designation AS name FROM ucore_courses")
    .all();
  for (const u of ucores) {
    await safeSave("ucore", UCore.save, {
      name: u.name,
      courses: [],
    });
  }
  console.log(`✅ Seeded ${ucores.length} ucores`);
}

async function seedCourses() {
  const courses: any[] = db
    .prepare(
      "SELECT id, course_name AS name, course_level AS level, found_from_rmp_id FROM courses"
    )
    .all();
  for (const c of courses) {
    await safeSave("course", Course.save, {
      id: c.id,
      name: c.name,
      credits: 3, // default to 3 credits
      level: c.level,
      departments: [],
      ucores: [],
    });
  }
  console.log(`✅ Seeded ${courses.length} courses`);
}

async function seedProfessors() {
  const professors: any[] = db
    .prepare(
      "SELECT rmp_id AS id, name, department_id AS departmentId FROM professors"
    )
    .all();

  for (const p of professors) {
    await safeSave("professor", Professor.save, {
      id: p.id,
      name: p.name,
      departmentId: p.departmentId,
      cumulative_rating: 0,
      ratings: [],
    });
  }

  console.log(`✅ Seeded ${professors.length} professors`);
}

async function seedRatings() {
  const comments: any[] = db
    .prepare(
      `
    SELECT id, quality, difficulty, comment, rmp_id AS professorId, course_id AS courseId
    FROM comments
  `
    )
    .all();

  for (const r of comments) {
    await safeSave("rating", Rating.save, {
      id: r.id,
      professorId: r.professorId,
      courseId: r.courseId,
      rmp_quality: r.quality,
      rmp_difficulty: r.difficulty,
      rmp_comment: r.comment,
    });
  }

  console.log(`✅ Seeded ${comments.length} ratings`);
}

async function main() {
  try {
    console.log("🌱 Starting seeding...");
    await seedDepartments();
    await seedUcores();
    await seedCourses();
    await seedProfessors();
    await seedRatings();
    console.log("🌱 Done seeding!");
  } catch (err) {
    console.error("❌ Error seeding:", err);
  } finally {
    db.close();
  }
}

main().catch((err) => {
  console.error("❌ Unhandled error during seeding:", err);
  process.exit(1);
});
