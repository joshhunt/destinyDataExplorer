import { tokenize } from '../search';

test('no input makes no output', () => {
  const input = '';
  const expected = [];
  expect(tokenize(input)).toEqual(expected);
});

test('can parse a single query', () => {
  const input = 'is:cool';
  const expected = ['is:cool'];
  expect(tokenize(input)).toEqual(expected);
});

test('can parse two queries', () => {
  const input = 'is:cool is:dog';
  const expected = ['is:cool', 'is:dog'];
  expect(tokenize(input)).toEqual(expected);
});

test('can parse simple plain text', () => {
  const input = 'hello world';
  const expected = ['hello world'];
  expect(tokenize(input)).toEqual(expected);
});

test('can parse simple plain text + query', () => {
  const input = 'cool is:dog';
  const expected = ['cool', 'is:dog'];
  expect(tokenize(input)).toEqual(expected);
});

test('can parse simple plain query + text', () => {
  const input = 'is:dog cool ';
  const expected = ['is:dog', 'cool'];
  expect(tokenize(input)).toEqual(expected);
});

test('can parse simple plain text + query + plain text', () => {
  const input = 'cool is:dog foo';
  const expected = ['cool', 'is:dog', 'foo'];
  expect(tokenize(input)).toEqual(expected);
});

test('can parse complex string', () => {
  const input = 'is:dog is:cat wow';
  const expected = ['is:dog', 'is:cat', 'wow'];
  expect(tokenize(input)).toEqual(expected);
});
test('can parse more complex string', () => {
  const input = 'cool world is:dog is:cat wow';
  const expected = ['cool world', 'is:dog', 'is:cat', 'wow'];
  expect(tokenize(input)).toEqual(expected);
});

test('can parse most complex string', () => {
  const input = 'cool world is:dog is:cat something else is:another wow';
  const expected = [
    'cool world',
    'is:dog',
    'is:cat',
    'something else',
    'is:another',
    'wow'
  ];
  expect(tokenize(input)).toEqual(expected);
});
