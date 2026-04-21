import type { DrawMode, DrawResult, PublicTeam } from "./types";

export function suggestGroupCount(teamCount: number) {
  if (teamCount <= 4) return 1;
  if (teamCount <= 8) return 2;
  if (teamCount <= 16) return 4;
  return Math.ceil(teamCount / 4);
}

function shuffle<T>(items: T[]) {
  const copy = [...items];

  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }

  return copy;
}

function drawGroups(teams: PublicTeam[], groupCount: number): DrawResult {
  const safeGroupCount = Math.min(Math.max(1, groupCount), Math.max(1, teams.length));
  const groups = Array.from({ length: safeGroupCount }, () => [] as PublicTeam[]);

  shuffle(teams).forEach((team, index) => {
    groups[index % safeGroupCount].push(team);
  });

  return {
    type: "groups",
    groupCount: safeGroupCount,
    groups: groups.map((group, index) => ({
      name: String.fromCharCode(65 + index),
      teams: group,
    })),
  };
}

function drawKnockout(teams: PublicTeam[]): DrawResult {
  const shuffled = shuffle(teams);
  const rounds = Math.ceil(Math.log2(shuffled.length));
  const size = Math.pow(2, rounds);
  const padded: Array<PublicTeam | null> = [...shuffled];

  while (padded.length < size) {
    padded.push(null);
  }

  const bracket: Array<{ team1: PublicTeam | null; team2: PublicTeam | null }> = [];

  for (let i = 0; i < padded.length; i += 2) {
    bracket.push({ team1: padded[i], team2: padded[i + 1] });
  }

  return {
    type: "knockout",
    bracket,
  };
}

export function createDraw(teams: PublicTeam[], mode: DrawMode, groupCount: number): DrawResult {
  if (mode === "groups") {
    return drawGroups(teams, groupCount);
  }

  return drawKnockout(teams);
}
