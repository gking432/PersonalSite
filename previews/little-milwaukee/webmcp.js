const actions = {
  start: ".traffic-city__model",
  toggle_water_light: '[data-axis="water"]',
  toggle_wisconsin_light: '[data-axis="wisconsin"]',
  toggle_bridge: '[data-control="bridge"]',
  zoom_in: '[aria-label="Zoom in"]',
  zoom_out: '[aria-label="Zoom out"]',
  reset: '[aria-label="Reset traffic"]',
};

function readCity() {
  const label = (selector) =>
    document.querySelector(selector)?.getAttribute("aria-label");
  return {
    started: !!document.querySelector(actions.reset),
    waterLight: label(actions.toggle_water_light),
    wisconsinLight: label(actions.toggle_wisconsin_light),
    bridgeOpen:
      document
        .querySelector(actions.toggle_bridge)
        ?.getAttribute("aria-pressed") === "true",
    conditions: document.querySelector(".traffic-city__weather")?.textContent,
  };
}

export function registerCityTools() {
  const context = document.modelContext;
  if (!context?.registerTool) return;
  const lifecycle = new AbortController();
  const tools = [
    {
      name: "get_little_milwaukee_state",
      title: "Read Little Milwaukee",
      description:
        "Read the visible traffic light, bridge and local conditions state.",
      inputSchema: {
        type: "object",
        properties: {},
        additionalProperties: false,
      },
      annotations: { readOnlyHint: true, untrustedContentHint: false },
      execute(input) {
        if (!input || typeof input !== "object" || Object.keys(input).length)
          throw new Error("Expected an empty object.");
        return readCity();
      },
    },
    {
      name: "control_little_milwaukee",
      title: "Interact with Little Milwaukee",
      description:
        "Start traffic, toggle one road’s light or the bridge, zoom, or reset the city using its existing controls. Crossing lights remain independent.",
      inputSchema: {
        type: "object",
        properties: { action: { type: "string", enum: Object.keys(actions) } },
        required: ["action"],
        additionalProperties: false,
      },
      annotations: { readOnlyHint: false, untrustedContentHint: false },
      async execute(input) {
        if (
          !input ||
          typeof input !== "object" ||
          Object.keys(input).length !== 1 ||
          !Object.hasOwn(actions, input.action)
        )
          throw new Error("Choose a supported city action.");
        const button = document.querySelector(actions[input.action]);
        if (!button || button.disabled)
          throw new Error("This city control is not available yet.");
        button.click();
        await new Promise((resolve) =>
          requestAnimationFrame(() => requestAnimationFrame(resolve)),
        );
        return readCity();
      },
    },
  ];
  for (const tool of tools) {
    try {
      Promise.resolve(
        context.registerTool(tool, { signal: lifecycle.signal }),
      ).catch(() => {});
    } catch {
      // The city remains usable in browsers without this optional interface.
    }
  }
  return () => lifecycle.abort();
}
