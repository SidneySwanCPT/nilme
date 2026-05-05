// ============================================
// Camp 8 — NIL Central Data File
// ============================================
//
// HOW TO ADD A NEW DEAL:
// 1. Copy one of the existing deal entries below
// 2. Paste it right after the line that says: const NIL_DEALS = [
// 3. Change the values to match the new deal
// 4. Make sure the entry ends with a comma ,
// 5. Save the file and re-upload to GitHub
//
// FIELD GUIDE:
//   athlete   = Full name of the athlete
//   school    = Name of their high school
//   city      = City the school is in
//   state     = Must be "GA", "FL", "TX", or "CA"
//   sport     = "Football"
//   pos       = Position (QB, WR, RB, TE, OT, IOL, DL, EDGE, LB, CB, S, ATH)
//   stars     = Star rating: 3, 4, or 5
//   deal      = Short description of the deal
//   brand     = Brand or company name ("Undisclosed" if not public)
//   value     = Dollar value ("Undisclosed" if not public)
//   date      = Month and year in this format: "2026-04"
//   source    = Where you found the news: "On3", "247Sports", "ESPN", etc.
//   sourceUrl = Link to the article or source website
//
// ============================================


// ============================================
// STATE NIL RULES & REGULATIONS
// (Do not edit this section unless rules change)
// ============================================
const NIL_RULES = {
  GA: {
    state: "Georgia",
    abbrev: "GA",
    governingBody: "GHSA (Georgia High School Association)",
    governingUrl: "https://www.ghsa.net",
    lastUpdated: "2025",
    summary: "Georgia high school athletes may participate in NIL activities provided they do not conflict with GHSA amateurism rules. Athletes cannot use school logos, uniforms, or facilities in NIL deals without school permission.",
    rules: [
      { title: "Eligibility Protection", text: "NIL activity must not affect a student-athlete's amateur status. Athletes remain eligible as long as compensation is for their name, image, and likeness — not for athletic performance." },
      { title: "School & GHSA Marks", text: "Athletes may NOT use school name, logo, colors, mascot, or uniforms in NIL deals without written school approval." },
      { title: "Agent Restrictions", text: "Athletes may work with licensed sports agents or marketing reps, but the relationship must be disclosed to the school athletic director." },
      { title: "No Pay-for-Play", text: "NIL compensation cannot be tied to athletic performance, a specific stat, or winning. It must be for the athlete's personal brand value only." },
      { title: "Academic Standing", text: "Athletes must maintain academic eligibility standards set by the GHSA to participate in NIL activities." },
      { title: "Prohibited Categories", text: "NIL deals involving alcohol, tobacco, gambling, adult content, or controlled substances are strictly prohibited regardless of athlete age." },
      { title: "Disclosure", text: "Deals valued over $600 require disclosure to school athletic director. Schools may require disclosure for all deals." },
    ],
    resources: [
      { label: "GHSA NIL Policy", url: "https://www.ghsa.net" },
      { label: "Georgia NIL News", url: "https://news.google.com/search?q=Georgia+high+school+NIL+rules+GHSA" },
    ]
  },
  FL: {
    state: "Florida",
    abbrev: "FL",
    governingBody: "FHSAA (Florida High School Athletic Association)",
    governingUrl: "https://www.fhsaa.org",
    lastUpdated: "2025",
    summary: "Florida was one of the first states to enable NIL for high school athletes. The FHSAA permits NIL deals with specific guardrails around endorsements, disclosure, and amateurism.",
    rules: [
      { title: "Broad Permission", text: "Florida athletes may enter NIL deals for social media, endorsements, appearances, autographs, and instructional content without losing eligibility." },
      { title: "School Branding", text: "Use of school name, uniform, logo, or facilities requires prior written consent from the school principal and athletic director." },
      { title: "No Recruiting Inducement", text: "NIL deals cannot be used as an inducement for an athlete to attend or transfer to a specific school. Any deal that appears recruitment-related is prohibited." },
      { title: "Booster Involvement", text: "School boosters cannot directly or indirectly fund NIL deals to influence enrollment decisions." },
      { title: "Agent & Representation", text: "Athletes may sign with agents or marketing companies. The relationship must be disclosed to the school and cannot conflict with FHSAA rules." },
      { title: "Tax Awareness", text: "All NIL income is taxable. Athletes and families are encouraged to consult a tax professional once income is earned." },
      { title: "Prohibited Endorsements", text: "Alcohol, tobacco, gambling, vaping, adult content, and any illegal products are prohibited deal categories." },
    ],
    resources: [
      { label: "FHSAA Official Site", url: "https://www.fhsaa.org" },
      { label: "Florida NIL News", url: "https://news.google.com/search?q=Florida+high+school+NIL+FHSAA" },
    ]
  },
  TX: {
    state: "Texas",
    abbrev: "TX",
    governingBody: "UIL (University Interscholastic League)",
    governingUrl: "https://www.uiltexas.org",
    lastUpdated: "2025",
    summary: "Texas UIL adopted NIL rules allowing high school athletes to monetize their personal brand. Texas has some of the most detailed high school NIL guidelines in the country due to the scale of its athletic programs.",
    rules: [
      { title: "UIL NIL Allowance", text: "UIL permits athletes to earn NIL compensation for their personal brand, social media presence, appearances, and endorsements." },
      { title: "No School Connection", text: "NIL deals must be completely independent of the student's school enrollment. Deals that appear to incentivize school choice or transfer are prohibited." },
      { title: "Disclosure Requirements", text: "Athletes must disclose all NIL agreements to the school's athletic director before executing the deal." },
      { title: "Prohibited Booster Deals", text: "Texas UIL strictly prohibits school-affiliated boosters from arranging or funding NIL deals for athletes enrolled at or considering that school." },
      { title: "Social Media Content", text: "Athletes may create sponsored social media posts but must clearly label them as paid partnerships (#ad or #sponsored)." },
      { title: "Prohibited Categories", text: "Gambling, alcohol, tobacco, vaping, adult content, and cannabis products are prohibited regardless of the athlete's age." },
      { title: "Transfer Rule Interaction", text: "If an NIL deal is found to have influenced a school transfer, the athlete may face a one-year eligibility waiting period under UIL transfer rules." },
    ],
    resources: [
      { label: "UIL Official Site", url: "https://www.uiltexas.org" },
      { label: "Texas NIL News", url: "https://news.google.com/search?q=Texas+high+school+NIL+UIL" },
    ]
  },
  CA: {
    state: "California",
    abbrev: "CA",
    governingBody: "CIF (California Interscholastic Federation)",
    governingUrl: "https://www.cifstate.org",
    lastUpdated: "2025",
    summary: "California's Fair Pay to Play Act (SB 206) pioneered NIL rights at the college level and has influenced high school policy. CIF allows high school athletes to pursue NIL opportunities under specific conditions.",
    rules: [
      { title: "Fair Pay to Play Legacy", text: "California's SB 206 established the model for NIL legislation nationwide. High school athletes benefit from a similar framework through CIF guidelines." },
      { title: "Independent Activity", text: "NIL deals must be executed independently of the student's school. Schools cannot facilitate, broker, or approve specific deals on behalf of athletes." },
      { title: "School Marks Restriction", text: "CIF and school intellectual property — including logos, uniforms, and mascots — cannot be used in any NIL deal without explicit written authorization." },
      { title: "Amateurism Standard", text: "Athletes must remain amateurs in their sport. NIL compensation is permitted only for use of their personal name, image, and likeness — not for competing." },
      { title: "Agent Registration", text: "California requires athlete agents operating with minors to be properly registered with the state. Working with an unregistered agent can jeopardize eligibility." },
      { title: "Minor Protections", text: "Since most high school athletes are minors, all NIL contracts require a parent or legal guardian co-signature under California contract law." },
      { title: "Prohibited Endorsements", text: "Alcohol, tobacco, cannabis (even though legal in CA for adults), gambling, adult content, and weapons are prohibited deal categories for high school athletes." },
    ],
    resources: [
      { label: "CIF Official Site", url: "https://www.cifstate.org" },
      { label: "California NIL News", url: "https://news.google.com/search?q=California+high+school+NIL+CIF" },
    ]
  }
};


