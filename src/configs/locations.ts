/**
 * Bundled location options for the create-group flow.
 *
 * The API stores `locationCountry` / `locationState` / `locationCity` as plain
 * strings, so the option values here are the display names themselves — no id
 * mapping to keep in sync.
 *
 * Coverage is deliberately partial: countries without a `regions` list and
 * regions without a `cities` list fall back to free-text entry in the form, so
 * a listing can still be created anywhere. Swap this file for a location API
 * when one exists.
 */

export interface LocationRegion {
  name: string;
  cities?: string[];
}

export interface LocationCountry {
  name: string;
  regions?: LocationRegion[];
}

const UNITED_STATES_REGIONS: LocationRegion[] = [
  { name: "Alabama", cities: ["Birmingham", "Huntsville", "Montgomery"] },
  { name: "Alaska", cities: ["Anchorage", "Fairbanks"] },
  { name: "Arizona", cities: ["Phoenix", "Scottsdale", "Tucson", "Tempe"] },
  { name: "Arkansas", cities: ["Little Rock", "Fayetteville"] },
  {
    name: "California",
    cities: [
      "Los Angeles",
      "Beverly Hills",
      "Encino",
      "San Francisco",
      "San Diego",
      "San Jose",
      "Palo Alto",
      "Oakland",
      "Berkeley",
      "Irvine",
      "Long Beach",
      "Sacramento",
    ],
  },
  { name: "Colorado", cities: ["Denver", "Boulder", "Aurora", "Colorado Springs"] },
  { name: "Connecticut", cities: ["Stamford", "West Hartford", "New Haven", "Norwalk"] },
  { name: "Delaware", cities: ["Wilmington", "Newark"] },
  { name: "District of Columbia", cities: ["Washington"] },
  {
    name: "Florida",
    cities: [
      "Miami",
      "Miami Beach",
      "Aventura",
      "Surfside",
      "Hallandale Beach",
      "Hollywood",
      "Fort Lauderdale",
      "Boca Raton",
      "West Palm Beach",
      "Orlando",
      "Tampa",
      "Jacksonville",
      "Sarasota",
      "Naples",
    ],
  },
  { name: "Georgia", cities: ["Atlanta", "Sandy Springs", "Dunwoody", "Savannah"] },
  { name: "Hawaii", cities: ["Honolulu"] },
  { name: "Idaho", cities: ["Boise"] },
  {
    name: "Illinois",
    cities: [
      "Chicago",
      "Skokie",
      "Evanston",
      "Highland Park",
      "Buffalo Grove",
      "Northbrook",
      "Deerfield",
    ],
  },
  { name: "Indiana", cities: ["Indianapolis", "Bloomington"] },
  { name: "Iowa", cities: ["Des Moines", "Iowa City"] },
  { name: "Kansas", cities: ["Overland Park", "Wichita"] },
  { name: "Kentucky", cities: ["Louisville", "Lexington"] },
  { name: "Louisiana", cities: ["New Orleans", "Baton Rouge"] },
  { name: "Maine", cities: ["Portland"] },
  {
    name: "Maryland",
    cities: ["Baltimore", "Pikesville", "Silver Spring", "Rockville", "Bethesda", "Potomac"],
  },
  {
    name: "Massachusetts",
    cities: ["Boston", "Brookline", "Newton", "Cambridge", "Sharon", "Framingham", "Worcester"],
  },
  {
    name: "Michigan",
    cities: ["Detroit", "Southfield", "Oak Park", "West Bloomfield", "Ann Arbor"],
  },
  { name: "Minnesota", cities: ["Minneapolis", "St. Paul", "St. Louis Park"] },
  { name: "Mississippi", cities: ["Jackson"] },
  { name: "Missouri", cities: ["St. Louis", "University City", "Kansas City"] },
  { name: "Montana", cities: ["Billings", "Bozeman"] },
  { name: "Nebraska", cities: ["Omaha", "Lincoln"] },
  { name: "Nevada", cities: ["Las Vegas", "Henderson", "Reno"] },
  { name: "New Hampshire", cities: ["Manchester", "Nashua"] },
  {
    name: "New Jersey",
    cities: [
      "Lakewood",
      "Teaneck",
      "Englewood",
      "Fair Lawn",
      "Passaic",
      "Cherry Hill",
      "Livingston",
      "West Orange",
      "Highland Park",
      "Edison",
      "Deal",
      "Toms River",
      "Jersey City",
      "Newark",
      "Princeton",
    ],
  },
  { name: "New Mexico", cities: ["Albuquerque", "Santa Fe"] },
  {
    name: "New York",
    cities: [
      "New York",
      "Brooklyn",
      "Queens",
      "Bronx",
      "Staten Island",
      "Monsey",
      "Spring Valley",
      "New Square",
      "Monroe",
      "Suffern",
      "Lawrence",
      "Cedarhurst",
      "Woodmere",
      "Great Neck",
      "New Rochelle",
      "Scarsdale",
      "White Plains",
      "Albany",
      "Buffalo",
      "Rochester",
      "Syracuse",
    ],
  },
  { name: "North Carolina", cities: ["Charlotte", "Raleigh", "Durham", "Greensboro"] },
  { name: "North Dakota", cities: ["Fargo"] },
  {
    name: "Ohio",
    cities: ["Cleveland", "Beachwood", "University Heights", "Columbus", "Cincinnati"],
  },
  { name: "Oklahoma", cities: ["Oklahoma City", "Tulsa"] },
  { name: "Oregon", cities: ["Portland", "Eugene"] },
  {
    name: "Pennsylvania",
    cities: [
      "Philadelphia",
      "Bala Cynwyd",
      "Elkins Park",
      "Bensalem",
      "Pittsburgh",
      "Allentown",
      "Scranton",
    ],
  },
  { name: "Rhode Island", cities: ["Providence"] },
  { name: "South Carolina", cities: ["Charleston", "Columbia", "Greenville"] },
  { name: "South Dakota", cities: ["Sioux Falls"] },
  { name: "Tennessee", cities: ["Nashville", "Memphis", "Knoxville"] },
  {
    name: "Texas",
    cities: ["Houston", "Dallas", "Plano", "Austin", "San Antonio", "Fort Worth"],
  },
  { name: "Utah", cities: ["Salt Lake City", "Provo"] },
  { name: "Vermont", cities: ["Burlington"] },
  {
    name: "Virginia",
    cities: ["Alexandria", "Arlington", "Fairfax", "Richmond", "Virginia Beach"],
  },
  { name: "Washington", cities: ["Seattle", "Bellevue", "Mercer Island", "Spokane"] },
  { name: "West Virginia", cities: ["Charleston", "Morgantown"] },
  { name: "Wisconsin", cities: ["Milwaukee", "Mequon", "Madison"] },
  { name: "Wyoming", cities: ["Cheyenne", "Jackson"] },
];

