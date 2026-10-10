import type { ProjectManifest } from "../types";

export const cherwoodManifest: ProjectManifest = {
  id: "cherwood",
  title: "Червудский свидетель",
  subtitle: "Бекленд · 1349 · Червуд-боро",
  blurb:
    "Детектив за одним столом в мире Повелителя тайн. Пансион, исчезновения и дверь, которую хозяйка не отпирает.",
  description:
    "Вы — следователи Церкви Ночи (и не только) в туманном Червуд-боро. Пансион Хэтти, реестр гостей, подвал и чужие следы. Большой экран — хаб стола; телефоны — ваши роли, личные находки и ходы.",
  coverImage: "/art/locations/street.jpg",
  tags: ["детектив", "лотм", "мистика", "кооператив"],
  playersMin: 1,
  playersMax: 4,
  estimatedMinutes: 60,
  status: "playable",
  version: "0.2.0-p0",
};
