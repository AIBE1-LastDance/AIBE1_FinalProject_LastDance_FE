/**
 * 숫자 안전성을 위한 유틸리티 함수들
 * NaN 오류를 방지하고 안전한 숫자/문자열 변환을 제공
 */

export const safeNumber = (value: any, defaultValue: number = 0): number => {
  if (value === null || value === undefined || isNaN(Number(value))) {
    return defaultValue;
  }
  return Number(value);
};

export const safeString = (value: any, defaultValue: string = '0'): string => {
  if (value === null || value === undefined || isNaN(Number(value))) {
    return defaultValue;
  }
  return String(value);
};

export const formatNumber = (value: any, defaultValue: string = '0'): string => {
  const num = safeNumber(value);
  return num.toLocaleString();
};

export const formatPercentage = (value: any, decimals: number = 1, defaultValue: string = '0.0'): string => {
  const num = safeNumber(value);
  return `${num.toFixed(decimals)}%`;
};

export const safeDivision = (numerator: any, denominator: any, defaultValue: number = 0): number => {
  const num = safeNumber(numerator);
  const den = safeNumber(denominator);
  
  if (den === 0) {
    return defaultValue;
  }
  
  const result = num / den;
  return isNaN(result) ? defaultValue : result;
};

export const safeArray = <T>(value: T[] | null | undefined): T[] => {
  return Array.isArray(value) ? value : [];
};
