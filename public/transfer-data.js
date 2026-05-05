// ============================================
// Camp 8 — Transfer Portal Data
// Sport: Football | Scope: National
// ============================================
//
// HOW TO ADD A NEW TRANSFER:
// 1. Copy one of the entries below
// 2. Paste it at the TOP of the TRANSFERS list
// 3. Fill in the details
// 4. Make sure it ends with a comma ,
// 5. Save and re-upload to GitHub
//
// STATUS OPTIONS:
//   "In Portal"    = Athlete has entered the portal, no new school yet
//   "Committed"    = Has committed to a new school
//   "Enrolled"     = Has enrolled and cleared eligibility at new school
//   "Withdrawn"    = Entered portal but returned to original school
//
// ELIGIBILITY OPTIONS:
//   "Immediate"    = Eligible to play right away
//   "Sit Year"     = Must sit out one year per state rules
//   "Pending"      = Eligibility ruling not yet issued
//
// ============================================

const TRANSFERS = [

  // ---- ADD NEW TRANSFERS HERE AT THE TOP ----


  // ============================================
  // GEORGIA
  // ============================================
  {
    athlete: "Marcus Reed",
    pos: "QB",
    stars: 4,
    fromSchool: "Grayson HS",
    fromCity: "Loganville",
    fromState: "GA",
    toSchool: "Buford HS",
    toCity: "Buford",
    toState: "GA",
    classYear: 2026,
    status: "Enrolled",
    eligibility: "Immediate",
    date: "2026-01-10",
    reason: "Closer to home / better opportunity",
    source: "MaxPreps",
    sourceUrl: "https://www.maxpreps.com"
  },
  {
    athlete: "Devon Willis",
    pos: "WR",
    stars: 3,
    fromSchool: "Collins Hill HS",
    fromCity: "Suwanee",
    fromState: "GA",
    toSchool: "Mill Creek HS",
    toCity: "Hoschton",
    toState: "GA",
    classYear: 2027,
    status: "Enrolled",
    eligibility: "Immediate",
    date: "2026-01-15",
    reason: "Family relocation",
    source: "On3",
    sourceUrl: "https://www.on3.com"
  },
  {
    athlete: "Caden Brooks",
    pos: "LB",
    stars: 3,
    fromSchool: "North Cobb HS",
    fromCity: "Kennesaw",
    fromState: "GA",
    toSchool: "Carrollton HS",
    toCity: "Carrollton",
    toState: "GA",
    classYear: 2027,
    status: "Committed",
    eligibility: "Pending",
    date: "2026-02-01",
    reason: "Seeking more exposure",
    source: "247Sports",
    sourceUrl: "https://247sports.com"
  },

  // ============================================
  // FLORIDA
  // ============================================
  {
    athlete: "Isaiah Carter",
    pos: "CB",
    stars: 4,
    fromSchool: "Lakeland HS",
    fromCity: "Lakeland",
    fromState: "FL",
    toSchool: "Chaminade-Madonna",
    toCity: "Hollywood",
    toState: "FL",
    classYear: 2027,
    status: "Enrolled",
    eligibility: "Immediate",
    date: "2026-01-08",
    reason: "Higher profile program",
    source: "On3",
    sourceUrl: "https://www.on3.com"
  },
  {
    athlete: "Jaylen Moore",
    pos: "RB",
    stars: 3,
    fromSchool: "Venice HS",
    fromCity: "Venice",
    fromState: "FL",
    toSchool: "IMG Academy",
    toCity: "Bradenton",
    toState: "FL",
    classYear: 2027,
    status: "Enrolled",
    eligibility: "Immediate",
    date: "2026-01-20",
    reason: "National exposure at IMG",
    source: "247Sports",
    sourceUrl: "https://247sports.com"
  },
  {
    athlete: "Tre Williams",
    pos: "EDGE",
    stars: 4,
    fromSchool: "Carol City HS",
    fromCity: "Miami Gardens",
    fromState: "FL",
    toSchool: "American Heritage HS",
    toCity: "Plantation",
    toState: "FL",
    classYear: 2027,
    status: "Committed",
    eligibility: "Pending",
    date: "2026-02-12",
    reason: "Better recruiting exposure",
    source: "On3",
    sourceUrl: "https://www.on3.com"
  },

  // ============================================
  // TEXAS
  // ============================================
  {
    athlete: "Malik Johnson",
    pos: "DL",
    stars: 4,
    fromSchool: "Cedar Hill HS",
    fromCity: "Cedar Hill",
    fromState: "TX",
    toSchool: "Duncanville HS",
    toCity: "Duncanville",
    toState: "TX",
    classYear: 2027,
    status: "Enrolled",
    eligibility: "Sit Year",
    date: "2026-01-05",
    reason: "Coaching change at previous school",
    source: "247Sports",
    sourceUrl: "https://247sports.com"
  },
  {
    athlete: "Bryce Thomas",
    pos: "WR",
    stars: 3,
    fromSchool: "Conroe HS",
    fromCity: "Conroe",
    fromState: "TX",
    toSchool: "North Shore HS",
    toCity: "Houston",
    toState: "TX",
    classYear: 2026,
    status: "Enrolled",
    eligibility: "Immediate",
    date: "2026-01-18",
    reason: "Family relocation",
    source: "MaxPreps",
    sourceUrl: "https://www.maxpreps.com"
  },
  {
    athlete: "Jordan Price",
    pos: "OT",
    stars: 4,
    fromSchool: "Allen HS",
    fromCity: "Allen",
    fromState: "TX",
    toSchool: "Southlake Carroll HS",
    toCity: "Southlake",
    toState: "TX",
    classYear: 2027,
    status: "In Portal",
    eligibility: "Pending",
    date: "2026-02-20",
    reason: "Undisclosed",
    source: "On3",
    sourceUrl: "https://www.on3.com"
  },
  {
    athlete: "Darius Evans",
    pos: "QB",
    stars: 3,
    fromSchool: "Denton Ryan HS",
    fromCity: "Denton",
    fromState: "TX",
    toSchool: "Celina HS",
    toCity: "Celina",
    toState: "TX",
    classYear: 2027,
    status: "Committed",
    eligibility: "Pending",
    date: "2026-03-01",
    reason: "Better fit for offensive system",
    source: "247Sports",
    sourceUrl: "https://247sports.com"
  },

  // ============================================
  // CALIFORNIA
  // ============================================
  {
    athlete: "Elijah Summers",
    pos: "S",
    stars: 4,
    fromSchool: "Long Beach Poly HS",
    fromCity: "Long Beach",
    fromState: "CA",
    toSchool: "Mater Dei HS",
    toCity: "Santa Ana",
    toState: "CA",
    classYear: 2027,
    status: "Enrolled",
    eligibility: "Sit Year",
    date: "2026-01-12",
    reason: "Higher level of competition",
    source: "On3",
    sourceUrl: "https://www.on3.com"
  },
  {
    athlete: "Xavier Daniels",
    pos: "CB",
    stars: 3,
    fromSchool: "Serra HS",
    fromCity: "Gardena",
    fromState: "CA",
    toSchool: "St. John Bosco HS",
    toCity: "Bellflower",
    toState: "CA",
    classYear: 2027,
    status: "Enrolled",
    eligibility: "Immediate",
    date: "2026-01-25",
    reason: "Family relocation",
    source: "MaxPreps",
    sourceUrl: "https://www.maxpreps.com"
  },
  {
    athlete: "Caleb Patterson",
    pos: "RB",
    stars: 3,
    fromSchool: "Mission Viejo HS",
    fromCity: "Mission Viejo",
    fromState: "CA",
    toSchool: "Folsom HS",
    toCity: "Folsom",
    toState: "CA",
    classYear: 2027,
    status: "In Portal",
    eligibility: "Pending",
    date: "2026-03-10",
    reason: "Seeking more carries",
    source: "247Sports",
    sourceUrl: "https://247sports.com"
  },

  // ============================================
  // OTHER STATES (National)
  // ============================================
  {
    athlete: "Kam Williams",
    pos: "QB",
    stars: 4,
    fromSchool: "IMG Academy",
    fromCity: "Bradenton",
    fromState: "FL",
    toSchool: "Archbishop Spalding HS",
    toCity: "Severn",
    toState: "MD",
    classYear: 2027,
    status: "Enrolled",
    eligibility: "Immediate",
    date: "2026-01-30",
    reason: "Closer to family",
    source: "On3",
    sourceUrl: "https://www.on3.com"
  },
  {
    athlete: "Denzel Howard",
    pos: "WR",
    stars: 4,
    fromSchool: "St. Frances Academy",
    fromCity: "Baltimore",
    fromState: "MD",
    toSchool: "Chaminade-Madonna",
    toCity: "Hollywood",
    toState: "FL",
    classYear: 2027,
    status: "Enrolled",
    eligibility: "Immediate",
    date: "2026-02-05",
    reason: "Higher national profile",
    source: "247Sports",
    sourceUrl: "https://247sports.com"
  },
  {
    athlete: "Toriano Bell",
    pos: "LB",
    stars: 4,
    fromSchool: "Benedictine College Prep",
    fromCity: "Richmond",
    fromState: "VA",
    toSchool: "Duncanville HS",
    toCity: "Duncanville",
    toState: "TX",
    classYear: 2027,
    status: "Committed",
    eligibility: "Pending",
    date: "2026-02-18",
    reason: "Better competition level",
    source: "On3",
    sourceUrl: "https://www.on3.com"
  },
  {
    athlete: "Marcus Webb",
    pos: "DL",
    stars: 3,
    fromSchool: "Peach County HS",
    fromCity: "Fort Valley",
    fromState: "GA",
    toSchool: "Lee County HS",
    toCity: "Leesburg",
    toState: "GA",
    classYear: 2028,
    status: "Enrolled",
    eligibility: "Immediate",
    date: "2026-03-05",
    reason: "Family relocation",
    source: "MaxPreps",
    sourceUrl: "https://www.maxpreps.com"
  },

];
