import { Greeter } from '../main/index';
test('My Greeter', () => {
  expect(Greeter('Carl')).toBe('Hello Carl');
});