// ============================================
// NIL DEALS TRACKER
// Add newest deals at the TOP of this list.
// Each deal must end with a comma.
// ============================================
const NIL_DEALS = [

  // ---- ADD NEW DEALS HERE AT THE TOP ----
  // Example (copy this, fill in the details, and paste above this line):
  //
  // { athlete: "Player Name", school: "School Name HS", city: "City", state: "GA", sport: "Football", pos: "WR", stars: 4, deal: "Social media sponsorship", brand: "Brand Name", value: "Undisclosed", date: "2026-04", source: "On3", sourceUrl: "https://www.on3.com" },
  //


  // ============================================
  // GEORGIA DEALS
  // ============================================
  {
    athlete: "Xavier Griffin",
    school: "Gainesville HS",
    city: "Gainesville",
    state: "GA",
    sport: "Football",
    pos: "LB",
    stars: 5,
    deal: "Local fitness brand ambassador",
    brand: "Regional Fitness Co.",
    value: "Undisclosed",
    date: "2025-09",
    source: "On3",
    sourceUrl: "https://www.on3.com"
  },
  {
    athlete: "Kaiden Prothro",
    school: "Bowdon HS",
    city: "Bowdon",
    state: "GA",
    sport: "Football",
    pos: "TE",
    stars: 5,
    deal: "Sports apparel endorsement",
    brand: "Undisclosed Apparel",
    value: "Undisclosed",
    date: "2025-10",
    source: "247Sports",
    sourceUrl: "https://247sports.com"
  },
  {
    athlete: "DJ Jacobs",
    school: "Blessed Trinity",
    city: "Roswell",
    state: "GA",
    sport: "Football",
    pos: "EDGE",
    stars: 5,
    deal: "Social media sponsorship",
    brand: "Undisclosed",
    value: "Undisclosed",
    date: "2025-11",
    source: "On3",
    sourceUrl: "https://www.on3.com"
  },
  {
    athlete: "KJ Green",
    school: "Stephenson HS",
    city: "Stone Mountain",
    state: "GA",
    sport: "Football",
    pos: "EDGE",
    stars: 5,
    deal: "Athletic gear deal",
    brand: "Undisclosed",
    value: "Undisclosed",
    date: "2025-12",
    source: "On3",
    sourceUrl: "https://www.on3.com"
  },

  // ============================================
  // FLORIDA DEALS
  // ============================================
  {
    athlete: "Dia Bell",
    school: "American Heritage HS",
    city: "Plantation",
    state: "FL",
    sport: "Football",
    pos: "QB",
    stars: 5,
    deal: "Sports drink partnership",
    brand: "Regional Brand",
    value: "Undisclosed",
    date: "2025-08",
    source: "On3",
    sourceUrl: "https://www.on3.com"
  },
  {
    athlete: "Savion Hiter",
    school: "Miami Northwestern HS",
    city: "Miami",
    state: "FL",
    sport: "Football",
    pos: "RB",
    stars: 5,
    deal: "Apparel and footwear deal",
    brand: "Undisclosed",
    value: "Undisclosed",
    date: "2025-09",
    source: "247Sports",
    sourceUrl: "https://247sports.com"
  },
  {
    athlete: "Vernell Brown III",
    school: "Chaminade-Madonna",
    city: "Hollywood",
    state: "FL",
    sport: "Football",
    pos: "WR",
    stars: 5,
    deal: "Social media brand deal",
    brand: "Undisclosed",
    value: "Undisclosed",
    date: "2025-10",
    source: "On3",
    sourceUrl: "https://www.on3.com"
  },
  {
    athlete: "Aaron Chiles",
    school: "Chaminade-Madonna",
    city: "Hollywood",
    state: "FL",
    sport: "Football",
    pos: "DL",
    stars: 5,
    deal: "Training facility ambassador",
    brand: "Local Training Facility",
    value: "Undisclosed",
    date: "2025-11",
    source: "On3",
    sourceUrl: "https://www.on3.com"
  },

  // ============================================
  // TEXAS DEALS
  // ============================================
  {
    athlete: "Bowe Bentley",
    school: "Celina HS",
    city: "Celina",
    state: "TX",
    sport: "Football",
    pos: "QB",
    stars: 5,
    deal: "Quarterback training app partnership",
    brand: "QB Training App",
    value: "Undisclosed",
    date: "2025-07",
    source: "On3",
    sourceUrl: "https://www.on3.com"
  },
  {
    athlete: "Justus Terry",
    school: "Duncanville HS",
    city: "Duncanville",
    state: "TX",
    sport: "Football",
    pos: "DL",
    stars: 5,
    deal: "Sports nutrition deal",
    brand: "Undisclosed Nutrition Brand",
    value: "Undisclosed",
    date: "2025-08",
    source: "247Sports",
    sourceUrl: "https://247sports.com"
  },
  {
    athlete: "Michael Terry III",
    school: "Duncanville HS",
    city: "Duncanville",
    state: "TX",
    sport: "Football",
    pos: "WR",
    stars: 5,
    deal: "Athletic apparel partnership",
    brand: "Undisclosed",
    value: "Undisclosed",
    date: "2025-09",
    source: "On3",
    sourceUrl: "https://www.on3.com"
  },
  {
    athlete: "Caleb Cunningham",
    school: "Westfield HS",
    city: "Spring",
    state: "TX",
    sport: "Football",
    pos: "CB",
    stars: 5,
    deal: "Social media sponsorship",
    brand: "Undisclosed",
    value: "Undisclosed",
    date: "2025-10",
    source: "On3",
    sourceUrl: "https://www.on3.com"
  },

  // ============================================
  // CALIFORNIA DEALS
  // ============================================
  {
    athlete: "Ryder Lyons",
    school: "Folsom HS",
    city: "Folsom",
    state: "CA",
    sport: "Football",
    pos: "QB",
    stars: 5,
    deal: "Quarterback gear endorsement",
    brand: "Undisclosed Apparel",
    value: "Undisclosed",
    date: "2025-06",
    source: "On3",
    sourceUrl: "https://www.on3.com"
  },
  {
    athlete: "Jett Elad",
    school: "Mater Dei HS",
    city: "Santa Ana",
    state: "CA",
    sport: "Football",
    pos: "OT",
    stars: 5,
    deal: "Training equipment deal",
    brand: "Undisclosed Equipment Co.",
    value: "Undisclosed",
    date: "2025-07",
    source: "247Sports",
    sourceUrl: "https://247sports.com"
  },
  {
    athlete: "Aamari Jefferson",
    school: "St. John Bosco HS",
    city: "Bellflower",
    state: "CA",
    sport: "Football",
    pos: "WR",
    stars: 5,
    deal: "Apparel and social media deal",
    brand: "Undisclosed Brand",
    value: "Undisclosed",
    date: "2025-08",
    source: "On3",
    sourceUrl: "https://www.on3.com"
  },
  {
    athlete: "Jaedon Mayfield",
    school: "Mater Dei HS",
    city: "Santa Ana",
    state: "CA",
    sport: "Football",
    pos: "CB",
    stars: 5,
    deal: "Sports drink ambassador",
    brand: "Regional Brand",
    value: "Undisclosed",
    date: "2025-09",
    source: "On3",
    sourceUrl: "https://www.on3.com"
  },

];
