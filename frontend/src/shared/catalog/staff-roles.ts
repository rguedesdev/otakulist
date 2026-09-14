export const staffRoleOptions = [
  { value: "MANGAKA", role: "Mangaka", contribution: "História & Arte" },
  { value: "GENSAKUSHA", role: "Gensakusha", contribution: "História" },
  { value: "DIRECTOR", role: "Diretor", contribution: null },
  { value: "EPISODE_DIRECTOR", role: "Diretor de episódio", contribution: null },
  { value: "SCREENWRITER", role: "Roteirista", contribution: "Roteiro" },
  { value: "SERIES_COMPOSITION", role: "Composição da série", contribution: null },
  { value: "CHARACTER_DESIGN", role: "Designer de personagens", contribution: "Design de personagens" },
  { value: "ANIMATION_DIRECTOR", role: "Diretor de animação", contribution: null },
  { value: "ANIMATOR", role: "Animador", contribution: null },
  { value: "ART_DIRECTOR", role: "Diretor de arte", contribution: null },
  { value: "PHOTOGRAPHY_DIRECTOR", role: "Diretor de fotografia", contribution: null },
  { value: "SOUND_DIRECTOR", role: "Diretor de som", contribution: null },
  { value: "COMPOSER", role: "Compositor", contribution: "Música" },
  { value: "PRODUCER", role: "Produtor", contribution: null },
] as const;

export const publicationStaffRoleOptions = {
  MANGA: [
    { value: "MANGAKA", role: "Mangaka", contribution: "História & Arte" },
    { value: "GENSAKUSHA", role: "Gensakusha", contribution: "História" },
  ],
  LIGHT_NOVEL: [
    { value: "GENSAKUSHA", role: "Gensakusha", contribution: "História" },
  ],
} as const;

export function normalizeStaffCredit<T extends { role: string; contribution?: string | null }>(credit: T) {
  if (credit.role === "Autor") return { ...credit, role: "Gensakusha", contribution: "História" };
  if (credit.role === "Mangaka" && credit.contribution === "Arte & História") {
    return { ...credit, contribution: "História & Arte" };
  }
  return credit;
}

export function staffRoleValue(role: string, contribution?: string | null) {
  const normalized = normalizeStaffCredit({ role, contribution });
  return staffRoleOptions.find((option) => option.role === normalized.role && option.contribution === (normalized.contribution ?? null))?.value ?? "";
}
