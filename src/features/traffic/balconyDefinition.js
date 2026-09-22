export const BALCONY_ORIGIN = [6.5, 2.35, -12.55];
export const BALCONY_SCALE = 0.6;
export const BALCONY_RESIDENT = {
  id: "balconyResident",
  label: "Visit the man on the rear apartment balcony",
  point: [
    BALCONY_ORIGIN[0],
    BALCONY_ORIGIN[1] + 0.78 * BALCONY_SCALE,
    BALCONY_ORIGIN[2] - 0.5 * BALCONY_SCALE,
  ],
  duration: 6,
};
