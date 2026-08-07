// test.js

const name = "JavaScript";

function greet(name) {
  return `Hello, ${name}!`;
}

const numbers = [1, 2, 3, 4, 5];
const total = numbers.reduce((sum, number) => sum + number, 0);

console.log(greet(name));
console.log("Numbers:", numbers);
console.log("Total:", total);
console.log("Test JS chạy thành công!");
