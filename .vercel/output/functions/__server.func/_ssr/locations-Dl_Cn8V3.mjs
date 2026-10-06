//#region node_modules/.nitro/vite/services/ssr/assets/locations-Dl_Cn8V3.js
var LOCATIONS = [
	{
		id: "street",
		name: "Улица Железных ворот",
		image: "/art/locations/street.jpg"
	},
	{
		id: "parlor",
		name: "Гостиная «Серебряной чайки»",
		image: "/art/locations/parlor.jpg"
	},
	{
		id: "hallway",
		name: "Коридор второго этажа",
		image: "/art/locations/hallway.jpg"
	},
	{
		id: "room7",
		name: "Комната 7",
		image: "/art/locations/room7.jpg"
	},
	{
		id: "basement",
		name: "Дверь в подвал",
		image: "/art/locations/basement.jpg"
	}
];
var LOCATION_BY_ID = Object.fromEntries(LOCATIONS.map((l) => [l.id, l]));
//#endregion
export { LOCATION_BY_ID as n, LOCATIONS as t };
