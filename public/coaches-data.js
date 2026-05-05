// ============================================
// Camp 8 — Coaches Directory Data
// HOW TO UPDATE: Find the program, edit fields,
// update lastUpdated to today's date, push to GitHub.
// Social handles: enter without the @ symbol.
// ============================================

const COACHES_DATA = [

  // ── FBS · SEC ─────────────────────────────
  {
    school: 'University of Georgia', nickname: 'Bulldogs',
    division: 'FBS', conference: 'SEC', state: 'GA', city: 'Athens',
    headCoach: 'Kirby Smart', oc: 'Mike Bobo', dc: 'Glenn Schumann',
    recruitingCoord: 'Bryan McClendon',
    staffPage: 'https://georgiadogs.com/sports/football/roster/coaches',
    espnId: 61, domain: 'uga.edu',
    hcTwitter: 'KirbySmartUGA', hcInstagram: 'kirbysmart',
    rcTwitter: 'CoachMcClendon', rcInstagram: 'coachmcclendon',
    lastUpdated: '2026-04'
  },
  {
    school: 'University of Alabama', nickname: 'Crimson Tide',
    division: 'FBS', conference: 'SEC', state: 'AL', city: 'Tuscaloosa',
    headCoach: 'Kalen DeBoer', oc: 'Nick Sheridan', dc: 'Kane Wommack',
    recruitingCoord: 'JaMarcus Shephard',
    staffPage: 'https://rolltide.com/sports/football/roster/coaches',
    espnId: 333, domain: 'ua.edu',
    hcTwitter: 'CoachDeBoer', hcInstagram: 'coachdeboer',
    rcTwitter: 'CoachJShephard', rcInstagram: '',
    lastUpdated: '2026-04'
  },
  {
    school: 'University of Florida', nickname: 'Gators',
    division: 'FBS', conference: 'SEC', state: 'FL', city: 'Gainesville',
    headCoach: 'Billy Napier', oc: 'Bobby Petrino', dc: 'Austin Armstrong',
    recruitingCoord: 'Corey Raymond',
    staffPage: 'https://floridagators.com/sports/football/roster/coaches',
    espnId: 57, domain: 'ufl.edu',
    hcTwitter: 'CoachBillyNapier', hcInstagram: 'coachbillynapier',
    rcTwitter: 'CoachCRaymond', rcInstagram: '',
    lastUpdated: '2026-04'
  },
  {
    school: 'University of Tennessee', nickname: 'Volunteers',
    division: 'FBS', conference: 'SEC', state: 'TN', city: 'Knoxville',
    headCoach: 'Josh Heupel', oc: 'Joey Halzle', dc: 'Tim Banks',
    recruitingCoord: 'Tee Martin',
    staffPage: 'https://utsports.com/sports/football/roster/coaches',
    espnId: 2633, domain: 'utk.edu',
    hcTwitter: 'HeupelJosh', hcInstagram: 'heupeljosh',
    rcTwitter: 'TeeMartin8', rcInstagram: 'teemartin8',
    lastUpdated: '2026-04'
  },
  {
    school: 'LSU', nickname: 'Tigers',
    division: 'FBS', conference: 'SEC', state: 'LA', city: 'Baton Rouge',
    headCoach: 'Brian Kelly', oc: 'Joe Sloan', dc: 'Blake Baker',
    recruitingCoord: 'Robert Steeples',
    staffPage: 'https://lsusports.net/sports/football/roster/coaches',
    espnId: 99, domain: 'lsu.edu',
    hcTwitter: 'CoachBrianKelly', hcInstagram: 'coachbriankelly',
    rcTwitter: 'CoachSteeples', rcInstagram: '',
    lastUpdated: '2026-04'
  },
  {
    school: 'University of Texas', nickname: 'Longhorns',
    division: 'FBS', conference: 'SEC', state: 'TX', city: 'Austin',
    headCoach: 'Steve Sarkisian', oc: 'Kyle Flood', dc: 'Pete Kwiatkowski',
    recruitingCoord: 'Jeff Banks',
    staffPage: 'https://texassports.com/sports/football/roster/coaches',
    espnId: 251, domain: 'utexas.edu',
    hcTwitter: 'CoachSark', hcInstagram: 'coachsark',
    rcTwitter: 'CoachJeffBanks', rcInstagram: '',
    lastUpdated: '2026-04'
  },
  {
    school: 'Texas A&M University', nickname: 'Aggies',
    division: 'FBS', conference: 'SEC', state: 'TX', city: 'College Station',
    headCoach: 'Mike Elko', oc: 'Collin Klein', dc: 'Jay Bateman',
    recruitingCoord: 'Terry Price',
    staffPage: 'https://12thman.com/sports/football/roster/coaches',
    espnId: 245, domain: 'tamu.edu',
    hcTwitter: 'CoachMikeElko', hcInstagram: '',
    rcTwitter: 'CoachTerryPrice', rcInstagram: '',
    lastUpdated: '2026-04'
  },
  {
    school: 'University of Mississippi', nickname: 'Rebels',
    division: 'FBS', conference: 'SEC', state: 'MS', city: 'Oxford',
    headCoach: 'Lane Kiffin', oc: 'Charlie Weis Jr.', dc: 'Pete Golding',
    recruitingCoord: 'Jamar Cain',
    staffPage: 'https://olemisssports.com/sports/football/roster/coaches',
    espnId: 145, domain: 'olemiss.edu',
    hcTwitter: 'Lane_Kiffin', hcInstagram: 'lanekiffin',
    rcTwitter: 'CoachJamarCain', rcInstagram: 'coachjamar',
    lastUpdated: '2026-04'
  },
  {
    school: 'Auburn University', nickname: 'Tigers',
    division: 'FBS', conference: 'SEC', state: 'AL', city: 'Auburn',
    headCoach: 'Hugh Freeze', oc: 'Philip Montgomery', dc: 'Ron Roberts',
    recruitingCoord: 'Carnell Williams',
    staffPage: 'https://auburntigers.com/sports/football/roster/coaches',
    espnId: 2, domain: 'auburn.edu',
    hcTwitter: 'HughFreeze10', hcInstagram: 'hughfreeze',
    rcTwitter: 'CarnellWilliams', rcInstagram: 'carnellwilliams',
    lastUpdated: '2026-04'
  },
  {
    school: 'University of South Carolina', nickname: 'Gamecocks',
    division: 'FBS', conference: 'SEC', state: 'SC', city: 'Columbia',
    headCoach: 'Shane Beamer', oc: 'Dowell Loggains', dc: 'Clayton White',
    recruitingCoord: 'Des Kitchings',
    staffPage: 'https://gamecocksonline.com/sports/football/roster/coaches',
    espnId: 2579, domain: 'sc.edu',
    hcTwitter: 'ShaneBeamer', hcInstagram: 'shanebeamer',
    rcTwitter: 'CoachDesK', rcInstagram: '',
    lastUpdated: '2026-04'
  },
  {
    school: 'Vanderbilt University', nickname: 'Commodores',
    division: 'FBS', conference: 'SEC', state: 'TN', city: 'Nashville',
    headCoach: 'Clark Lea', oc: 'Tim Beck', dc: 'Tevita Fifita',
    recruitingCoord: 'Bryan Ellis',
    staffPage: 'https://vucommodores.com/sports/football/roster/coaches',
    espnId: 238, domain: 'vanderbilt.edu',
    hcTwitter: 'CoachClarkLea', hcInstagram: '',
    rcTwitter: '', rcInstagram: '',
    lastUpdated: '2026-04'
  },
  {
    school: 'Mississippi State University', nickname: 'Bulldogs',
    division: 'FBS', conference: 'SEC', state: 'MS', city: 'Starkville',
    headCoach: 'Jeff Lebby', oc: 'Kevin Barbay', dc: 'Zach Arnett',
    recruitingCoord: 'Marcus Woodson',
    staffPage: 'https://hailstate.com/sports/football/roster/coaches',
    espnId: 344, domain: 'msstate.edu',
    hcTwitter: 'CoachLebby', hcInstagram: '',
    rcTwitter: '', rcInstagram: '',
    lastUpdated: '2026-04'
  },
  {
    school: 'University of Kentucky', nickname: 'Wildcats',
    division: 'FBS', conference: 'SEC', state: 'KY', city: 'Lexington',
    headCoach: 'Mark Stoops', oc: 'Bush Hamdan', dc: 'Brad White',
    recruitingCoord: 'Vince Marrow',
    staffPage: 'https://ukathletics.com/sports/football/roster/coaches',
    espnId: 96, domain: 'uky.edu',
    hcTwitter: 'UKCoachStoops', hcInstagram: '',
    rcTwitter: 'VinceMarrow', rcInstagram: 'vincemarrow',
    lastUpdated: '2026-04'
  },
  {
    school: 'University of Missouri', nickname: 'Tigers',
    division: 'FBS', conference: 'SEC', state: 'MO', city: 'Columbia',
    headCoach: 'Eli Drinkwitz', oc: 'Kirby Moore', dc: 'Vernon Hargreaves',
    recruitingCoord: 'Marcus Johnson',
    staffPage: 'https://mutigers.com/sports/football/roster/coaches',
    espnId: 142, domain: 'missouri.edu',
    hcTwitter: 'CoachDrinkwitz', hcInstagram: '',
    rcTwitter: '', rcInstagram: '',
    lastUpdated: '2026-04'
  },
  {
    school: 'University of Arkansas', nickname: 'Razorbacks',
    division: 'FBS', conference: 'SEC', state: 'AR', city: 'Fayetteville',
    headCoach: 'Sam Pittman', oc: 'Bobby Petrino', dc: 'Travis Williams',
    recruitingCoord: 'Marcus Woodson',
    staffPage: 'https://arkansasrazorbacks.com/sports/football/roster/coaches',
    espnId: 8, domain: 'uark.edu',
    hcTwitter: 'CoachSamPittman', hcInstagram: '',
    rcTwitter: '', rcInstagram: '',
    lastUpdated: '2026-04'
  },

  // ── FBS · ACC ─────────────────────────────
  {
    school: 'Clemson University', nickname: 'Tigers',
    division: 'FBS', conference: 'ACC', state: 'SC', city: 'Clemson',
    headCoach: 'Dabo Swinney', oc: 'Garrett Riley', dc: 'Wes Goodwin',
    recruitingCoord: 'Kyle Richardson',
    staffPage: 'https://clemsontigers.com/sports/football/roster/coaches',
    espnId: 228, domain: 'clemson.edu',
    hcTwitter: 'DaboSwinney', hcInstagram: 'daboswinney',
    rcTwitter: '', rcInstagram: '',
    lastUpdated: '2026-04'
  },
  {
    school: 'Florida State University', nickname: 'Seminoles',
    division: 'FBS', conference: 'ACC', state: 'FL', city: 'Tallahassee',
    headCoach: 'Mike Norvell', oc: 'Alex Atkins', dc: 'Patrick Toney',
    recruitingCoord: 'Jason Leach',
    staffPage: 'https://seminoles.com/sports/football/roster/coaches',
    espnId: 52, domain: 'fsu.edu',
    hcTwitter: 'Coach_Norvell', hcInstagram: 'coachnorvellfsu',
    rcTwitter: '', rcInstagram: '',
    lastUpdated: '2026-04'
  },
  {
    school: 'University of Miami', nickname: 'Hurricanes',
    division: 'FBS', conference: 'ACC', state: 'FL', city: 'Coral Gables',
    headCoach: 'Mario Cristobal', oc: 'Shannon Dawson', dc: 'Lance Leopold',
    recruitingCoord: 'Gino Guidugli',
    staffPage: 'https://hurricanesports.com/sports/football/roster/coaches',
    espnId: 2390, domain: 'miami.edu',
    hcTwitter: 'Coach_Cristobal', hcInstagram: '',
    rcTwitter: '', rcInstagram: '',
    lastUpdated: '2026-04'
  },
  {
    school: 'Georgia Tech', nickname: 'Yellow Jackets',
    division: 'FBS', conference: 'ACC', state: 'GA', city: 'Atlanta',
    headCoach: 'Brent Key', oc: 'Chris Weinke', dc: 'D.J. Crook',
    recruitingCoord: 'Lamar Owens',
    staffPage: 'https://ramblinwreck.com/sports/football/roster/coaches',
    espnId: 59, domain: 'gatech.edu',
    hcTwitter: 'CoachBrentKey', hcInstagram: '',
    rcTwitter: 'CoachLamarOwens', rcInstagram: '',
    lastUpdated: '2026-04'
  },
  {
    school: 'University of North Carolina', nickname: 'Tar Heels',
    division: 'FBS', conference: 'ACC', state: 'NC', city: 'Chapel Hill',
    headCoach: 'Bill Belichick', oc: 'TBD', dc: 'TBD',
    recruitingCoord: 'TBD',
    staffPage: 'https://goheels.com/sports/football/roster/coaches',
    espnId: 153, domain: 'unc.edu',
    hcTwitter: '', hcInstagram: '',
    rcTwitter: '', rcInstagram: '',
    lastUpdated: '2026-04'
  },
  {
    school: 'NC State University', nickname: 'Wolfpack',
    division: 'FBS', conference: 'ACC', state: 'NC', city: 'Raleigh',
    headCoach: 'Dave Doeren', oc: 'Robert Anae', dc: 'Tony Gibson',
    recruitingCoord: 'Tre Thompson',
    staffPage: 'https://gopack.com/sports/football/roster/coaches',
    espnId: 152, domain: 'ncsu.edu',
    hcTwitter: '', hcInstagram: '',
    rcTwitter: '', rcInstagram: '',
    lastUpdated: '2026-04'
  },

  // ── FBS · Big Ten ─────────────────────────
  {
    school: 'University of Michigan', nickname: 'Wolverines',
    division: 'FBS', conference: 'Big Ten', state: 'MI', city: 'Ann Arbor',
    headCoach: 'Sherrone Moore', oc: 'Kirk Campbell', dc: 'Wink Martindale',
    recruitingCoord: 'Steve Clinkscale',
    staffPage: 'https://mgoblue.com/sports/football/roster/coaches',
    espnId: 130, domain: 'umich.edu',
    hcTwitter: 'CoachSherrone', hcInstagram: '',
    rcTwitter: '', rcInstagram: '',
    lastUpdated: '2026-04'
  },
  {
    school: 'Ohio State University', nickname: 'Buckeyes',
    division: 'FBS', conference: 'Big Ten', state: 'OH', city: 'Columbus',
    headCoach: 'Ryan Day', oc: 'Chip Kelly', dc: 'Jim Knowles',
    recruitingCoord: 'Brian Hartline',
    staffPage: 'https://ohiostatebuckeyes.com/sports/football/roster/coaches',
    espnId: 194, domain: 'osu.edu',
    hcTwitter: 'ryandayfootball', hcInstagram: 'ryandayfootball',
    rcTwitter: 'brianhartline', rcInstagram: 'brianhartline',
    lastUpdated: '2026-04'
  },
  {
    school: 'Penn State University', nickname: 'Nittany Lions',
    division: 'FBS', conference: 'Big Ten', state: 'PA', city: 'State College',
    headCoach: 'James Franklin', oc: 'Andy Kotelnicki', dc: 'Tom Allen',
    recruitingCoord: 'Ja\'Juan Seider',
    staffPage: 'https://gopsusports.com/sports/football/roster/coaches',
    espnId: 213, domain: 'psu.edu',
    hcTwitter: 'coachjfranklin', hcInstagram: 'jamesfranklin22',
    rcTwitter: 'JaJuanSeider', rcInstagram: '',
    lastUpdated: '2026-04'
  },
  {
    school: 'USC', nickname: 'Trojans',
    division: 'FBS', conference: 'Big Ten', state: 'CA', city: 'Los Angeles',
    headCoach: 'Lincoln Riley', oc: 'Luke Huard', dc: 'D\'Anton Lynn',
    recruitingCoord: 'Donte Williams',
    staffPage: 'https://usctrojans.com/sports/football/roster/coaches',
    espnId: 30, domain: 'usc.edu',
    hcTwitter: 'LincolnRiley', hcInstagram: 'lincolnriley',
    rcTwitter: 'donte_williams3', rcInstagram: '',
    lastUpdated: '2026-04'
  },
  {
    school: 'UCLA', nickname: 'Bruins',
    division: 'FBS', conference: 'Big Ten', state: 'CA', city: 'Los Angeles',
    headCoach: 'DeShaun Foster', oc: 'Eric Bieniemy', dc: 'Jake Dickert',
    recruitingCoord: 'Brian Norwood',
    staffPage: 'https://uclabruins.com/sports/football/roster/coaches',
    espnId: 26, domain: 'ucla.edu',
    hcTwitter: 'CoachDeShaunF', hcInstagram: '',
    rcTwitter: '', rcInstagram: '',
    lastUpdated: '2026-04'
  },

  // ── FBS · Big 12 ──────────────────────────
  {
    school: 'University of Oklahoma', nickname: 'Sooners',
    division: 'FBS', conference: 'SEC', state: 'OK', city: 'Norman',
    headCoach: 'Brent Venables', oc: 'Seth Littrell', dc: 'Todd Bates',
    recruitingCoord: 'DeMarco Murray',
    staffPage: 'https://soonersports.com/sports/football/roster/coaches',
    espnId: 201, domain: 'ou.edu',
    hcTwitter: 'CoachVenables', hcInstagram: '',
    rcTwitter: '', rcInstagram: '',
    lastUpdated: '2026-04'
  },
  {
    school: 'TCU', nickname: 'Horned Frogs',
    division: 'FBS', conference: 'Big 12', state: 'TX', city: 'Fort Worth',
    headCoach: 'Sonny Dykes', oc: 'Kendal Briles', dc: 'Dennis Simmons',
    recruitingCoord: 'Tre Richardson',
    staffPage: 'https://gofrogs.com/sports/football/roster/coaches',
    espnId: 2628, domain: 'tcu.edu',
    hcTwitter: 'SonnyDykes', hcInstagram: '',
    rcTwitter: '', rcInstagram: '',
    lastUpdated: '2026-04'
  },
  {
    school: 'Baylor University', nickname: 'Bears',
    division: 'FBS', conference: 'Big 12', state: 'TX', city: 'Waco',
    headCoach: 'Dave Aranda', oc: 'Jake Spavital', dc: 'Ron Roberts',
    recruitingCoord: 'Terrel Bernard',
    staffPage: 'https://baylorbears.com/sports/football/roster/coaches',
    espnId: 239, domain: 'baylor.edu',
    hcTwitter: 'CoachDaveAranda', hcInstagram: '',
    rcTwitter: '', rcInstagram: '',
    lastUpdated: '2026-04'
  },
  {
    school: 'University of Houston', nickname: 'Cougars',
    division: 'FBS', conference: 'Big 12', state: 'TX', city: 'Houston',
    headCoach: 'Willie Fritz', oc: 'TBD', dc: 'Doug Belk',
    recruitingCoord: 'TBD',
    staffPage: 'https://uhcougars.com/sports/football/roster/coaches',
    espnId: 248, domain: 'uh.edu',
    hcTwitter: '', hcInstagram: '',
    rcTwitter: '', rcInstagram: '',
    lastUpdated: '2026-04'
  },

  // ── FCS ───────────────────────────────────
  {
    school: 'Georgia Southern University', nickname: 'Eagles',
    division: 'FCS', conference: 'Sun Belt', state: 'GA', city: 'Statesboro',
    headCoach: 'Clay Helton', oc: 'Bryan Ellis', dc: 'Scot Sloan',
    recruitingCoord: 'Marcus Satterfield',
    staffPage: 'https://gseagles.com/sports/football/roster/coaches',
    espnId: 290, domain: 'georgiasouthern.edu',
    hcTwitter: '', hcInstagram: '',
    rcTwitter: '', rcInstagram: '',
    lastUpdated: '2026-04'
  },
  {
    school: 'Kennesaw State University', nickname: 'Owls',
    division: 'FCS', conference: 'ASUN', state: 'GA', city: 'Kennesaw',
    headCoach: 'Brian Bohannon', oc: 'Taylor Lamb', dc: 'Erin Henderson',
    recruitingCoord: 'Carlos White',
    staffPage: 'https://ksuowls.com/sports/football/roster/coaches',
    espnId: 2391, domain: 'kennesaw.edu',
    hcTwitter: '', hcInstagram: '',
    rcTwitter: '', rcInstagram: '',
    lastUpdated: '2026-04'
  },
  {
    school: 'Jackson State University', nickname: 'Tigers',
    division: 'FCS', conference: 'SWAC', state: 'MS', city: 'Jackson',
    headCoach: 'TC Taylor', oc: 'TBD', dc: 'TBD',
    recruitingCoord: 'TBD',
    staffPage: 'https://jsusports.com/sports/football/roster/coaches',
    espnId: 2344, domain: 'jsums.edu',
    hcTwitter: '', hcInstagram: '',
    rcTwitter: '', rcInstagram: '',
    lastUpdated: '2026-04'
  },
  {
    school: 'North Dakota State University', nickname: 'Bison',
    division: 'FCS', conference: 'Missouri Valley', state: 'ND', city: 'Fargo',
    headCoach: 'Matt Entz', oc: 'Tim Polasek', dc: 'Randy Hedberg',
    recruitingCoord: 'Andrew Herbst',
    staffPage: 'https://gobison.com/sports/football/roster/coaches',
    espnId: 2449, domain: 'ndsu.edu',
    hcTwitter: '', hcInstagram: '',
    rcTwitter: '', rcInstagram: '',
    lastUpdated: '2026-04'
  },
  {
    school: 'South Dakota State University', nickname: 'Jackrabbits',
    division: 'FCS', conference: 'Missouri Valley', state: 'SD', city: 'Brookings',
    headCoach: 'Jimmy Rogers', oc: 'Zach Lujan', dc: 'Paul Troth',
    recruitingCoord: 'Dan Kroger',
    staffPage: 'https://gojacks.com/sports/football/roster/coaches',
    espnId: 2571, domain: 'sdstate.edu',
    hcTwitter: '', hcInstagram: '',
    rcTwitter: '', rcInstagram: '',
    lastUpdated: '2026-04'
  },
  {
    school: 'University of Montana', nickname: 'Grizzlies',
    division: 'FCS', conference: 'Big Sky', state: 'MT', city: 'Missoula',
    headCoach: 'Bobby Hauck', oc: 'Timm Rosenbach', dc: 'Kent Baer',
    recruitingCoord: 'Joe Hauck',
    staffPage: 'https://gogriz.com/sports/football/roster/coaches',
    espnId: 149, domain: 'umt.edu',
    hcTwitter: '', hcInstagram: '',
    rcTwitter: '', rcInstagram: '',
    lastUpdated: '2026-04'
  },
  {
    school: 'Villanova University', nickname: 'Wildcats',
    division: 'FCS', conference: 'CAA', state: 'PA', city: 'Villanova',
    headCoach: 'Mark Ferrante', oc: 'TBD', dc: 'TBD',
    recruitingCoord: 'TBD',
    staffPage: 'https://villanova.com/sports/football/roster/coaches',
    espnId: 222, domain: 'villanova.edu',
    hcTwitter: '', hcInstagram: '',
    rcTwitter: '', rcInstagram: '',
    lastUpdated: '2026-04'
  },
  {
    school: 'James Madison University', nickname: 'Dukes',
    division: 'FBS', conference: 'Sun Belt', state: 'VA', city: 'Harrisonburg',
    headCoach: 'Bob Chesney', oc: 'TBD', dc: 'TBD',
    recruitingCoord: 'TBD',
    staffPage: 'https://jmusports.com/sports/football/roster/coaches',
    espnId: 256, domain: 'jmu.edu',
    hcTwitter: '', hcInstagram: '',
    rcTwitter: '', rcInstagram: '',
    lastUpdated: '2026-04'
  },
  {
    school: 'Bethune-Cookman University', nickname: 'Wildcats',
    division: 'FCS', conference: 'SWAC', state: 'FL', city: 'Daytona Beach',
    headCoach: 'Terry Sims', oc: 'TBD', dc: 'TBD',
    recruitingCoord: 'TBD',
    staffPage: 'https://bcu.edu/athletics/football',
    espnId: 2065, domain: 'cookman.edu',
    hcTwitter: '', hcInstagram: '',
    rcTwitter: '', rcInstagram: '',
    lastUpdated: '2026-04'
  },
  {
    school: 'Florida A&M University', nickname: 'Rattlers',
    division: 'FCS', conference: 'SWAC', state: 'FL', city: 'Tallahassee',
    headCoach: 'James Colzie III', oc: 'TBD', dc: 'TBD',
    recruitingCoord: 'TBD',
    staffPage: 'https://famuathletics.com/sports/football',
    espnId: 50, domain: 'famu.edu',
    hcTwitter: '', hcInstagram: '',
    rcTwitter: '', rcInstagram: '',
    lastUpdated: '2026-04'
  },

  // ── Division II ───────────────────────────
  {
    school: 'Valdosta State University', nickname: 'Blazers',
    division: 'D2', conference: 'Gulf South', state: 'GA', city: 'Valdosta',
    headCoach: 'Gary Goff', oc: 'TBD', dc: 'TBD',
    recruitingCoord: 'TBD',
    staffPage: 'https://valdostastateblazers.com/sports/football',
    espnId: 2674, domain: 'valdosta.edu',
    hcTwitter: '', hcInstagram: '',
    rcTwitter: '', rcInstagram: '',
    lastUpdated: '2026-04'
  },
  {
    school: 'Delta State University', nickname: 'Statesmen',
    division: 'D2', conference: 'Gulf South', state: 'MS', city: 'Cleveland',
    headCoach: 'Todd Cooley', oc: 'TBD', dc: 'TBD',
    recruitingCoord: 'TBD',
    staffPage: 'https://deltastateathletics.com/sports/football',
    espnId: 0, domain: 'deltastate.edu',
    hcTwitter: '', hcInstagram: '',
    rcTwitter: '', rcInstagram: '',
    lastUpdated: '2026-04'
  },
  {
    school: 'Ferris State University', nickname: 'Bulldogs',
    division: 'D2', conference: 'GLIAC', state: 'MI', city: 'Big Rapids',
    headCoach: 'Tony Annese', oc: 'TBD', dc: 'TBD',
    recruitingCoord: 'TBD',
    staffPage: 'https://ferrisstatebulldogs.com/sports/football',
    espnId: 2209, domain: 'ferris.edu',
    hcTwitter: '', hcInstagram: '',
    rcTwitter: '', rcInstagram: '',
    lastUpdated: '2026-04'
  },
  {
    school: 'West Florida University', nickname: 'Argonauts',
    division: 'D2', conference: 'Gulf South', state: 'FL', city: 'Pensacola',
    headCoach: 'Kaleb Nobles', oc: 'TBD', dc: 'TBD',
    recruitingCoord: 'TBD',
    staffPage: 'https://uwfargos.com/sports/football',
    espnId: 0, domain: 'uwf.edu',
    hcTwitter: '', hcInstagram: '',
    rcTwitter: '', rcInstagram: '',
    lastUpdated: '2026-04'
  },
  {
    school: 'Colorado School of Mines', nickname: 'Orediggers',
    division: 'D2', conference: 'RMAC', state: 'CO', city: 'Golden',
    headCoach: 'Brandon Moore', oc: 'TBD', dc: 'TBD',
    recruitingCoord: 'TBD',
    staffPage: 'https://minesathletics.com/sports/football',
    espnId: 0, domain: 'mines.edu',
    hcTwitter: '', hcInstagram: '',
    rcTwitter: '', rcInstagram: '',
    lastUpdated: '2026-04'
  },
  {
    school: 'Tarleton State University', nickname: 'Texans',
    division: 'D2', conference: 'Lone Star', state: 'TX', city: 'Stephenville',
    headCoach: 'Todd Whitten', oc: 'TBD', dc: 'TBD',
    recruitingCoord: 'TBD',
    staffPage: 'https://tarletonsports.com/sports/football',
    espnId: 2653, domain: 'tarleton.edu',
    hcTwitter: '', hcInstagram: '',
    rcTwitter: '', rcInstagram: '',
    lastUpdated: '2026-04'
  },
  {
    school: 'Angelo State University', nickname: 'Rams',
    division: 'D2', conference: 'Lone Star', state: 'TX', city: 'San Angelo',
    headCoach: 'Jeff Girsch', oc: 'TBD', dc: 'TBD',
    recruitingCoord: 'TBD',
    staffPage: 'https://angelosports.com/sports/football',
    espnId: 0, domain: 'angelo.edu',
    hcTwitter: '', hcInstagram: '',
    rcTwitter: '', rcInstagram: '',
    lastUpdated: '2026-04'
  },
  {
    school: 'Pittsburg State University', nickname: 'Gorillas',
    division: 'D2', conference: 'MIAA', state: 'KS', city: 'Pittsburg',
    headCoach: 'Tim Beck', oc: 'TBD', dc: 'TBD',
    recruitingCoord: 'TBD',
    staffPage: 'https://pittgorillas.com/sports/football',
    espnId: 0, domain: 'pittstate.edu',
    hcTwitter: '', hcInstagram: '',
    rcTwitter: '', rcInstagram: '',
    lastUpdated: '2026-04'
  },

  // ── Division III ──────────────────────────
  {
    school: 'North Central College', nickname: 'Cardinals',
    division: 'D3', conference: 'CCIW', state: 'IL', city: 'Naperville',
    headCoach: 'Jeff Thorne', oc: 'TBD', dc: 'TBD',
    recruitingCoord: 'TBD',
    staffPage: 'https://athletics.northcentralcollege.edu/sports/football',
    espnId: 0, domain: 'northcentralcollege.edu',
    hcTwitter: '', hcInstagram: '',
    rcTwitter: '', rcInstagram: '',
    lastUpdated: '2026-04'
  },
  {
    school: 'Mary Hardin-Baylor University', nickname: 'Crusaders',
    division: 'D3', conference: 'ASC', state: 'TX', city: 'Belton',
    headCoach: 'Pete Fredenburg', oc: 'TBD', dc: 'TBD',
    recruitingCoord: 'TBD',
    staffPage: 'https://crusaders.umhb.edu/sports/football',
    espnId: 0, domain: 'umhb.edu',
    hcTwitter: '', hcInstagram: '',
    rcTwitter: '', rcInstagram: '',
    lastUpdated: '2026-04'
  },
  {
    school: 'Wartburg College', nickname: 'Knights',
    division: 'D3', conference: 'ARC', state: 'IA', city: 'Waverly',
    headCoach: 'Mike Krzyzanowski', oc: 'TBD', dc: 'TBD',
    recruitingCoord: 'TBD',
    staffPage: 'https://athletics.wartburg.edu/sports/football',
    espnId: 0, domain: 'wartburg.edu',
    hcTwitter: '', hcInstagram: '',
    rcTwitter: '', rcInstagram: '',
    lastUpdated: '2026-04'
  },
  {
    school: 'Wheaton College', nickname: 'Thunder',
    division: 'D3', conference: 'CCIW', state: 'IL', city: 'Wheaton',
    headCoach: 'Mike Swider', oc: 'TBD', dc: 'TBD',
    recruitingCoord: 'TBD',
    staffPage: 'https://athletics.wheaton.edu/sports/football',
    espnId: 0, domain: 'wheaton.edu',
    hcTwitter: '', hcInstagram: '',
    rcTwitter: '', rcInstagram: '',
    lastUpdated: '2026-04'
  },
  {
    school: 'Hardin-Simmons University', nickname: 'Cowboys',
    division: 'D3', conference: 'ASC', state: 'TX', city: 'Abilene',
    headCoach: 'Jesse Burleson', oc: 'TBD', dc: 'TBD',
    recruitingCoord: 'TBD',
    staffPage: 'https://hsucowboys.com/sports/football',
    espnId: 0, domain: 'hsutx.edu',
    hcTwitter: '', hcInstagram: '',
    rcTwitter: '', rcInstagram: '',
    lastUpdated: '2026-04'
  },

  // ── JUCO ──────────────────────────────────
  {
    school: 'Georgia Military College', nickname: 'Bulldogs',
    division: 'JUCO', conference: 'GCAA', state: 'GA', city: 'Milledgeville',
    headCoach: 'Pete Taylor', oc: 'TBD', dc: 'TBD',
    recruitingCoord: 'TBD',
    staffPage: 'https://gmcbulldogs.com/sports/football',
    espnId: 0, domain: 'gmc.cc.ga.us',
    hcTwitter: '', hcInstagram: '',
    rcTwitter: '', rcInstagram: '',
    lastUpdated: '2026-04'
  },
  {
    school: 'Blinn College', nickname: 'Buccaneers',
    division: 'JUCO', conference: 'SWJCFC', state: 'TX', city: 'Brenham',
    headCoach: 'Scott Syma', oc: 'TBD', dc: 'TBD',
    recruitingCoord: 'TBD',
    staffPage: 'https://blinnbuccaneers.com/sports/football',
    espnId: 0, domain: 'blinn.edu',
    hcTwitter: '', hcInstagram: '',
    rcTwitter: '', rcInstagram: '',
    lastUpdated: '2026-04'
  },
  {
    school: 'East Mississippi Community College', nickname: 'Lions',
    division: 'JUCO', conference: 'MACJC', state: 'MS', city: 'Scooba',
    headCoach: 'Buddy Stephens', oc: 'TBD', dc: 'TBD',
    recruitingCoord: 'TBD',
    staffPage: 'https://emcclions.com/sports/football',
    espnId: 0, domain: 'eastms.edu',
    hcTwitter: 'CoachBuddyS', hcInstagram: '',
    rcTwitter: '', rcInstagram: '',
    lastUpdated: '2026-04'
  },
  {
    school: 'Iowa Western Community College', nickname: 'Reivers',
    division: 'JUCO', conference: 'ICCAC', state: 'IA', city: 'Council Bluffs',
    headCoach: 'Scott Strohmeier', oc: 'TBD', dc: 'TBD',
    recruitingCoord: 'TBD',
    staffPage: 'https://iwccreivers.com/sports/football',
    espnId: 0, domain: 'iwcc.edu',
    hcTwitter: '', hcInstagram: '',
    rcTwitter: '', rcInstagram: '',
    lastUpdated: '2026-04'
  },
  {
    school: 'Itawamba Community College', nickname: 'Indians',
    division: 'JUCO', conference: 'MACJC', state: 'MS', city: 'Fulton',
    headCoach: 'Chris Chamberlin', oc: 'TBD', dc: 'TBD',
    recruitingCoord: 'TBD',
    staffPage: 'https://iccathletics.com/sports/football',
    espnId: 0, domain: 'iccms.edu',
    hcTwitter: '', hcInstagram: '',
    rcTwitter: '', rcInstagram: '',
    lastUpdated: '2026-04'
  },
  {
    school: 'Northwest Mississippi Community College', nickname: 'Rangers',
    division: 'JUCO', conference: 'MACJC', state: 'MS', city: 'Senatobia',
    headCoach: 'Benjy Landrum', oc: 'TBD', dc: 'TBD',
    recruitingCoord: 'TBD',
    staffPage: 'https://northwestms.edu/athletics/football',
    espnId: 0, domain: 'northwestms.edu',
    hcTwitter: '', hcInstagram: '',
    rcTwitter: '', rcInstagram: '',
    lastUpdated: '2026-04'
  },
  {
    school: 'Coffeyville Community College', nickname: 'Ravens',
    division: 'JUCO', conference: 'KJCCC', state: 'KS', city: 'Coffeyville',
    headCoach: 'Jason Brown', oc: 'TBD', dc: 'TBD',
    recruitingCoord: 'TBD',
    staffPage: 'https://coffeyvilleravens.com/sports/football',
    espnId: 0, domain: 'coffeyville.edu',
    hcTwitter: '', hcInstagram: '',
    rcTwitter: '', rcInstagram: '',
    lastUpdated: '2026-04'
  },
  {
    school: 'Garden City Community College', nickname: 'Broncbusters',
    division: 'JUCO', conference: 'KJCCC', state: 'KS', city: 'Garden City',
    headCoach: 'Jeff Sims', oc: 'TBD', dc: 'TBD',
    recruitingCoord: 'TBD',
    staffPage: 'https://gcccbroncbusters.com/sports/football',
    espnId: 0, domain: 'gcccks.edu',
    hcTwitter: '', hcInstagram: '',
    rcTwitter: '', rcInstagram: '',
    lastUpdated: '2026-04'
  },
  {
    school: 'Snow College', nickname: 'Badgers',
    division: 'JUCO', conference: 'SWAC', state: 'UT', city: 'Ephraim',
    headCoach: 'Paul Peterson', oc: 'TBD', dc: 'TBD',
    recruitingCoord: 'TBD',
    staffPage: 'https://snowbadgers.com/sports/football',
    espnId: 0, domain: 'snow.edu',
    hcTwitter: '', hcInstagram: '',
    rcTwitter: '', rcInstagram: '',
    lastUpdated: '2026-04'
  },

];
