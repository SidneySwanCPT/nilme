// ============================================
// Camp 8 — NIL Sponsor Directory
// Local & Regional Brands by State
// ============================================
//
// HOW TO ADD A NEW BRAND:
// 1. Copy one of the entries below
// 2. Paste it at the TOP of the SPONSORS list
// 3. Fill in the details
// 4. Make sure it ends with a comma ,
// 5. Save and re-upload to GitHub
//
// CATEGORY OPTIONS:
//   "Apparel"         = Clothing, footwear, gear
//   "Nutrition"       = Supplements, protein, energy drinks
//   "Training"        = Gyms, training facilities, coaches
//   "Media"           = Photography, videography, content creation
//   "Finance"         = Banking, investing, financial planning for athletes
//   "Tech"            = Apps, software, recruiting platforms
//   "Food & Bev"      = Restaurants, food brands, beverages
//   "Automotive"      = Car dealerships, auto brands
//   "Real Estate"     = Agents, developers, property
//   "Healthcare"      = Sports medicine, therapy, dental
//   "Other"           = Anything that doesn't fit above
//
// DEAL_TYPES OPTIONS (what they offer athletes):
//   "Social Media"    = Paid posts / ambassador content
//   "Appearances"     = In-store, events, meet & greets
//   "Endorsement"     = Ongoing brand partnership
//   "Equity"          = Ownership stake (rare for HS)
//   "Product"         = Free product / gear
//   "Revenue Share"   = % of sales from code / link
//
// ============================================

