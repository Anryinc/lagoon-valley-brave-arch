import type { LocationDef } from "./types";

export const LOCATIONS: LocationDef[] = [
  {
    id: "street",
    name: "Улица Железных ворот",
    image: "/art/locations/street.jpg",
  },
  {
    id: "parlor",
    name: "Гостиная «Серебряной чайки»",
    image: "/art/locations/parlor.jpg",
  },
  {
    id: "hallway",
    name: "Коридор второго этажа",
    image: "/art/locations/hallway.jpg",
  },
  {
    id: "room7",
    name: "Комната 7",
    image: "/art/locations/room7.jpg",
  },
  {
    id: "basement",
    name: "Дверь в подвал",
    image: "/art/locations/basement.jpg",
  },
  {
    id: "ending",
    name: "Первая ночь",
    image: "/art/locations/basement.jpg",
  },
];

export const LOCATION_BY_ID: Record<string, LocationDef> = Object.fromEntries(
  LOCATIONS.map((l) => [l.id, l]),
);
