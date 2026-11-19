// Launch scope in editorial priority order. Publication, not this list, enables study.
export const STATES = [
  { code: "CA", name: "California", phase: 1 },
  { code: "TX", name: "Texas", phase: 1 },
  { code: "FL", name: "Florida", phase: 1 },
  { code: "NY", name: "New York", phase: 1 },
  { code: "PA", name: "Pennsylvania", phase: 2 },
  { code: "IL", name: "Illinois", phase: 2 },
  { code: "OH", name: "Ohio", phase: 2 },
  { code: "GA", name: "Georgia", phase: 2 },
] as const;
export type TargetState = (typeof STATES)[number]["code"];
export const isTargetState = (code: string): code is TargetState =>
  STATES.some((state) => state.code === code);
export const stateName = (code: string) =>
  STATES.find((state) => state.code === code)?.name ?? code;
