import { BLOCK_SPACING } from "./cityChallenges";

const BASE_SIGNALS = [
  {
    axis: "water",
    label: "Water Street southbound",
    x: -0.57,
    z: -1.93,
    postX: -1.83,
    postZ: -1.93,
    yaw: Math.PI,
  },
  {
    axis: "wisconsin",
    label: "Wisconsin Avenue westbound",
    x: 1.93,
    z: -0.57,
    postX: 1.93,
    postZ: -1.83,
    yaw: Math.PI / 2,
  },
  {
    axis: "water",
    label: "Water Street northbound",
    x: 0.57,
    z: 1.93,
    postX: 1.83,
    postZ: 1.93,
    yaw: 0,
  },
  {
    axis: "wisconsin",
    label: "Wisconsin Avenue eastbound",
    x: -1.93,
    z: 0.57,
    postX: -1.93,
    postZ: 1.83,
    yaw: -Math.PI / 2,
  },
];

export const SIGNALS = [
  ...BASE_SIGNALS.map((s) => ({ ...s, junction: 0 })),
  ...BASE_SIGNALS.map((s) => ({
    ...s,
    junction: 1,
    x: s.x + BLOCK_SPACING,
    postX: s.postX + BLOCK_SPACING,
    label: s.label
      .replace("Water Street", "Broadway")
      .replace("Wisconsin Avenue", "Wisconsin Avenue at Broadway"),
  })),
];
