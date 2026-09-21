export const UNLOCK = { timer: 6, neighborhood: 8, street: 9, stadium: 11 };
export const TIMER_SECONDS = 10;
export const TUTORIALS = [
  {
    id: "timer",
    level: UNLOCK.timer,
    badge: "10s",
    title: "Give one light a timer.",
    description: "Three crossings. One less thing to juggle.",
    steps: [
      ["Tap Timer", "Choose a light on the map to open its timer controls."],
      [
        "Set it to auto",
        "That crossing alternates directions every 10 seconds, with a safe amber changeover.",
      ],
      [
        "Choose just one",
        "Setting another timer moves your single timer there. A direct light tap returns it to manual.",
      ],
    ],
    action: "Try the timer",
    map: "3 × 1",
  },
  {
    id: "roundabout",
    level: UNLOCK.neighborhood,
    badge: "↻",
    title: "Make room for a roundabout.",
    description:
      "Your neighborhood grows to six units. Pick one crossing to run itself.",
    steps: [
      [
        "Tap Roundabout",
        "The circular-arrow tool marks the four-way crossings you can convert.",
      ],
      [
        "Choose a clear crossing",
        "Tap a marker after cars and wrecks leave its center. You can place it while paused.",
      ],
      [
        "Let traffic flow",
        "Cars yield as they enter. You get one roundabout per run, so choose carefully.",
      ],
    ],
    action: "Open the neighborhood",
    map: "3 × 2",
  },
  {
    id: "street",
    level: UNLOCK.street,
    badge: "⇄",
    title: "One tap. A whole street.",
    description: "Keep a strip of crossings moving together.",
    steps: [
      [
        "Tap Link street",
        "Choose one east–west avenue or north–south street from the list.",
      ],
      [
        "Follow the blue line",
        "Tap any light at a linked crossing. All crossings on that street change direction together.",
      ],
      [
        "Stay in control",
        "The change waits for amber and cars already crossing. Roundabouts keep flowing; a street tap takes over any timer on that street.",
      ],
    ],
    action: "Link a street",
    map: "3 × 2",
  },
  {
    id: "stadium",
    level: UNLOCK.stadium,
    badge: "⚑",
    title: "It’s game day.",
    description:
      "The final row brings a tiny ballpark, parking and a freeway ramp.",
    steps: [
      [
        "Watch the arrival rush",
        "Cars come off the ramp and head for stadium parking. Keep a route open.",
      ],
      [
        "Plan for the final whistle",
        "The lot empties after the game. Your timer, linked street and roundabout still work.",
      ],
      [
        "Keep the river moving",
        "The river runs through all nine units. New fixed bridges clear boats; tap the original lift bridge as usual.",
      ],
    ],
    action: "Let’s play ball",
    map: "3 × 3",
  },
];
