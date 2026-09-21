import {
  JUNCTION_X,
  JUNCTION_Z,
  JUNCTION_NAMES,
  JUNCTION_LEVEL,
} from "./cityChallenges";

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

export const SIGNALS = JUNCTION_X.flatMap((x, junction) =>
  BASE_SIGNALS.map((s) => ({
    ...s,
    junction,
    level: JUNCTION_LEVEL[junction],
    x: s.x + x,
    z: s.z + JUNCTION_Z[junction],
    postZ: s.postZ + JUNCTION_Z[junction],
    postX: s.postX + x,
    label:
      junction >= 3
        ? `${JUNCTION_NAMES[junction]} ${s.axis === "water" ? "street" : "avenue"} ${s.label.split(" ").at(-1)}`
        : junction === 0
          ? s.label
          : s.label
              .replace(
                "Water Street",
                junction === 1 ? "Broadway" : "Plankinton Avenue",
              )
              .replace(
                "Wisconsin Avenue",
                `Wisconsin Avenue at ${junction === 1 ? "Broadway" : "Plankinton"}`,
              ),
  })),
);
