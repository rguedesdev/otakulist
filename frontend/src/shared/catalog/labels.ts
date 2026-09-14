const mediumLabels: Record<string, string> = {
  ANIME: "Anime",
  MANGA: "Manga",
  LIGHT_NOVEL: "Light Novel",
};

const statusLabels: Record<string, string> = {
  ANNOUNCED: "Anunciado",
  AIRING: "Em exibição",
  PUBLISHING: "Em andamento",
  HIATUS: "Hiato",
  FINISHED: "Finalizado",
  COMPLETED: "Finalizado",
  CANCELLED: "Cancelado",
  DRAFT: "Rascunho",
  PUBLISHED: "Publicado",
};

function readableFallback(value: string) {
  const normalized = value.trim().toLocaleLowerCase("pt-BR").replaceAll("_", " ");
  return normalized.replace(/(^|\s)\p{L}/gu, (letter) => letter.toLocaleUpperCase("pt-BR"));
}

export function catalogMediumLabel(value: string) {
  return mediumLabels[value] ?? readableFallback(value);
}

export function catalogStatusLabel(value: string | null | undefined) {
  if (!value) return null;
  return statusLabels[value] ?? readableFallback(value);
}