const ISRAEL_REGIONS: LocationRegion[] = [
  {
    name: "Central District",
    cities: [
      "Petah Tikva",
      "Rishon LeZion",
      "Netanya",
      "Rehovot",
      "Kfar Saba",
      "Ra'anana",
      "Modi'in-Maccabim-Re'ut",
      "Hod HaSharon",
      "Rosh HaAyin",
      "Ness Ziona",
      "Lod",
      "Ramla",
    ],
  },
  { name: "Haifa District", cities: ["Haifa", "Hadera", "Kiryat Ata", "Nesher", "Tirat Carmel"] },
  { name: "Jerusalem District", cities: ["Jerusalem", "Beit Shemesh", "Mevaseret Zion"] },
  {
    name: "Judea and Samaria",
    cities: ["Modi'in Illit", "Beitar Illit", "Ma'ale Adumim", "Ariel", "Efrat", "Alfei Menashe"],
  },
  {
    name: "Northern District",
    cities: ["Nazareth", "Tiberias", "Safed", "Karmiel", "Afula", "Acre", "Kiryat Shmona"],
  },
  {
    name: "Southern District",
    cities: [
      "Beersheba",
      "Ashdod",
      "Ashkelon",
      "Eilat",
      "Kiryat Gat",
      "Netivot",
      "Sderot",
      "Dimona",
    ],
  },
  {
    name: "Tel Aviv District",
    cities: [
      "Tel Aviv-Yafo",
      "Ramat Gan",
      "Givatayim",
      "Bnei Brak",
      "Herzliya",
      "Holon",
      "Bat Yam",
    ],
  },
];

