import { describe, it, expect } from 'vitest';
import { numberToWordsINR } from './numberToWords';

describe('numberToWordsINR', () => {
  it('converts zero correctly', () => {
    expect(numberToWordsINR(0)).toBe('Zero Rupees Only');
  });

  it('converts units and tens correctly', () => {
    expect(numberToWordsINR(5)).toBe('Five Rupees Only');
    expect(numberToWordsINR(18)).toBe('Eighteen Rupees Only');
    expect(numberToWordsINR(45)).toBe('Forty Five Rupees Only');
  });

  it('converts hundreds, thousands, and lakhs', () => {
    expect(numberToWordsINR(944)).toBe('Nine Hundred Forty Four Rupees Only');
    expect(numberToWordsINR(15000)).toBe('Fifteen Thousand Rupees Only');
    expect(numberToWordsINR(125000)).toBe('One Lakh Twenty Five Thousand Rupees Only');
    expect(numberToWordsINR(10500000)).toBe('One Crore Five Lakh Rupees Only');
  });

  it('handles paise fractions', () => {
    expect(numberToWordsINR(100.50)).toBe('One Hundred Rupees and Fifty Paise Only');
    expect(numberToWordsINR(0.75)).toBe('Seventy Five Paise Only');
  });
});
