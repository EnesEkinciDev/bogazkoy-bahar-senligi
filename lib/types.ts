export type TeamStatus = "pending" | "approved" | "rejected";

export type Team = {
  id: string;
  name: string;
  captain: string;
  phone?: string;
  slogan: string | null;
  players: string[];
  status: TeamStatus;
  created_at: string;
};

export type PublicTeam = Omit<Team, "phone">;

export type DrawMode = "groups" | "knockout";

export type DrawResult =
  | {
      type: "groups";
      groupCount: number;
      groups: Array<{ name: string; teams: PublicTeam[] }>;
    }
  | {
      type: "knockout";
      bracket: Array<{ team1: PublicTeam | null; team2: PublicTeam | null }>;
    };

export type Draw = {
  id: string;
  type: DrawMode;
  group_count: number | null;
  result: DrawResult;
  created_at: string;
};
