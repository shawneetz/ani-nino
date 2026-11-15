// what this file does: one place for how a map marker looks, used by the map and the legend
// so the legend can never drift from the real markers
//   round = martial law, square = today
//   solid fill = confirmed, hollow = still checking
//   dashed border = approximate place
import { TOPICS, type Era, type ProgramStatus, type Topic } from "./vocab";

export type MarkerLook = { background: string; border: string; borderRadius: string };

export function markerLook(program: {
  topic: Topic;
  era?: Era;
  status: ProgramStatus;
  approximate: boolean;
}): MarkerLook {
  const color = TOPICS[program.topic].color;
  return {
    background: program.status === "confirmed" ? color : "#fff",
    border: `3px ${program.approximate ? "dashed" : "solid"} ${color}`,
    borderRadius: program.era === "today" ? "6px" : "9999px",
  };
}

// marker for a spot with several programs, the number inside tells how many
export const GROUP_LOOK: MarkerLook = {
  background: "#1c1917",
  border: "3px solid #fff",
  borderRadius: "9999px",
};
