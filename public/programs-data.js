// ============================================
// Camp 8 — Powerhouse Central Programs Data
// States: GA, FL, TX, CA
// titles = state championships won
// ============================================

const PROGRAMS = [

  // ============================================
  // GEORGIA
  // ============================================
  { school:"Colquitt County", city:"Moultrie", state:"GA", classification:"AAAAAAA", titles:8, lat:31.1799, lng:-83.7891, years:"2012,2013,2014,2015,2016,2019,2021,2022" },
  { school:"Lowndes HS", city:"Valdosta", state:"GA", classification:"AAAAAAA", titles:6, lat:30.8327, lng:-83.2785, years:"2006,2007,2008,2010,2011,2018" },
  { school:"Buford HS", city:"Buford", state:"GA", classification:"AAAAA", titles:11, lat:34.1207, lng:-84.0043, years:"2002,2009,2010,2011,2012,2013,2014,2015,2018,2019,2022" },
  { school:"Valdosta HS", city:"Valdosta", state:"GA", classification:"AAAAAAA", titles:23, lat:30.8503, lng:-83.2785, years:"Historic — 23 state titles across decades" },
  { school:"Gainesville HS", city:"Gainesville", state:"GA", classification:"AAAAA", titles:5, lat:34.2979, lng:-83.8241, years:"2007,2008,2015,2016,2021" },
  { school:"Grayson HS", city:"Loganville", state:"GA", classification:"AAAAAAA", titles:4, lat:33.8387, lng:-83.9007, years:"2016,2017,2020,2023" },
  { school:"Langston Hughes HS", city:"Fairburn", state:"GA", classification:"AAAAAAA", titles:3, lat:33.5671, lng:-84.5808, years:"2019,2022,2023" },
  { school:"Collins Hill HS", city:"Suwanee", state:"GA", classification:"AAAAAAA", titles:2, lat:34.0515, lng:-84.0713, years:"2021,2022" },
  { school:"Carrollton HS", city:"Carrollton", state:"GA", classification:"AAAAAA", titles:5, lat:33.5801, lng:-85.0766, years:"2014,2015,2019,2022,2023" },
  { school:"Blessed Trinity", city:"Roswell", state:"GA", classification:"AAAAA", titles:5, lat:34.0232, lng:-84.3616, years:"2012,2013,2014,2017,2018" },
  { school:"Mill Creek HS", city:"Hoschton", state:"GA", classification:"AAAAAAA", titles:2, lat:34.0965, lng:-83.7613, years:"2018,2019" },
  { school:"Camden County HS", city:"Kingsland", state:"GA", classification:"AAAAAAA", titles:3, lat:30.7999, lng:-81.6893, years:"2002,2003,2015" },
  { school:"North Cobb HS", city:"Kennesaw", state:"GA", classification:"AAAAAAA", titles:1, lat:34.0234, lng:-84.6155, years:"2020" },
  { school:"Benedictine Military", city:"Savannah", state:"GA", classification:"AAAA", titles:6, lat:32.0809, lng:-81.0912, years:"2005,2006,2007,2008,2015,2019" },
  { school:"Lee County HS", city:"Leesburg", state:"GA", classification:"AAAAAA", titles:3, lat:31.7322, lng:-84.1708, years:"2018,2019,2020" },
  { school:"Westlake HS", city:"Atlanta", state:"GA", classification:"AAAAAAA", titles:2, lat:33.6634, lng:-84.4776, years:"2016,2017" },
  { school:"Peach County HS", city:"Fort Valley", state:"GA", classification:"AAA", titles:8, lat:32.5535, lng:-83.8877, years:"2013,2014,2015,2016,2017,2018,2019,2020" },
  { school:"Fitzgerald HS", city:"Fitzgerald", state:"GA", classification:"AA", titles:5, lat:31.7149, lng:-83.2524, years:"2012,2013,2014,2016,2019" },
  { school:"Brooks County HS", city:"Quitman", state:"GA", classification:"A", titles:4, lat:30.7854, lng:-83.5607, years:"2010,2011,2012,2013" },

  // ============================================
  // FLORIDA
  // ============================================
  { school:"St. Thomas Aquinas HS", city:"Fort Lauderdale", state:"FL", classification:"7A", titles:9, lat:26.0585, lng:-80.1736, years:"2005,2007,2008,2009,2010,2012,2014,2016,2018" },
  { school:"American Heritage HS", city:"Plantation", state:"FL", classification:"5A", titles:7, lat:26.1267, lng:-80.2533, years:"2009,2011,2012,2017,2018,2020,2022" },
  { school:"IMG Academy", city:"Bradenton", state:"FL", classification:"Independent", titles:0, lat:27.4989, lng:-82.5748, years:"National powerhouse, no state title eligibility" },
  { school:"Venice HS", city:"Venice", state:"FL", classification:"6A", titles:3, lat:27.0998, lng:-82.4543, years:"2020,2021,2023" },
  { school:"Chaminade-Madonna", city:"Hollywood", state:"FL", classification:"3A", titles:6, lat:26.0112, lng:-80.1495, years:"2014,2017,2018,2019,2021,2022" },
  { school:"Apopka HS", city:"Apopka", state:"FL", classification:"8A", titles:3, lat:28.6753, lng:-81.5323, years:"2006,2013,2019" },
  { school:"Miami Northwestern HS", city:"Miami", state:"FL", classification:"5A", titles:5, lat:25.8403, lng:-80.2256, years:"2004,2005,2006,2007,2015" },
  { school:"Palm Beach Lakes HS", city:"West Palm Beach", state:"FL", classification:"6A", titles:2, lat:26.7153, lng:-80.0534, years:"2007,2018" },
  { school:"Booker T. Washington HS", city:"Miami", state:"FL", classification:"4A", titles:4, lat:25.7959, lng:-80.2136, years:"2011,2012,2014,2015" },
  { school:"Cardinal Gibbons HS", city:"Fort Lauderdale", state:"FL", classification:"4A", titles:3, lat:26.1224, lng:-80.1373, years:"2013,2021,2022" },
  { school:"Cocoa HS", city:"Cocoa", state:"FL", classification:"4A", titles:8, lat:28.3861, lng:-80.7420, years:"2006,2007,2008,2010,2012,2013,2016,2019" },
  { school:"Lakeland HS", city:"Lakeland", state:"FL", classification:"5A", titles:4, lat:28.0395, lng:-81.9498, years:"2013,2014,2018,2020" },
  { school:"Buchholz HS", city:"Gainesville", state:"FL", classification:"5A", titles:3, lat:29.6516, lng:-82.3248, years:"2014,2017,2018" },
  { school:"Deerfield Beach HS", city:"Deerfield Beach", state:"FL", classification:"6A", titles:2, lat:26.3184, lng:-80.0998, years:"2015,2017" },
  { school:"Carol City HS", city:"Miami Gardens", state:"FL", classification:"5A", titles:3, lat:25.9421, lng:-80.2461, years:"2001,2002,2003" },

  // ============================================
  // TEXAS
  // ============================================
  { school:"Allen HS", city:"Allen", state:"TX", classification:"6A-D1", titles:3, lat:33.1031, lng:-96.6701, years:"2008,2012,2018" },
  { school:"Southlake Carroll HS", city:"Southlake", state:"TX", classification:"6A-D1", titles:5, lat:32.9545, lng:-97.1344, years:"1992,2002,2004,2005,2006" },
  { school:"Duncanville HS", city:"Duncanville", state:"TX", classification:"6A-D1", titles:3, lat:32.6476, lng:-96.9086, years:"2019,2021,2022" },
  { school:"North Shore HS", city:"Houston", state:"TX", classification:"6A-D1", titles:3, lat:29.8174, lng:-95.1540, years:"2018,2019,2023" },
  { school:"Aledo HS", city:"Aledo", state:"TX", classification:"5A-D2", titles:9, lat:32.6965, lng:-97.6058, years:"2010,2011,2012,2013,2015,2016,2017,2018,2019" },
  { school:"Katy HS", city:"Katy", state:"TX", classification:"6A-D1", titles:8, lat:29.7858, lng:-95.8245, years:"1997,2000,2003,2007,2008,2012,2015,2019" },
  { school:"Carthage HS", city:"Carthage", state:"TX", classification:"4A-D1", titles:8, lat:32.1557, lng:-94.3394, years:"2003,2004,2005,2007,2009,2014,2016,2019" },
  { school:"Denton Ryan HS", city:"Denton", state:"TX", classification:"5A-D1", titles:5, lat:33.2148, lng:-97.1331, years:"2001,2010,2011,2018,2020" },
  { school:"Celina HS", city:"Celina", state:"TX", classification:"4A-D1", titles:6, lat:33.3237, lng:-96.7827, years:"2012,2013,2014,2015,2016,2017" },
  { school:"Cedar Hill HS", city:"Cedar Hill", state:"TX", classification:"6A-D1", titles:2, lat:32.5885, lng:-96.9561, years:"2006,2014" },
  { school:"DeSoto HS", city:"DeSoto", state:"TX", classification:"6A-D1", titles:2, lat:32.5896, lng:-96.8572, years:"2016,2020" },
  { school:"West Orange-Stark HS", city:"Orange", state:"TX", classification:"4A-D1", titles:5, lat:30.0938, lng:-93.7365, years:"2006,2007,2009,2012,2018" },
  { school:"Fort Bend Marshall HS", city:"Missouri City", state:"TX", classification:"5A-D1", titles:3, lat:29.5593, lng:-95.5379, years:"2018,2019,2021" },
  { school:"Longview HS", city:"Longview", state:"TX", classification:"5A-D1", titles:4, lat:32.5007, lng:-94.7405, years:"1987,2003,2004,2010" },
  { school:"Permian HS", city:"Odessa", state:"TX", classification:"6A-D1", titles:6, lat:31.8457, lng:-102.3677, years:"1965,1972,1980,1984,1989,2002" },
  { school:"La Marque HS", city:"La Marque", state:"TX", classification:"4A", titles:5, lat:29.3638, lng:-94.9724, years:"1963,1965,1966,1967,1986" },
  { school:"Conroe HS", city:"Conroe", state:"TX", classification:"6A-D1", titles:1, lat:30.3119, lng:-95.4560, years:"2022" },

  // ============================================
  // CALIFORNIA
  // ============================================
  { school:"Mater Dei HS", city:"Santa Ana", state:"CA", classification:"Open Division", titles:10, lat:33.7455, lng:-117.8677, years:"2001,2003,2007,2012,2014,2016,2017,2018,2019,2022" },
  { school:"St. John Bosco HS", city:"Bellflower", state:"CA", classification:"Open Division", titles:5, lat:33.8817, lng:-118.1170, years:"2013,2015,2020,2021,2023" },
  { school:"De La Salle HS", city:"Concord", state:"CA", classification:"Open Division", titles:7, lat:37.9779, lng:-122.0311, years:"1994,1995,1996,1997,1998,1999,2000" },
  { school:"Folsom HS", city:"Folsom", state:"CA", classification:"Open Division", titles:5, lat:38.6780, lng:-121.1760, years:"2014,2016,2018,2021,2023" },
  { school:"Serra HS (Gardena)", city:"Gardena", state:"CA", classification:"Division 1", titles:4, lat:33.8869, lng:-118.2973, years:"2008,2010,2011,2013" },
  { school:"Long Beach Poly HS", city:"Long Beach", state:"CA", classification:"Division 1", titles:5, lat:33.7835, lng:-118.1537, years:"1993,1994,1997,2001,2002" },
  { school:"Oaks Christian HS", city:"Westlake Village", state:"CA", classification:"Division 2", titles:4, lat:34.1414, lng:-118.8370, years:"2008,2009,2014,2016" },
  { school:"Mission Viejo HS", city:"Mission Viejo", state:"CA", classification:"Division 2", titles:3, lat:33.6000, lng:-117.6720, years:"2006,2013,2015" },
  { school:"Valley Christian HS", city:"San Jose", state:"CA", classification:"Division 1", titles:3, lat:37.2563, lng:-121.9194, years:"2012,2013,2019" },
  { school:"Alemany HS", city:"Mission Hills", state:"CA", classification:"Division 2", titles:4, lat:34.2713, lng:-118.4714, years:"2003,2004,2005,2017" },
  { school:"Narbonne HS", city:"Harbor City", state:"CA", classification:"Division 2", titles:3, lat:33.7989, lng:-118.2981, years:"2015,2016,2017" },
  { school:"Liberty HS", city:"Brentwood", state:"CA", classification:"Division 1", titles:3, lat:37.9320, lng:-121.6957, years:"2008,2017,2018" },
  { school:"Centennial HS", city:"Corona", state:"CA", classification:"Division 1", titles:3, lat:33.8753, lng:-117.5664, years:"2012,2015,2022" },
  { school:"Bishop Amat HS", city:"La Puente", state:"CA", classification:"Division 3", titles:5, lat:34.0483, lng:-117.9497, years:"1994,1995,2000,2007,2009" },
];
