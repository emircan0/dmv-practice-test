import { client } from "./backend";
export interface Ranking {
  user_id: string;
  nickname: string;
  average_score: number;
  total_solved: number;
  exams_completed: number;
}
export async function loadRankings(
  state: string,
  profile: string,
  metric: "success" | "activity",
  monthOffset: 0 | 1,
): Promise<Ranking[]> {
  if (!client) throw new Error("setupNeeded");
  const { data, error } = await client.rpc("us_leaderboard", {
    p_state: state,
    p_profile: profile,
    p_metric: metric,
    p_month_offset: monthOffset,
  });
  if (error) throw new Error("unavailable");
  return data ?? [];
}
