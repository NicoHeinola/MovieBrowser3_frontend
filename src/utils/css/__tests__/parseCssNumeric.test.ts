import { describe, it, expect } from 'vitest';
import { parseCssNumeric } from '../parseCssNumeric';

describe('parseCssNumeric', () => {
  it('should return number when provided number', () => {
    expect(parseCssNumeric(123)).toBe(123);
  });

  it('should parse pixel strings', () => {
    expect(parseCssNumeric('300px')).toBe(300);
  });

  it('should parse other unit strings', () => {
    expect(parseCssNumeric('20rem')).toBe(20);
    expect(parseCssNumeric('50%')).toBe(50);
    expect(parseCssNumeric('50vh')).toBe(50);
  });

  it('should return fallback if input is null or undefined', () => {
    expect(parseCssNumeric(null, 100)).toBe(100);
    expect(parseCssNumeric(undefined, 200)).toBe(200);
  });

  it('should return fallback for invalid strings', () => {
    expect(parseCssNumeric('not-a-number', 150)).toBe(150);
    expect(parseCssNumeric('', 50)).toBe(50);
  });

  it('should default fallback to 0', () => {
    expect(parseCssNumeric('abc')).toBe(0);
  });
});
