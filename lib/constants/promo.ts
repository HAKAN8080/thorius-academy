export const SIGNUP_DISCOUNT_PERCENT = 20;

export function getSignupCouponCode(): string {
  return process.env.SIGNUP_COUPON_CODE ?? "UYE20";
}
