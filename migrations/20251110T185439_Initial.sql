--- New Models
CREATE TABLE IF NOT EXISTS "Course" (
  "id" integer PRIMARY KEY,
  "name" text NOT NULL,
  "credits" integer NOT NULL,
  "level" integer NOT NULL
);

CREATE TABLE IF NOT EXISTS "Department" ("id" integer PRIMARY KEY, "name" text NOT NULL);

CREATE TABLE IF NOT EXISTS "UCore" ("id" integer PRIMARY KEY, "name" text NOT NULL);

CREATE TABLE IF NOT EXISTS "Professor" (
  "id" integer PRIMARY KEY,
  "departmentId" integer NOT NULL,
  "cumulative_rating" real NOT NULL,
  "name" text NOT NULL,
  FOREIGN KEY ("departmentId") REFERENCES "Department" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "ProfessorCourseRating" (
  "id" integer PRIMARY KEY,
  "professorId" integer NOT NULL,
  "courseId" integer NOT NULL,
  "rating" real NOT NULL,
  "count" integer NOT NULL,
  FOREIGN KEY ("professorId") REFERENCES "Professor" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  FOREIGN KEY ("courseId") REFERENCES "Course" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "Rating" (
  "id" integer PRIMARY KEY,
  "professorId" integer NOT NULL,
  "courseId" integer NOT NULL,
  "rmp_quality" real NOT NULL,
  "rmp_difficulty" real NOT NULL,
  "rmp_comment" text NOT NULL,
  FOREIGN KEY ("professorId") REFERENCES "Professor" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  FOREIGN KEY ("courseId") REFERENCES "Course" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "CoursesUcores" (
  "UCore.id" integer NOT NULL,
  "Course.id" integer NOT NULL,
  PRIMARY KEY ("UCore.id", "Course.id"),
  FOREIGN KEY ("UCore.id") REFERENCES "UCore" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  FOREIGN KEY ("Course.id") REFERENCES "Course" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "CoursesDepartments" (
  "Department.id" integer NOT NULL,
  "Course.id" integer NOT NULL,
  PRIMARY KEY ("Department.id", "Course.id"),
  FOREIGN KEY ("Department.id") REFERENCES "Department" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  FOREIGN KEY ("Course.id") REFERENCES "Course" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

--- Cloesce Temporary Table
CREATE TABLE IF NOT EXISTS "_cloesce_tmp" ("path" text PRIMARY KEY, "id" integer NOT NULL);