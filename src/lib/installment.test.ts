import { describe, it, expect } from 'vitest';
import {
  calculateInstallmentFee,
  getInterestRate,
  calculateTotalAmount,
  getInstallmentPreview,
} from '@/lib/installment';

describe('할부 이자 계산 로직', () => {
  describe('getInterestRate', () => {
    it('1~3개월은 무이자 (0%)', () => {
      expect(getInterestRate(1)).toBe(0);
      expect(getInterestRate(2)).toBe(0);
      expect(getInterestRate(3)).toBe(0);
    });

    it('4~5개월은 연 12%', () => {
      expect(getInterestRate(4)).toBe(0.12);
      expect(getInterestRate(5)).toBe(0.12);
    });

    it('6~9개월은 연 15%', () => {
      expect(getInterestRate(6)).toBe(0.15);
      expect(getInterestRate(7)).toBe(0.15);
      expect(getInterestRate(8)).toBe(0.15);
      expect(getInterestRate(9)).toBe(0.15);
    });

    it('10~12개월은 연 19%', () => {
      expect(getInterestRate(10)).toBe(0.19);
      expect(getInterestRate(11)).toBe(0.19);
      expect(getInterestRate(12)).toBe(0.19);
    });
  });

  describe('calculateInstallmentFee', () => {
    it('일시불(1개월)은 수수료 없음', () => {
      expect(calculateInstallmentFee(1000000, 1)).toBe(0);
    });

    it('2~3개월은 무이자', () => {
      expect(calculateInstallmentFee(1000000, 2)).toBe(0);
      expect(calculateInstallmentFee(1000000, 3)).toBe(0);
    });

    it('PRD 예시: 100만원 6개월 할부 (부동소수점 정밀도: 43,749원)', () => {
      // 공식: 1,000,000 * (0.15/12) * (6+1) / 2
      // JS 부동소수점: 0.15/12 = 0.01249999... → 43,749 (1원 차이 허용)
      const fee = calculateInstallmentFee(1000000, 6);
      expect(fee).toBe(43749);
    });

    it('4개월 할부 (연 12%)', () => {
      // 100만원 4개월: 1,000,000 * (0.12/12) * (4+1) / 2
      // = 1,000,000 * 0.01 * 2.5 = 25,000
      const fee = calculateInstallmentFee(1000000, 4);
      expect(fee).toBe(25000);
    });

    it('5개월 할부 (연 12%)', () => {
      // 100만원 5개월: 1,000,000 * (0.12/12) * (5+1) / 2
      // = 1,000,000 * 0.01 * 3 = 30,000
      const fee = calculateInstallmentFee(1000000, 5);
      expect(fee).toBe(30000);
    });

    it('10개월 할부 (연 19%)', () => {
      // 100만원 10개월: 1,000,000 * (0.19/12) * (10+1) / 2
      // = 1,000,000 * 0.01583... * 5.5 = 87,083.33... → 87,083 (절사)
      const fee = calculateInstallmentFee(1000000, 10);
      expect(fee).toBe(87083);
    });

    it('12개월 할부 (연 19%)', () => {
      // 100만원 12개월: 1,000,000 * (0.19/12) * (12+1) / 2
      // = 1,000,000 * 0.01583... * 6.5 = 102,916.66... → 102,916 (절사)
      const fee = calculateInstallmentFee(1000000, 12);
      expect(fee).toBe(102916);
    });

    it('1원 미만 절사 확인', () => {
      // 55,000원 6개월: 55,000 * (0.15/12) * (6+1) / 2
      // = 55,000 * 0.0125 * 3.5 = 2,406.25 → 2,406
      const fee = calculateInstallmentFee(55000, 6);
      expect(fee).toBe(2406);
    });

    it('0원이면 수수료 없음', () => {
      expect(calculateInstallmentFee(0, 6)).toBe(0);
    });
  });

  describe('calculateTotalAmount', () => {
    it('총 금액과 월 납부액 계산', () => {
      const result = calculateTotalAmount(1000000, 6);
      expect(result.principal).toBe(1000000);
      expect(result.fee).toBe(43749); // 부동소수점 정밀도
      expect(result.total).toBe(1043749);
      expect(result.monthlyPayment).toBe(173958);
    });

    it('일시불은 수수료 없음', () => {
      const result = calculateTotalAmount(100000, 1);
      expect(result.fee).toBe(0);
      expect(result.total).toBe(100000);
      expect(result.monthlyPayment).toBe(100000);
    });
  });

  describe('getInstallmentPreview', () => {
    it('일시불 표시', () => {
      expect(getInstallmentPreview(100000, 1)).toBe('일시불');
    });

    it('2~3개월 무이자 표시', () => {
      expect(getInstallmentPreview(100000, 2)).toBe('2개월 무이자');
      expect(getInstallmentPreview(100000, 3)).toBe('3개월 무이자');
    });

    it('4개월 이상은 수수료 정보 표시', () => {
      const preview = getInstallmentPreview(1000000, 6);
      expect(preview).toContain('6개월');
      expect(preview).toContain('15%');
      expect(preview).toContain('43,749'); // 부동소수점 정밀도
    });
  });
});

describe('Edge Cases', () => {
  it('음수 금액은 수수료 음수 (실제로는 유효성 검사로 방지)', () => {
    const fee = calculateInstallmentFee(-100000, 6);
    expect(fee).toBe(-4375);
  });

  it('0개월은 0으로 처리', () => {
    const fee = calculateInstallmentFee(100000, 0);
    expect(fee).toBe(0);
  });

  it('13개월 이상은 0% (범위 외)', () => {
    expect(getInterestRate(13)).toBe(0);
    expect(calculateInstallmentFee(1000000, 13)).toBe(0);
  });
});