const CANADA_REGIONS: LocationRegion[] = [
  { name: "Alberta", cities: ["Calgary", "Edmonton"] },
  { name: "British Columbia", cities: ["Vancouver", "Richmond", "Burnaby", "Victoria"] },
  { name: "Manitoba", cities: ["Winnipeg"] },
  { name: "New Brunswick", cities: ["Fredericton", "Moncton", "Saint John"] },
  { name: "Newfoundland and Labrador", cities: ["St. John's"] },
  { name: "Northwest Territories", cities: ["Yellowknife"] },
  { name: "Nova Scotia", cities: ["Halifax"] },
  { name: "Nunavut", cities: ["Iqaluit"] },
  {
    name: "Ontario",
    cities: [
      "Toronto",
      "Thornhill",
      "Vaughan",
      "Richmond Hill",
      "Mississauga",
      "Ottawa",
      "Hamilton",
      "London",
      "Kitchener",
      "Windsor",
    ],
  },
  { name: "Prince Edward Island", cities: ["Charlottetown"] },
  {
    name: "Quebec",
    cities: [
      "Montreal",
      "Côte Saint-Luc",
      "Hampstead",
      "Dollard-des-Ormeaux",
      "Laval",
      "Quebec City",
    ],
  },
  { name: "Saskatchewan", cities: ["Regina", "Saskatoon"] },
  { name: "Yukon", cities: ["Whitehorse"] },
];

const UNITED_KINGDOM_REGIONS: LocationRegion[] = [
  {
    name: "England",
    cities: [
      "London",
      "Manchester",
      "Salford",
      "Gateshead",
      "Leeds",
      "Birmingham",
      "Liverpool",
      "Brighton",
      "Bristol",
      "Nottingham",
    ],
  },
  { name: "Northern Ireland", cities: ["Belfast"] },
  { name: "Scotland", cities: ["Glasgow", "Edinburgh"] },
  { name: "Wales", cities: ["Cardiff", "Swansea"] },
];

const AUSTRALIA_REGIONS: LocationRegion[] = [
  { name: "Australian Capital Territory", cities: ["Canberra"] },
  { name: "New South Wales", cities: ["Sydney", "Bondi", "Newcastle", "Wollongong"] },
  { name: "Northern Territory", cities: ["Darwin"] },
  { name: "Queensland", cities: ["Brisbane", "Gold Coast", "Cairns"] },
  { name: "South Australia", cities: ["Adelaide"] },
  { name: "Tasmania", cities: ["Hobart", "Launceston"] },
  { name: "Victoria", cities: ["Melbourne", "Caulfield", "St Kilda", "Geelong"] },
  { name: "Western Australia", cities: ["Perth", "Fremantle"] },
];

/** Alphabetical so the select needs no extra sorting. */
export const LOCATION_COUNTRIES: LocationCountry[] = [
  { name: "Argentina" },
  { name: "Australia", regions: AUSTRALIA_REGIONS },
  { name: "Austria" },
  { name: "Belgium" },
  { name: "Brazil" },
  { name: "Canada", regions: CANADA_REGIONS },
  { name: "Chile" },
  { name: "Colombia" },
  { name: "Czechia" },
  { name: "Denmark" },
  { name: "Finland" },
  { name: "France" },
  { name: "Germany" },
  { name: "Greece" },
  { name: "Hungary" },
  { name: "India" },
  { name: "Ireland" },
  { name: "Israel", regions: ISRAEL_REGIONS },
  { name: "Italy" },
  { name: "Japan" },
  { name: "Mexico" },
  { name: "Morocco" },
  { name: "Netherlands" },
  { name: "New Zealand" },
  { name: "Norway" },
  { name: "Panama" },
  { name: "Peru" },
  { name: "Poland" },
  { name: "Portugal" },
  { name: "Romania" },
  { name: "Russia" },
  { name: "Singapore" },
  { name: "South Africa" },
  { name: "South Korea" },
  { name: "Spain" },
  { name: "Sweden" },
  { name: "Switzerland" },
  { name: "Thailand" },
  { name: "Turkey" },
  { name: "Ukraine" },
  { name: "United Arab Emirates" },
  { name: "United Kingdom", regions: UNITED_KINGDOM_REGIONS },
  { name: "United States", regions: UNITED_STATES_REGIONS },
  { name: "Uruguay" },
  { name: "Venezuela" },
];

export function findLocationCountry(name?: string | null): LocationCountry | undefined {
  if (!name) return undefined;
  return LOCATION_COUNTRIES.find((country) => country.name === name);
}

export function findLocationRegion(
  countryName?: string | null,
  regionName?: string | null,
): LocationRegion | undefined {
  if (!regionName) return undefined;
  return findLocationCountry(countryName)?.regions?.find((region) => region.name === regionName);
}
