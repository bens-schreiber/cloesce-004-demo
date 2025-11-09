import {
  CRUD,
  D1,
  DataSource,
  ForeignKey,
  Integer,
  ManyToMany,
  OneToMany,
  PrimaryKey,
  IncludeTree,
  OneToOne,
} from "cloesce/backend";

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

  name: string;
  cumulative_rating: number;
}

@D1
@CRUD(["SAVE"])
export class Rating {
  @PrimaryKey
  id: Integer;

  @ForeignKey(Professor)
  professorId: Integer;

  @OneToOne("professorId")
  professor: Professor;

  @ForeignKey(Course)
  courseId: Integer;

  rmp_quality: number;
  rmp_difficulty: number;
  rmp_comment: string;
}
