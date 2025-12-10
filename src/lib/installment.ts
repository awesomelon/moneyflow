/**
 * 카드 할부 수수료 계산 로직
 * PRD 기반 구현
 */

// 구간별 연 이율(수수료율)
const INTEREST_RATES: Record<string, number> = {
  '1-3': 0, // 무이자
  '4-5': 0.12, // 연 12%
  '6-9': 0.15, // 연 15%
  '10-12': 0.19, // 연 19%
};

/**
 * 할부 개월 수에 따른 연 이율 반환
 */
export function getInterestRate(months: number): number {
  if (months >= 1 && months <= 3) return INTEREST_RATES['1-3'];
  if (months >= 4 && months <= 5) return INTEREST_RATES['4-5'];
  if (months >= 6 && months <= 9) return INTEREST_RATES['6-9'];
  if (months >= 10 && months <= 12) return INTEREST_RATES['10-12'];
  return 0;
}

/**
 * 할부 수수료 계산
 *
 * 공식: 할부원금 * (수수료율/12) * (할부개월수+1) / 2
 *
 * @param principal - 할부 원금
 * @param months - 할부 개월 수 (1 = 일시불)
 * @returns 총 할부 수수료 (1원 미만 절사)
 *
 * @example
 * // 100만원 6개월 할부 (연 15%)
 * calculateInstallmentFee(1000000, 6)
 * // => 43750 (= 1,000,000 * (0.15/12) * (6+1) / 2)
 */
export function calculateInstallmentFee(
  principal: number,
  months: number
): number {
  // 일시불이거나 무이자 기간이면 수수료 없음
  if (months <= 1) return 0;

  const annualRate = getInterestRate(months);

  // 무이자 (1~3개월)
  if (annualRate === 0) return 0;

  // 월 이율
  const monthlyRate = annualRate / 12;

  // 수수료 계산: 원금 * 월이율 * (개월수+1) / 2
  const fee = principal * monthlyRate * ((months + 1) / 2);

  // 1원 미만 절사
  return Math.floor(fee);
}

/**
 * 할부 정보를 포함한 총 지출 금액 계산
 */
export function calculateTotalAmount(
  principal: number,
  months: number
): {
  principal: number;
  fee: number;
  total: number;
  monthlyPayment: number;
} {
  const fee = calculateInstallmentFee(principal, months);
  const total = principal + fee;
  const monthlyPayment = Math.floor(total / months);

  return {
    principal,
    fee,
    total,
    monthlyPayment,
  };
}

/**
 * 할부 수수료 미리보기 정보 생성
 */
export function getInstallmentPreview(
  principal: number,
  months: number
): string {
  if (months <= 1) return '일시불';
  if (months <= 3) return `${months}개월 무이자`;

  const { fee, monthlyPayment } = calculateTotalAmount(principal, months);
  const rate = getInterestRate(months);
  const ratePercent = (rate * 100).toFixed(0);

  return `${months}개월 (연 ${ratePercent}%) - 월 ₩${monthlyPayment.toLocaleString()}, 수수료 ₩${fee.toLocaleString()}`;
}