const SPONSORS = [

  // ---- ADD NEW BRANDS HERE AT THE TOP ----


  // ============================================
  // GEORGIA BRANDS
  // ============================================
  {
    brand: "Athletic Republic Atlanta",
    category: "Training",
    state: "GA",
    city: "Atlanta",
    description: "Premier sports performance training center specializing in speed, agility, and strength development for high school athletes.",
    website: "https://www.athleticrepublic.com",
    contactEmail: "atlanta@athleticrepublic.com",
    dealTypes: ["Social Media", "Appearances", "Product"],
    sportsInterest: ["Football", "Basketball", "Track"],
    starsMin: 3,
    instagram: "@athleticrepublicatl",
    openToHS: true,
    notes: "Looking for local 3-5 star athletes to feature in training content"
  },
  {
    brand: "Varsity Sports ATL",
    category: "Apparel",
    state: "GA",
    city: "Atlanta",
    description: "Atlanta-based sports apparel brand specializing in custom gear for high school and college athletes across the Southeast.",
    website: "https://www.varsitysportsatl.com",
    contactEmail: "nil@varsitysportsatl.com",
    dealTypes: ["Social Media", "Endorsement", "Product"],
    sportsInterest: ["Football", "Basketball"],
    starsMin: 3,
    instagram: "@varsitysportsatl",
    openToHS: true,
    notes: "Active NIL program for Georgia HS athletes. Reach out via Instagram DM"
  },
  {
    brand: "Smoothie King (Georgia Franchise)",
    category: "Food & Bev",
    state: "GA",
    city: "Multiple GA Locations",
    description: "Regional Smoothie King franchise locations actively seeking athlete brand ambassadors across metro Atlanta and Georgia.",
    website: "https://www.smoothieking.com",
    contactEmail: null,
    dealTypes: ["Social Media", "Appearances", "Revenue Share"],
    sportsInterest: ["Football", "Basketball", "All Sports"],
    starsMin: 3,
    instagram: "@smoothieking",
    openToHS: true,
    notes: "Contact local franchise owner directly. Active in HS athlete NIL deals"
  },
  {
    brand: "GameDay Photo GA",
    category: "Media",
    state: "GA",
    city: "Gainesville",
    description: "Professional sports photography and highlight reel production for high school athletes looking to build their recruiting profile.",
    website: null,
    contactEmail: "info@gamedayphotoga.com",
    dealTypes: ["Revenue Share", "Product"],
    sportsInterest: ["Football", "All Sports"],
    starsMin: 0,
    instagram: "@gamedayphotoga",
    openToHS: true,
    notes: "Offers barter deals — athlete promotes, gets free shoot in return"
  },
  {
    brand: "Moe's Southwest Grill (GA Franchise)",
    category: "Food & Bev",
    state: "GA",
    city: "Multiple GA Locations",
    description: "Georgia-based Moe's franchise locations partnering with local high school and college athletes for social media ambassador deals.",
    website: "https://www.moes.com",
    contactEmail: null,
    dealTypes: ["Social Media", "Appearances"],
    sportsInterest: ["Football", "All Sports"],
    starsMin: 3,
    instagram: "@moes_sw_grill",
    openToHS: true,
    notes: "Reach out to local franchise. Typical deal includes free meals + paid social post"
  },
  {
    brand: "D1 Training Atlanta",
    category: "Training",
    state: "GA",
    city: "Atlanta",
    description: "D1 Training facility network offering elite sports performance training for high school athletes at multiple metro Atlanta locations.",
    website: "https://d1training.com",
    contactEmail: "atlanta@d1training.com",
    dealTypes: ["Social Media", "Endorsement", "Product"],
    sportsInterest: ["Football", "Basketball", "Baseball"],
    starsMin: 3,
    instagram: "@d1training",
    openToHS: true,
    notes: "Open to ambassador deals with local 3+ star prospects"
  },
  {
    brand: "Chick-fil-A (Select GA Locations)",
    category: "Food & Bev",
    state: "GA",
    city: "Multiple GA Locations",
    description: "Select Georgia Chick-fil-A franchise operators running local NIL ambassador programs for high school athletes.",
    website: "https://www.chick-fil-a.com",
    contactEmail: null,
    dealTypes: ["Social Media", "Appearances"],
    sportsInterest: ["Football", "All Sports"],
    starsMin: 4,
    instagram: "@chickfila",
    openToHS: true,
    notes: "Individual franchise operator decision. Most active in Gainesville, Buford, Marietta areas"
  },

  // ============================================
  // FLORIDA BRANDS
  // ============================================
  {
    brand: "Florida Elite Sports Training",
    category: "Training",
    state: "FL",
    city: "Fort Lauderdale",
    description: "South Florida's premier speed and agility training center, working with many of the top high school prospects in Broward and Miami-Dade counties.",
    website: null,
    contactEmail: "nil@flelite.com",
    dealTypes: ["Social Media", "Endorsement", "Appearances"],
    sportsInterest: ["Football", "Basketball"],
    starsMin: 3,
    instagram: "@flelitetraining",
    openToHS: true,
    notes: "Actively looking for South Florida high school athletes for ambassador partnerships"
  },
  {
    brand: "SunSports Apparel",
    category: "Apparel",
    state: "FL",
    city: "Miami",
    description: "Miami-based athletic apparel company producing premium training gear and lifestyle wear for Florida athletes.",
    website: "https://www.sunsportsapparel.com",
    contactEmail: "athletes@sunsportsapparel.com",
    dealTypes: ["Social Media", "Endorsement", "Product"],
    sportsInterest: ["Football", "Basketball", "Track"],
    starsMin: 3,
    instagram: "@sunsportsapparel",
    openToHS: true,
    notes: "Gear + monthly stipend for qualifying ambassadors with 5k+ social following"
  },
  {
    brand: "Tropical Smoothie Cafe (FL Franchise)",
    category: "Food & Bev",
    state: "FL",
    city: "Multiple FL Locations",
    description: "Florida franchise locations of Tropical Smoothie Cafe running active NIL programs with local high school and college athletes.",
    website: "https://www.tropicalsmoothiecafe.com",
    contactEmail: null,
    dealTypes: ["Social Media", "Revenue Share"],
    sportsInterest: ["Football", "All Sports"],
    starsMin: 3,
    instagram: "@tropicalsmoothie",
    openToHS: true,
    notes: "Reach out to local store managers. Deals typically involve discount code + commission"
  },
  {
    brand: "305 Sports Media",
    category: "Media",
    state: "FL",
    city: "Miami",
    description: "South Florida sports media and content creation company specializing in athlete brand building, highlight reels, and social media growth.",
    website: null,
    contactEmail: "305sportsmedia@gmail.com",
    dealTypes: ["Revenue Share", "Product"],
    sportsInterest: ["Football", "Basketball", "All Sports"],
    starsMin: 0,
    instagram: "@305sportsmedia",
    openToHS: true,
    notes: "Works with all star levels. Specializes in Hudl highlight production and Instagram growth"
  },
  {
    brand: "NextLevel Sports Performance FL",
    category: "Training",
    state: "FL",
    city: "Orlando",
    description: "Central Florida sports performance training center with an active ambassador program for high school football and basketball athletes.",
    website: null,
    contactEmail: "nil@nextlevelfl.com",
    dealTypes: ["Social Media", "Product", "Appearances"],
    sportsInterest: ["Football", "Basketball"],
    starsMin: 3,
    instagram: "@nextlevelfl",
    openToHS: true,
    notes: "Offers free training sessions in exchange for social media content"
  },

  // ============================================
  // TEXAS BRANDS
  // ============================================
  {
    brand: "Texas Speed Academy",
    category: "Training",
    state: "TX",
    city: "Dallas",
    description: "DFW's top speed training facility working with hundreds of Texas high school prospects annually. Strong relationships with college coaches.",
    website: "https://www.texasspeedacademy.com",
    contactEmail: "nil@texasspeedacademy.com",
    dealTypes: ["Social Media", "Endorsement", "Appearances"],
    sportsInterest: ["Football", "Track", "Basketball"],
    starsMin: 3,
    instagram: "@texasspeedacademy",
    openToHS: true,
    notes: "One of the most active NIL programs in Texas. Prefers DFW-area athletes"
  },
  {
    brand: "Lone Star Eats",
    category: "Food & Bev",
    state: "TX",
    city: "Houston",
    description: "Houston-based regional restaurant group with an active HS athlete ambassador program spanning multiple locations across the metro area.",
    website: null,
    contactEmail: "marketing@lonestareats.com",
    dealTypes: ["Social Media", "Appearances"],
    sportsInterest: ["Football", "All Sports"],
    starsMin: 3,
    instagram: "@lonestareats",
    openToHS: true,
    notes: "Houston athletes preferred. Monthly deal structure available"
  },
  {
    brand: "GridironGear TX",
    category: "Apparel",
    state: "TX",
    city: "Austin",
    description: "Texas-based football apparel and equipment company focused on high school and college athletes across the state.",
    website: "https://www.gridirongear.com",
    contactEmail: "athletes@gridirongear.com",
    dealTypes: ["Social Media", "Product", "Endorsement"],
    sportsInterest: ["Football"],
    starsMin: 3,
    instagram: "@gridirongear_tx",
    openToHS: true,
    notes: "Football-only. Strong interest in 4-5 star linemen and skill positions"
  },
  {
    brand: "DFW Sports Photos",
    category: "Media",
    state: "TX",
    city: "Dallas",
    description: "Professional sports photography studio serving DFW high school and college athletes with recruiting-quality photo packages.",
    website: null,
    contactEmail: "dfwsportsphotos@gmail.com",
    dealTypes: ["Revenue Share", "Product"],
    sportsInterest: ["Football", "All Sports"],
    starsMin: 0,
    instagram: "@dfwsportsphotos",
    openToHS: true,
    notes: "All star levels welcome. Barter and paid options available"
  },
  {
    brand: "H-Town Elite Training",
    category: "Training",
    state: "TX",
    city: "Houston",
    description: "Houston's premier position-specific training facility for football athletes. Works with top Houston-area high school prospects.",
    website: null,
    contactEmail: "nil@htownelite.com",
    dealTypes: ["Social Media", "Product", "Endorsement"],
    sportsInterest: ["Football"],
    starsMin: 3,
    instagram: "@htownelitetraining",
    openToHS: true,
    notes: "QB and skill position focus. Houston metro athletes only"
  },
  {
    brand: "Texas First Financial",
    category: "Finance",
    state: "TX",
    city: "Dallas",
    description: "Financial planning firm specializing in helping young athletes and their families build wealth early through NIL income management.",
    website: "https://www.texasfirstfinancial.com",
    contactEmail: "athletes@txfirstfinancial.com",
    dealTypes: ["Social Media", "Appearances"],
    sportsInterest: ["Football", "All Sports"],
    starsMin: 4,
    instagram: "@txfirstfinancial",
    openToHS: true,
    notes: "Specifically looking for 4-5 star athletes to serve as brand ambassadors for financial literacy content"
  },

  // ============================================
  // CALIFORNIA BRANDS
  // ============================================
  {
    brand: "SoCal Grind Performance",
    category: "Training",
    state: "CA",
    city: "Los Angeles",
    description: "Los Angeles-based sports performance company working with top Southern California high school and college athletes.",
    website: null,
    contactEmail: "nil@socalgrind.com",
    dealTypes: ["Social Media", "Endorsement", "Product"],
    sportsInterest: ["Football", "Basketball", "Track"],
    starsMin: 3,
    instagram: "@socalgrindperformance",
    openToHS: true,
    notes: "SoCal athletes preferred. Strong social media presence required (5k+ followers)"
  },
  {
    brand: "Pacific Apparel Co.",
    category: "Apparel",
    state: "CA",
    city: "Los Angeles",
    description: "California lifestyle and athletic apparel brand with a growing high school athlete ambassador program across SoCal and NorCal.",
    website: "https://www.pacificapparelco.com",
    contactEmail: "athletes@pacificapparelco.com",
    dealTypes: ["Social Media", "Product", "Revenue Share"],
    sportsInterest: ["Football", "Basketball", "All Sports"],
    starsMin: 3,
    instagram: "@pacificapparelco",
    openToHS: true,
    notes: "Open to all California athletes with a public social media presence"
  },
  {
    brand: "Bay Area Elite Sports",
    category: "Training",
    state: "CA",
    city: "San Francisco",
    description: "Northern California's top training facility for high school football and basketball athletes. Partners with De La Salle and Folsom programs.",
    website: null,
    contactEmail: "nil@bayareaelitesports.com",
    dealTypes: ["Social Media", "Endorsement", "Appearances"],
    sportsInterest: ["Football", "Basketball"],
    starsMin: 3,
    instagram: "@bayareaelitesports",
    openToHS: true,
    notes: "NorCal focus. Strong connections with De La Salle, Folsom, and Valley Christian"
  },
  {
    brand: "CA Sports Nutrition",
    category: "Nutrition",
    state: "CA",
    city: "San Diego",
    description: "California-based sports nutrition brand specializing in clean, NCAA-compliant supplements for high school and college athletes.",
    website: "https://www.casportsnutrition.com",
    contactEmail: "athletes@casportsnutrition.com",
    dealTypes: ["Social Media", "Revenue Share", "Product"],
    sportsInterest: ["Football", "All Sports"],
    starsMin: 3,
    instagram: "@casportsnutrition",
    openToHS: true,
    notes: "Discount code + commission structure. California athletes preferred but open nationally"
  },
  {
    brand: "West Coast Sports Media",
    category: "Media",
    state: "CA",
    city: "Los Angeles",
    description: "LA-based sports media company offering professional photography, videography, and social media management for high school athletes.",
    website: null,
    contactEmail: "wcsportsmedia@gmail.com",
    dealTypes: ["Revenue Share", "Product"],
    sportsInterest: ["Football", "Basketball", "All Sports"],
    starsMin: 0,
    instagram: "@wcsportsmedia",
    openToHS: true,
    notes: "All star levels welcome. Specializes in Mater Dei, St. John Bosco, De La Salle area athletes"
  },
  {
    brand: "Golden State Sports Chiro",
    category: "Healthcare",
    state: "CA",
    city: "Orange County",
    description: "Sports chiropractic and recovery clinic serving Southern California high school athletes. Offers NIL deals in exchange for content creation.",
    website: "https://www.goldenstatesportschiro.com",
    contactEmail: "nil@gssportschiro.com",
    dealTypes: ["Social Media", "Product"],
    sportsInterest: ["Football", "All Sports"],
    starsMin: 3,
    instagram: "@goldenstatesportschiro",
    openToHS: true,
    notes: "Free recovery services + small stipend for qualifying athletes"
  },

];
