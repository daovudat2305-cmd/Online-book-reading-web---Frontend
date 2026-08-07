// test2.js

class Student {
  constructor(id, name, score) {
    this.id = id;
    this.name = name;
    this.score = score;
  }

  isPassed() {
    return this.score >= 5;
  }
}

const students = [
  new Student(1, "An", 8.5),
  new Student(2, "Bình", 4.5),
  new Student(3, "Chi", 9.0),
];

console.log("=== Danh sách sinh viên ===");

students.forEach((student) => {
  console.log(
    `${student.id}. ${student.name} - Điểm: ${student.score} - ${
      student.isPassed() ? "Đạt" : "Trượt"
    }`,
  );
});

const average =
  students.reduce((sum, student) => sum + student.score, 0) / students.length;

console.log("\nĐiểm trung bình:", average.toFixed(2));

const passedStudents = students.filter((student) => student.isPassed());

console.log("\nSinh viên đạt:");
console.table(
  passedStudents.map((student) => ({
    ID: student.id,
    Name: student.name,
    Score: student.score,
  })),
);

console.log("\nTest 2 chạy thành công!");
