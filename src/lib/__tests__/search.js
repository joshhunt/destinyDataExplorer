import { tokenize } from "../search";

const fn = (fnName, value) => ({ type: "fn", name: fnName, value });
const phrase = (value) => ({ type: "phrase", value });

test("no input makes no output", () => {
  const input = "";
  const expected = [];
  expect(tokenize(input)).toEqual(expected);
});

test("can parse a single query", () => {
  const input = "is:cool";
  const expected = [fn("is", "cool")];
  expect(tokenize(input)).toEqual(expected);
});

test("can parse two queries", () => {
  const input = "is:cool is:dog";
  const expected = [fn("is", "cool"), fn("is", "dog")];
  expect(tokenize(input)).toEqual(expected);
});

test("can parse simple plain text", () => {
  const input = "hello world";
  const expected = [phrase("hello world")];
  expect(tokenize(input)).toEqual(expected);
});

test("can parse simple plain text + query", () => {
  const input = "cool is:dog";
  const expected = [phrase("cool"), fn("is", "dog")];
  expect(tokenize(input)).toEqual(expected);
});

test("can parse simple plain query + text", () => {
  const input = "is:dog cool";
  const expected = [fn("is", "dog"), phrase("cool")];
  expect(tokenize(input)).toEqual(expected);
});

test("can parse simple plain text + query + plain text", () => {
  const input = "cool is:dog foo";
  const expected = [phrase("cool"), fn("is", "dog"), phrase("foo")];
  expect(tokenize(input)).toEqual(expected);
});

test("can parse complex string", () => {
  const input = "is:dog is:cat wow";
  const expected = [fn("is", "dog"), fn("is", "cat"), phrase("wow")];
  expect(tokenize(input)).toEqual(expected);
});

test("can parse more complex string", () => {
  const input = "cool world is:dog is:cat wow";
  const expected = [
    phrase("cool world"),
    fn("is", "dog"),
    fn("is", "cat"),
    phrase("wow"),
  ];
  expect(tokenize(input)).toEqual(expected);
});

test("can parse most complex string", () => {
  const input = "cool world is:dog is:cat something else is:another wow";
  const expected = [
    phrase("cool world"),
    fn("is", "dog"),
    fn("is", "cat"),
    phrase("something else"),
    fn("is", "another"),
    phrase("wow"),
  ];
  expect(tokenize(input)).toEqual(expected);
});

test("supports quoted fn arguments", () => {
  const input = `hello world name:"josh hunt"`;
  const expected = [phrase("hello world"), fn("name", "josh hunt")];

  expect(tokenize(input)).toEqual(expected);
});

test("supports quoted fn arguments again", () => {
  const input = `name:"josh hunt" hello world name:"josh hunt"`;
  const expected = [
    fn("name", "josh hunt"),
    phrase("hello world"),
    fn("name", "josh hunt"),
  ];

  expect(tokenize(input)).toEqual(expected);
});

test("supports quoted phrases", () => {
  const input = `"hello world"`;
  const expected = [phrase("hello world")];

  expect(tokenize(input)).toEqual(expected);
});

test("supports multiple quoted phrases", () => {
  const input = `"hello world" "josh hunt"`;
  const expected = [phrase("hello world"), phrase("josh hunt")];

  expect(tokenize(input)).toEqual(expected);
});

// test("supports quoted phrases", () => {
//   const input = `hello world name:"josh hunt"`;
//   const expected = [phrase("hello world"), fn("name", "josh hunt")];

//   expect(tokenize(input)).toEqual(expected);
// });
