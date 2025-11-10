import {
  CRUD,
  D1,
  ForeignKey,
  Integer,
  ManyToMany,
  OneToMany,
  PrimaryKey,
  OneToOne,
  POST,
  Orm,
  HttpResult,
  Inject,
} from "cloesce/backend";
import { Env } from "./app.cloesce";

@D1
@CRUD(["SAVE"])
export class UCore {
  @PrimaryKey
  id: Integer;
  name: string;

  @ManyToMany("CoursesUcores")
  courses: Course[];
}

@D1
@CRUD(["SAVE"])
export class Course {
  @PrimaryKey
  id: Integer;
  name: string;
  credits: Integer;
  level: Integer;

  @ManyToMany("CoursesDepartments")
  departments: Department[];

  @ManyToMany("CoursesUcores")
  ucores: UCore[];
}

@D1
@CRUD(["SAVE"])
export class Department {
  @PrimaryKey
  id: Integer;
  name: string;

  @ManyToMany("CoursesDepartments")
  courses: Course[];
}

@D1
@CRUD(["SAVE"])
export class Professor {
  @PrimaryKey
  id: Integer;

  @ForeignKey(Department)
  departmentId: Integer;

  @OneToOne("departmentId")
  department: Department;

  @OneToMany("professorId")
  ratings: Rating[];

  /**
   * The cumulative rating gathered from all [ProfessorCourseRating] entries
   */
  cumulative_rating: number;
  name: string;
}

/**
 * Rates a course taught by a professor.
 */
@D1
export class ProfessorCourseRating {
  @PrimaryKey
  id: Integer;

  @ForeignKey(Professor)
  professorId: Integer;

  @ForeignKey(Course)
  courseId: Integer;

  rating: number;
  count: Integer;
}

/**
 * Raw rating submitted by a user on RateMyProfessors.
 * Associated with a professor and a course.
 */
@D1
export class Rating {
  @PrimaryKey
  id: Integer;

  @ForeignKey(Professor)
  professorId: Integer;

  @ForeignKey(Course)
  courseId: Integer;

  rmp_quality: number;
  rmp_difficulty: number;
  rmp_comment: string;

  @POST
  static async rate(
    @Inject env: Env,
    rating: Rating
  ): Promise<HttpResult<void>> {
    const orm = Orm.fromD1(env.db);

    // store the raw RMP rating
    await orm.upsert(Rating, { ...rating, id: undefined });

    const score =
      rating.rmp_quality * 0.5 + (5 - rating.rmp_difficulty) * 0.3 + 5 * 0.2;

    await env.db.batch([
      // Try to update existing row
      env.db
        .prepare(
          `
      UPDATE ProfessorCourseRating
      SET
        rating = (rating * count + ?3) / (count + 1),
        count  = count + 1
      WHERE professorId = ?1 AND courseId = ?2;
    `
        )
        .bind(rating.professorId, rating.courseId, score),

      // Insert new row if not exists
      // (TODO: Could simplify if Cloesce allowed composite keys)
      env.db
        .prepare(
          `
      INSERT INTO ProfessorCourseRating (professorId, courseId, rating, count)
      SELECT ?1, ?2, ?3, 1
      WHERE NOT EXISTS (
        SELECT 1
        FROM ProfessorCourseRating
        WHERE professorId = ?1 AND courseId = ?2
      );
    `
        )
        .bind(rating.professorId, rating.courseId, score),

      // Recompute professor's cumulative rating (weighted by counts)
      env.db
        .prepare(
          `
      UPDATE Professor
      SET cumulative_rating = (
        SELECT SUM(rating * count) / SUM(count)
        FROM ProfessorCourseRating
        WHERE ProfessorCourseRating.professorId = Professor.id
      )
      WHERE id = ?;
    `
        )
        .bind(rating.professorId),
    ]);

    return { ok: true, status: 200 };
  }
}
