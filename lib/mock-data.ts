import { Organization, User, Asset, Envelope, Payload, Delegation, Subscription, PublishingRight, AccessGrant } from '@/types'

export const mockOrganizations: Organization[] = [
  // === PLATFORM ADMIN ===
  { id: 1, name: 'Waypoint Platform', role: 'Platform Admin', type: 'Platform Operator', status: 'Verified' },
  
  // === DELEGATES (Fund Administrators with Publishing Rights) ===
  { id: 1001, name: 'Genii Admin Services', role: 'Delegate', type: 'Fund Administrator', status: 'Verified' },
  { id: 1002, name: 'Aduro Advisors', role: 'Delegate', type: 'Fund Administrator', status: 'Verified' },
  { id: 1003, name: 'Carta (Fund Admin)', role: 'Delegate', type: 'Fund Administrator', status: 'Verified' },
  { id: 1004, name: 'SS&C Technologies', role: 'Delegate', type: 'Fund Administrator', status: 'Verified' },
  { id: 1005, name: 'Citco Group', role: 'Delegate', type: 'Fund Administrator', status: 'Verified' },
  { id: 1006, name: 'Apex Group', role: 'Delegate', type: 'Fund Administrator', status: 'Verified' },
  { id: 1007, name: 'State Street Fund Services', role: 'Delegate', type: 'Fund Administrator', status: 'Verified' },
  { id: 1008, name: 'Northern Trust', role: 'Delegate', type: 'Fund Administrator', status: 'Verified' },
  { id: 1009, name: 'SEI Investments', role: 'Delegate', type: 'Fund Administrator', status: 'Verified' },
  { id: 1010, name: 'BNY Mellon Fund Services', role: 'Delegate', type: 'Fund Administrator', status: 'Verified' },
  { id: 1011, name: 'U.S. Bank Fund Services', role: 'Delegate', type: 'Fund Administrator', status: 'Verified' },
  { id: 1012, name: 'JTC Group', role: 'Delegate', type: 'Fund Administrator', status: 'Verified' },
  
  // === ASSET MANAGERS (General Partners) ===
  { id: 2001, name: 'Kleiner Perkins', role: 'Asset Manager', type: 'General Partner (GP)', status: 'Verified' },
  { id: 2002, name: 'Sequoia Capital', role: 'Asset Manager', type: 'General Partner (GP)', status: 'Verified' },
  { id: 2003, name: 'Andreessen Horowitz', role: 'Asset Manager', type: 'General Partner (GP)', status: 'Verified' },
  { id: 2004, name: 'Benchmark', role: 'Asset Manager', type: 'General Partner (GP)', status: 'Verified' },
  { id: 2005, name: 'Insight Partners', role: 'Asset Manager', type: 'General Partner (GP)', status: 'Verified' },
  { id: 2006, name: 'Thoma Bravo', role: 'Asset Manager', type: 'General Partner (GP)', status: 'Verified' },
  { id: 2007, name: 'Vista Equity Partners', role: 'Asset Manager', type: 'General Partner (GP)', status: 'Verified' },
  { id: 2008, name: 'Blackstone', role: 'Asset Manager', type: 'General Partner (GP)', status: 'Verified' },
  { id: 2009, name: 'KKR & Co.', role: 'Asset Manager', type: 'General Partner (GP)', status: 'Verified' },
  { id: 2010, name: 'Apollo Global Management', role: 'Asset Manager', type: 'General Partner (GP)', status: 'Verified' },
  { id: 2011, name: 'The Carlyle Group', role: 'Asset Manager', type: 'General Partner (GP)', status: 'Verified' },
  { id: 2012, name: 'Ares Management', role: 'Asset Manager', type: 'General Partner (GP)', status: 'Verified' },
  { id: 2013, name: 'TPG Capital', role: 'Asset Manager', type: 'General Partner (GP)', status: 'Verified' },
  { id: 2014, name: 'Bain Capital', role: 'Asset Manager', type: 'General Partner (GP)', status: 'Verified' },
  { id: 2015, name: 'Warburg Pincus', role: 'Asset Manager', type: 'General Partner (GP)', status: 'Verified' },
  { id: 2016, name: 'Hellman & Friedman', role: 'Asset Manager', type: 'General Partner (GP)', status: 'Verified' },
  { id: 2017, name: 'Leonard Green & Partners', role: 'Asset Manager', type: 'General Partner (GP)', status: 'Verified' },
  { id: 2018, name: 'General Atlantic', role: 'Asset Manager', type: 'General Partner (GP)', status: 'Verified' },
  { id: 2019, name: 'Clearlake Capital', role: 'Asset Manager', type: 'General Partner (GP)', status: 'Verified' },
  { id: 2020, name: 'Advent International', role: 'Asset Manager', type: 'General Partner (GP)', status: 'Verified' },
  { id: 2021, name: 'Silver Lake Partners', role: 'Asset Manager', type: 'General Partner (GP)', status: 'Verified' },
  { id: 2022, name: 'CVC Capital Partners', role: 'Asset Manager', type: 'General Partner (GP)', status: 'Verified' },
  { id: 2023, name: 'EQT Partners', role: 'Asset Manager', type: 'General Partner (GP)', status: 'Verified' },
  { id: 2024, name: 'Permira', role: 'Asset Manager', type: 'General Partner (GP)', status: 'Verified' },
  { id: 2025, name: 'Francisco Partners', role: 'Asset Manager', type: 'General Partner (GP)', status: 'Verified' },
  { id: 2026, name: 'Welsh Carson', role: 'Asset Manager', type: 'General Partner (GP)', status: 'Verified' },
  { id: 2027, name: 'GTCR', role: 'Asset Manager', type: 'General Partner (GP)', status: 'Verified' },
  { id: 2028, name: 'TA Associates', role: 'Asset Manager', type: 'General Partner (GP)', status: 'Verified' },
  { id: 2029, name: 'Summit Partners', role: 'Asset Manager', type: 'General Partner (GP)', status: 'Verified' },
  { id: 2030, name: 'Providence Equity', role: 'Asset Manager', type: 'General Partner (GP)', status: 'Verified' },
  { id: 2031, name: 'Apax Partners', role: 'Asset Manager', type: 'General Partner (GP)', status: 'Verified' },
  { id: 2032, name: 'Accel Partners', role: 'Asset Manager', type: 'General Partner (GP)', status: 'Verified' },
  { id: 2033, name: 'Lightspeed Venture Partners', role: 'Asset Manager', type: 'General Partner (GP)', status: 'Verified' },
  { id: 2034, name: 'Greylock Partners', role: 'Asset Manager', type: 'General Partner (GP)', status: 'Verified' },
  { id: 2035, name: 'NEA (New Enterprise Associates)', role: 'Asset Manager', type: 'General Partner (GP)', status: 'Verified' },
  
  // === LIMITED PARTNERS ===
  // US State Pension Funds
  { id: 3001, name: 'State of Ohio Pension (OPERS)', role: 'Limited Partner', type: 'Limited Partner (LP)', status: 'Verified' },
  { id: 3002, name: 'Harvard Management Company', role: 'Limited Partner', type: 'Limited Partner (LP)', status: 'Verified' },
  { id: 3003, name: 'Yale Investments Office', role: 'Limited Partner', type: 'Limited Partner (LP)', status: 'Verified' },
  { id: 3004, name: 'CPPIB (Canada Pension)', role: 'Limited Partner', type: 'Limited Partner (LP)', status: 'Verified' },
  { id: 3005, name: 'BlackRock Private Equity Partners', role: 'Limited Partner', type: 'Limited Partner (LP)', status: 'Verified' },
  { id: 3006, name: 'GIC Private Limited (Singapore)', role: 'Limited Partner', type: 'Limited Partner (LP)', status: 'Verified' },
  { id: 3007, name: 'CalPERS', role: 'Limited Partner', type: 'Limited Partner (LP)', status: 'Verified' },
  { id: 3008, name: "Teacher Retirement System of Texas", role: 'Limited Partner', type: 'Limited Partner (LP)', status: 'Verified' },
  { id: 3009, name: 'CalSTRS', role: 'Limited Partner', type: 'Limited Partner (LP)', status: 'Verified' },
  { id: 3010, name: 'New York State Teachers (NYSTRS)', role: 'Limited Partner', type: 'Limited Partner (LP)', status: 'Verified' },
  { id: 3011, name: 'Florida State Board of Administration', role: 'Limited Partner', type: 'Limited Partner (LP)', status: 'Verified' },
  { id: 3012, name: 'Virginia Retirement System', role: 'Limited Partner', type: 'Limited Partner (LP)', status: 'Verified' },
  { id: 3013, name: 'Washington State Investment Board', role: 'Limited Partner', type: 'Limited Partner (LP)', status: 'Verified' },
  { id: 3014, name: 'Oregon Investment Council', role: 'Limited Partner', type: 'Limited Partner (LP)', status: 'Verified' },
  { id: 3015, name: 'State of Wisconsin Investment Board', role: 'Limited Partner', type: 'Limited Partner (LP)', status: 'Verified' },
  { id: 3016, name: 'Pennsylvania PSERS', role: 'Limited Partner', type: 'Limited Partner (LP)', status: 'Verified' },
  { id: 3017, name: 'Michigan MERS', role: 'Limited Partner', type: 'Limited Partner (LP)', status: 'Verified' },
  // University Endowments
  { id: 3018, name: 'MIT Investment Management Company', role: 'Limited Partner', type: 'Limited Partner (LP)', status: 'Verified' },
  { id: 3019, name: 'Princeton University Investment Company', role: 'Limited Partner', type: 'Limited Partner (LP)', status: 'Verified' },
  { id: 3020, name: 'Stanford Management Company', role: 'Limited Partner', type: 'Limited Partner (LP)', status: 'Verified' },
  { id: 3021, name: 'Duke University Management Company', role: 'Limited Partner', type: 'Limited Partner (LP)', status: 'Verified' },
  { id: 3022, name: 'Northwestern University Investment Office', role: 'Limited Partner', type: 'Limited Partner (LP)', status: 'Verified' },
  { id: 3023, name: 'Columbia University Investment Management', role: 'Limited Partner', type: 'Limited Partner (LP)', status: 'Verified' },
  { id: 3024, name: 'Penn Endowment', role: 'Limited Partner', type: 'Limited Partner (LP)', status: 'Verified' },
  { id: 3025, name: 'Rice University Management Company', role: 'Limited Partner', type: 'Limited Partner (LP)', status: 'Verified' },
  { id: 3026, name: 'University of Chicago Endowment', role: 'Limited Partner', type: 'Limited Partner (LP)', status: 'Verified' },
  { id: 3027, name: 'Cornell University Investment Office', role: 'Limited Partner', type: 'Limited Partner (LP)', status: 'Verified' },
  // Sovereign Wealth Funds
  { id: 3028, name: 'Abu Dhabi Investment Authority (ADIA)', role: 'Limited Partner', type: 'Limited Partner (LP)', status: 'Verified' },
  { id: 3029, name: 'Norway Government Pension Fund', role: 'Limited Partner', type: 'Limited Partner (LP)', status: 'Verified' },
  { id: 3030, name: 'Temasek Holdings (Singapore)', role: 'Limited Partner', type: 'Limited Partner (LP)', status: 'Verified' },
  { id: 3031, name: 'Qatar Investment Authority', role: 'Limited Partner', type: 'Limited Partner (LP)', status: 'Verified' },
  { id: 3032, name: 'Kuwait Investment Authority', role: 'Limited Partner', type: 'Limited Partner (LP)', status: 'Verified' },
  { id: 3033, name: 'China Investment Corporation', role: 'Limited Partner', type: 'Limited Partner (LP)', status: 'Verified' },
  { id: 3034, name: 'Saudi Public Investment Fund', role: 'Limited Partner', type: 'Limited Partner (LP)', status: 'Verified' },
  { id: 3035, name: 'Hong Kong Monetary Authority', role: 'Limited Partner', type: 'Limited Partner (LP)', status: 'Verified' },
  // Insurance Companies & Asset Managers
  { id: 3036, name: 'MetLife Investment Management', role: 'Limited Partner', type: 'Limited Partner (LP)', status: 'Verified' },
  { id: 3037, name: 'Prudential Private Capital', role: 'Limited Partner', type: 'Limited Partner (LP)', status: 'Verified' },
  { id: 3038, name: 'AIG Investments', role: 'Limited Partner', type: 'Limited Partner (LP)', status: 'Verified' },
  { id: 3039, name: 'Allianz Capital Partners', role: 'Limited Partner', type: 'Limited Partner (LP)', status: 'Verified' },
  { id: 3040, name: 'MassMutual Private Equity', role: 'Limited Partner', type: 'Limited Partner (LP)', status: 'Verified' },
  // Family Offices
  { id: 3041, name: 'Walton Enterprises', role: 'Limited Partner', type: 'Limited Partner (LP)', status: 'Verified' },
  { id: 3042, name: 'Emerson Collective', role: 'Limited Partner', type: 'Limited Partner (LP)', status: 'Verified' },
  { id: 3043, name: 'Cascade Investment', role: 'Limited Partner', type: 'Limited Partner (LP)', status: 'Verified' },
  { id: 3044, name: 'Bezos Family Office', role: 'Limited Partner', type: 'Limited Partner (LP)', status: 'Verified' },
  { id: 3045, name: 'Koch Industries Investments', role: 'Limited Partner', type: 'Limited Partner (LP)', status: 'Verified' },
  
  // === DELEGATES (Service Providers) ===
  // Auditors
  { id: 4001, name: 'Deloitte Audit', role: 'Delegate', type: 'Auditor', status: 'Verified' },
  { id: 4002, name: 'PwC Tax & Audit', role: 'Delegate', type: 'Tax Advisor', status: 'Verified' },
  { id: 4003, name: 'Chronograph', role: 'Delegate', type: 'LP Data/BI Servicer', status: 'Verified' },
  { id: 4004, name: 'Mantle', role: 'Delegate', type: 'LP Data/BI Servicer', status: 'Verified' },
  { id: 4005, name: 'Carta (LP Services)', role: 'Delegate', type: 'LP Data/BI Servicer', status: 'Verified' },
  { id: 4006, name: 'Burgiss / MSCI', role: 'Delegate', type: 'LP Portfolio Analytics', status: 'Verified' },
  { id: 4007, name: 'Ernst & Young (EY)', role: 'Delegate', type: 'Auditor', status: 'Verified' },
  { id: 4008, name: 'KPMG Advisory', role: 'Delegate', type: 'Auditor', status: 'Verified' },
  { id: 4009, name: 'Grant Thornton', role: 'Delegate', type: 'Auditor', status: 'Verified' },
  { id: 4010, name: 'BDO USA', role: 'Delegate', type: 'Auditor', status: 'Verified' },
  // Analytics & Data Providers
  { id: 4011, name: 'eFront (BlackRock)', role: 'Delegate', type: 'LP Data/BI Servicer', status: 'Verified' },
  { id: 4012, name: 'Preqin', role: 'Delegate', type: 'LP Portfolio Analytics', status: 'Verified' },
  { id: 4013, name: 'Cambridge Associates', role: 'Delegate', type: 'LP Portfolio Analytics', status: 'Verified' },
  { id: 4014, name: 'Hamilton Lane', role: 'Delegate', type: 'LP Portfolio Analytics', status: 'Verified' },
  { id: 4015, name: 'PitchBook', role: 'Delegate', type: 'LP Data/BI Servicer', status: 'Verified' },
  { id: 4016, name: 'Cobalt LP', role: 'Delegate', type: 'LP Data/BI Servicer', status: 'Verified' },
  { id: 4017, name: 'iLevel Solutions', role: 'Delegate', type: 'LP Data/BI Servicer', status: 'Verified' },
  // Legal & Compliance
  { id: 4018, name: 'Kirkland & Ellis LLP', role: 'Delegate', type: 'Legal Counsel', status: 'Verified' },
  { id: 4019, name: 'Simpson Thacher & Bartlett', role: 'Delegate', type: 'Legal Counsel', status: 'Verified' },
  { id: 4020, name: 'Ropes & Gray LLP', role: 'Delegate', type: 'Legal Counsel', status: 'Verified' },
  { id: 4021, name: 'Latham & Watkins LLP', role: 'Delegate', type: 'Legal Counsel', status: 'Verified' },
  { id: 4022, name: 'Debevoise & Plimpton', role: 'Delegate', type: 'Legal Counsel', status: 'Verified' },
  // Tax Specialists
  { id: 4023, name: 'RSM US LLP', role: 'Delegate', type: 'Tax Advisor', status: 'Verified' },
  { id: 4024, name: 'Crowe LLP', role: 'Delegate', type: 'Tax Advisor', status: 'Verified' },
  { id: 4025, name: 'Withum Smith+Brown', role: 'Delegate', type: 'Tax Advisor', status: 'Verified' },
]

export const mockUsers: User[] = [
  // === PLATFORM ADMIN ===
  { id: 501, name: 'Alice Admin', email: 'alice@waypoint.coop', orgId: 1, role: 'Platform Admin', isOrgAdmin: true },
  
  // === DELEGATE USERS (Fund Administrators) ===
  { id: 521, name: 'Genii Publisher', email: 'publisher@genii.com', orgId: 1001, role: 'Delegate', isOrgAdmin: true },
  { id: 515, name: 'Oscar Ops', email: 'oscar@alterdomus.com', orgId: 1002, role: 'Ops', isOrgAdmin: true },
  { id: 522, name: 'Carta Admin', email: 'admin@carta-fa.com', orgId: 1003, role: 'Delegate', isOrgAdmin: true },
  { id: 523, name: 'Sarah SSC', email: 'sarah@ssc.com', orgId: 1004, role: 'Delegate', isOrgAdmin: true },
  { id: 524, name: 'Chris Citco', email: 'chris@citco.com', orgId: 1005, role: 'Delegate', isOrgAdmin: true },
  { id: 525, name: 'Amy Apex', email: 'amy@apexgroup.com', orgId: 1006, role: 'Delegate', isOrgAdmin: true },
  { id: 526, name: 'Tom StateStreet', email: 'tom@statestreet.com', orgId: 1007, role: 'Delegate', isOrgAdmin: true },
  { id: 527, name: 'Nina Northern', email: 'nina@ntrs.com', orgId: 1008, role: 'Delegate', isOrgAdmin: true },
  { id: 528, name: 'Sean SEI', email: 'sean@seic.com', orgId: 1009, role: 'Delegate', isOrgAdmin: true },
  { id: 529, name: 'Beth BNY', email: 'beth@bnymellon.com', orgId: 1010, role: 'Delegate', isOrgAdmin: true },
  
  // === ASSET MANAGER USERS ===
  { id: 502, name: 'Bob GP', email: 'bob@kleinerperkins.com', orgId: 2001, role: 'Asset Manager', isOrgAdmin: true },
  { id: 507, name: 'Grace GP', email: 'grace@sequoia.com', orgId: 2002, role: 'Asset Manager', isOrgAdmin: true },
  { id: 519, name: 'Steve Sequoia', email: 'steve@sequoia.com', orgId: 2002, role: 'IR', isOrgAdmin: false },
  { id: 530, name: 'Marc a16z', email: 'marc@a16z.com', orgId: 2003, role: 'Asset Manager', isOrgAdmin: true },
  { id: 516, name: 'Pat Partner', email: 'pat@benchmark.com', orgId: 2004, role: 'Signer', isOrgAdmin: true },
  { id: 509, name: 'Ian Insight', email: 'ian@insightpartners.com', orgId: 2005, role: 'Asset Manager', isOrgAdmin: true },
  { id: 512, name: 'Leo Thoma', email: 'leo@thomabravo.com', orgId: 2006, role: 'Asset Manager', isOrgAdmin: true },
  { id: 531, name: 'Robert Vista', email: 'robert@vistaequity.com', orgId: 2007, role: 'Asset Manager', isOrgAdmin: true },
  { id: 532, name: 'Stephen Blackstone', email: 'stephen@blackstone.com', orgId: 2008, role: 'Asset Manager', isOrgAdmin: true },
  { id: 533, name: 'Henry KKR', email: 'henry@kkr.com', orgId: 2009, role: 'Asset Manager', isOrgAdmin: true },
  { id: 534, name: 'Marc Apollo', email: 'marc@apollo.com', orgId: 2010, role: 'Asset Manager', isOrgAdmin: true },
  { id: 535, name: 'David Carlyle', email: 'david@carlyle.com', orgId: 2011, role: 'Asset Manager', isOrgAdmin: true },
  { id: 536, name: 'Michael Ares', email: 'michael@aresmgmt.com', orgId: 2012, role: 'Asset Manager', isOrgAdmin: true },
  { id: 537, name: 'Jon TPG', email: 'jon@tpg.com', orgId: 2013, role: 'Asset Manager', isOrgAdmin: true },
  { id: 538, name: 'Steve Bain', email: 'steve@baincapital.com', orgId: 2014, role: 'Asset Manager', isOrgAdmin: true },
  { id: 539, name: 'Chip Warburg', email: 'chip@warburgpincus.com', orgId: 2015, role: 'Asset Manager', isOrgAdmin: true },
  { id: 540, name: 'Patrick Hellman', email: 'patrick@hf.com', orgId: 2016, role: 'Asset Manager', isOrgAdmin: true },
  { id: 541, name: 'John Leonard', email: 'john@leonardgreen.com', orgId: 2017, role: 'Asset Manager', isOrgAdmin: true },
  { id: 542, name: 'Bill GeneralAtlantic', email: 'bill@generalatlantic.com', orgId: 2018, role: 'Asset Manager', isOrgAdmin: true },
  { id: 543, name: 'Jose Clearlake', email: 'jose@clearlake.com', orgId: 2019, role: 'Asset Manager', isOrgAdmin: true },
  { id: 544, name: 'David Advent', email: 'david@adventintl.com', orgId: 2020, role: 'Asset Manager', isOrgAdmin: true },
  { id: 545, name: 'Egon SilverLake', email: 'egon@silverlake.com', orgId: 2021, role: 'Asset Manager', isOrgAdmin: true },
  { id: 546, name: 'Rob CVC', email: 'rob@cvc.com', orgId: 2022, role: 'Asset Manager', isOrgAdmin: true },
  { id: 547, name: 'Christian EQT', email: 'christian@eqtpartners.com', orgId: 2023, role: 'Asset Manager', isOrgAdmin: true },
  { id: 548, name: 'Kurt Permira', email: 'kurt@permira.com', orgId: 2024, role: 'Asset Manager', isOrgAdmin: true },
  { id: 549, name: 'Dipanjan Francisco', email: 'dipanjan@franciscopartners.com', orgId: 2025, role: 'Asset Manager', isOrgAdmin: true },
  { id: 550, name: 'Jim Accel', email: 'jim@accel.com', orgId: 2032, role: 'Asset Manager', isOrgAdmin: true },
  { id: 551, name: 'Barry Lightspeed', email: 'barry@lsvp.com', orgId: 2033, role: 'Asset Manager', isOrgAdmin: true },
  { id: 552, name: 'Reid Greylock', email: 'reid@greylock.com', orgId: 2034, role: 'Asset Manager', isOrgAdmin: true },
  { id: 553, name: 'Peter NEA', email: 'peter@nea.com', orgId: 2035, role: 'Asset Manager', isOrgAdmin: true },
  
  // === LIMITED PARTNER USERS ===
  { id: 503, name: 'Charlie LP', email: 'charlie@ohio.gov', orgId: 3001, role: 'Limited Partner', isOrgAdmin: true },
  { id: 508, name: 'Harry Harvard', email: 'harry@hmc.harvard.edu', orgId: 3002, role: 'Limited Partner', isOrgAdmin: true },
  { id: 510, name: 'Jack Yale', email: 'jack@yale.edu', orgId: 3003, role: 'Limited Partner', isOrgAdmin: false },
  { id: 511, name: 'Karen CPPIB', email: 'karen@cppib.com', orgId: 3004, role: 'Limited Partner', isOrgAdmin: true },
  { id: 554, name: 'Brian BlackRock', email: 'brian@blackrock.com', orgId: 3005, role: 'Limited Partner', isOrgAdmin: true },
  { id: 555, name: 'Lim GIC', email: 'lim@gic.com.sg', orgId: 3006, role: 'Limited Partner', isOrgAdmin: true },
  { id: 518, name: 'Rachel Risk', email: 'rachel@calpers.ca.gov', orgId: 3007, role: 'Risk', isOrgAdmin: false },
  { id: 556, name: 'Mark CalPERS', email: 'mark@calpers.ca.gov', orgId: 3007, role: 'Limited Partner', isOrgAdmin: true },
  { id: 557, name: 'Teresa TRS', email: 'teresa@trs.texas.gov', orgId: 3008, role: 'Limited Partner', isOrgAdmin: true },
  { id: 558, name: 'Chris CalSTRS', email: 'chris@calstrs.com', orgId: 3009, role: 'Limited Partner', isOrgAdmin: true },
  { id: 559, name: 'Nancy NYSTRS', email: 'nancy@nystrs.org', orgId: 3010, role: 'Limited Partner', isOrgAdmin: true },
  { id: 560, name: 'Frank Florida', email: 'frank@sbafla.com', orgId: 3011, role: 'Limited Partner', isOrgAdmin: true },
  { id: 561, name: 'Virginia VRS', email: 'virginia@varetire.org', orgId: 3012, role: 'Limited Partner', isOrgAdmin: true },
  { id: 562, name: 'William WSIB', email: 'william@sib.wa.gov', orgId: 3013, role: 'Limited Partner', isOrgAdmin: true },
  { id: 563, name: 'Oliver Oregon', email: 'oliver@oregon.gov', orgId: 3014, role: 'Limited Partner', isOrgAdmin: true },
  { id: 564, name: 'Wendy Wisconsin', email: 'wendy@swib.state.wi.us', orgId: 3015, role: 'Limited Partner', isOrgAdmin: true },
  { id: 565, name: 'Peter Penn', email: 'peter@psers.pa.gov', orgId: 3016, role: 'Limited Partner', isOrgAdmin: true },
  { id: 566, name: 'MIT Endowment', email: 'endowment@mit.edu', orgId: 3018, role: 'Limited Partner', isOrgAdmin: true },
  { id: 567, name: 'Princeton Investments', email: 'princo@princeton.edu', orgId: 3019, role: 'Limited Partner', isOrgAdmin: true },
  { id: 568, name: 'Stanford SMC', email: 'smc@stanford.edu', orgId: 3020, role: 'Limited Partner', isOrgAdmin: true },
  { id: 569, name: 'Duke DUMAC', email: 'dumac@duke.edu', orgId: 3021, role: 'Limited Partner', isOrgAdmin: true },
  { id: 570, name: 'Northwestern NW', email: 'investments@northwestern.edu', orgId: 3022, role: 'Limited Partner', isOrgAdmin: true },
  { id: 571, name: 'Columbia CIM', email: 'cim@columbia.edu', orgId: 3023, role: 'Limited Partner', isOrgAdmin: true },
  { id: 572, name: 'UPenn Endowment', email: 'investments@upenn.edu', orgId: 3024, role: 'Limited Partner', isOrgAdmin: true },
  { id: 573, name: 'Rice Endowment', email: 'endowment@rice.edu', orgId: 3025, role: 'Limited Partner', isOrgAdmin: true },
  { id: 574, name: 'Ahmed ADIA', email: 'ahmed@adia.ae', orgId: 3028, role: 'Limited Partner', isOrgAdmin: true },
  { id: 575, name: 'Nicolai Norway', email: 'nicolai@nbim.no', orgId: 3029, role: 'Limited Partner', isOrgAdmin: true },
  { id: 576, name: 'Dilhan Temasek', email: 'dilhan@temasek.com.sg', orgId: 3030, role: 'Limited Partner', isOrgAdmin: true },
  { id: 577, name: 'Mansoor QIA', email: 'mansoor@qia.qa', orgId: 3031, role: 'Limited Partner', isOrgAdmin: true },
  { id: 578, name: 'Bader KIA', email: 'bader@kia.gov.kw', orgId: 3032, role: 'Limited Partner', isOrgAdmin: true },
  { id: 579, name: 'Wei CIC', email: 'wei@china-inv.cn', orgId: 3033, role: 'Limited Partner', isOrgAdmin: true },
  { id: 580, name: 'Rob Walton', email: 'rob@waltonenterprises.com', orgId: 3041, role: 'Limited Partner', isOrgAdmin: true },
  { id: 581, name: 'Laurene Emerson', email: 'laurene@emersoncollective.com', orgId: 3042, role: 'Limited Partner', isOrgAdmin: true },
  { id: 582, name: 'Michael Cascade', email: 'michael@cascadeinv.com', orgId: 3043, role: 'Limited Partner', isOrgAdmin: true },
  
  // === DELEGATE USERS ===
  { id: 504, name: 'Dana Delegate', email: 'dana@deloitte.com', orgId: 4001, role: 'Auditor', isOrgAdmin: true },
  { id: 520, name: 'Tina Tax', email: 'tina@pwc.com', orgId: 4002, role: 'Tax', isOrgAdmin: true },
  { id: 505, name: 'Eve Analyst', email: 'eve@chronograph.pe', orgId: 4003, role: 'Analytics', isOrgAdmin: false },
  { id: 514, name: 'Nancy Nexla', email: 'nancy@chronograph.pe', orgId: 4003, role: 'Integration', isOrgAdmin: false },
  { id: 506, name: 'Frank Founder', email: 'frank@mantle.co', orgId: 4004, role: 'Analytics', isOrgAdmin: true },
  { id: 513, name: 'Mike Mantle', email: 'mike@mantle.co', orgId: 4004, role: 'Analytics', isOrgAdmin: false },
  { id: 583, name: 'Carta LP Services', email: 'lp@carta.com', orgId: 4005, role: 'Analytics', isOrgAdmin: true },
  { id: 517, name: 'Quinn Quant', email: 'quinn@msci.com', orgId: 4006, role: 'Analytics', isOrgAdmin: true },
  { id: 584, name: 'Eric EY', email: 'eric@ey.com', orgId: 4007, role: 'Auditor', isOrgAdmin: true },
  { id: 585, name: 'Ken KPMG', email: 'ken@kpmg.com', orgId: 4008, role: 'Auditor', isOrgAdmin: true },
  { id: 586, name: 'Gary Grant', email: 'gary@grantthornton.com', orgId: 4009, role: 'Auditor', isOrgAdmin: true },
  { id: 587, name: 'Blake BDO', email: 'blake@bdo.com', orgId: 4010, role: 'Auditor', isOrgAdmin: true },
  { id: 588, name: 'Emily eFront', email: 'emily@efront.com', orgId: 4011, role: 'Analytics', isOrgAdmin: true },
  { id: 589, name: 'Paul Preqin', email: 'paul@preqin.com', orgId: 4012, role: 'Analytics', isOrgAdmin: true },
  { id: 590, name: 'Cathy Cambridge', email: 'cathy@cambridgeassociates.com', orgId: 4013, role: 'Analytics', isOrgAdmin: true },
  { id: 591, name: 'Howard Hamilton', email: 'howard@hamiltonlane.com', orgId: 4014, role: 'Analytics', isOrgAdmin: true },
  { id: 592, name: 'Kirk Kirkland', email: 'kirk@kirkland.com', orgId: 4018, role: 'Restricted', isOrgAdmin: true },
  { id: 593, name: 'Simon Simpson', email: 'simon@stblaw.com', orgId: 4019, role: 'Restricted', isOrgAdmin: true },
  { id: 594, name: 'Rob Ropes', email: 'rob@ropesgray.com', orgId: 4020, role: 'Restricted', isOrgAdmin: true },
  { id: 595, name: 'Larry Latham', email: 'larry@lw.com', orgId: 4021, role: 'Restricted', isOrgAdmin: true },
]

export const mockAssets: Asset[] = [
  // === KLEINER PERKINS FUNDS ===
  { id: 9001, name: 'KP Fund XVIII', ownerId: 2001, defaultPublisherId: 1001, type: 'Fund', requireGPApprovalForDelegations: true },
  { id: 9002, name: 'KP Growth III', ownerId: 2001, defaultPublisherId: 1001, type: 'Fund', requireGPApprovalForDelegations: false },
  { id: 9101, name: 'Project SpaceX Co-Invest', ownerId: 2001, defaultPublisherId: 1001, type: 'Co-Investment', requireGPApprovalForDelegations: false },
  
  // === SEQUOIA CAPITAL FUNDS ===
  { id: 9003, name: 'Sequoia Seed 2025', ownerId: 2002, defaultPublisherId: 2002, type: 'Fund', requireGPApprovalForDelegations: true },
  { id: 9004, name: 'Sequoia Growth X', ownerId: 2002, defaultPublisherId: 2002, type: 'Fund', requireGPApprovalForDelegations: false },
  { id: 9102, name: 'Project Stripe SPV', ownerId: 2002, defaultPublisherId: 2002, type: 'SPV', requireGPApprovalForDelegations: false },
  { id: 9050, name: 'Sequoia Capital Fund', ownerId: 2002, defaultPublisherId: 2002, type: 'Fund', requireGPApprovalForDelegations: true },
  
  // === ANDREESSEN HOROWITZ FUNDS ===
  { id: 9005, name: 'a16z Crypto IV', ownerId: 2003, defaultPublisherId: 1003, type: 'Fund', requireGPApprovalForDelegations: true },
  { id: 9006, name: 'a16z Bio II', ownerId: 2003, defaultPublisherId: 1003, type: 'Fund', requireGPApprovalForDelegations: false },
  { id: 9103, name: 'Project Databricks Co-Invest', ownerId: 2003, defaultPublisherId: 1003, type: 'Co-Investment', requireGPApprovalForDelegations: true },
  { id: 9051, name: 'a16z Growth Fund III', ownerId: 2003, defaultPublisherId: 1003, type: 'Fund', requireGPApprovalForDelegations: false },
  
  // === BENCHMARK FUNDS ===
  { id: 9007, name: 'Benchmark VIII', ownerId: 2004, defaultPublisherId: 1002, type: 'Fund', requireGPApprovalForDelegations: false },
  { id: 9052, name: 'Benchmark IX', ownerId: 2004, defaultPublisherId: 1002, type: 'Fund', requireGPApprovalForDelegations: true },
  
  // === INSIGHT PARTNERS FUNDS ===
  { id: 9008, name: 'Insight Partners XII', ownerId: 2005, defaultPublisherId: 1002, type: 'Fund', requireGPApprovalForDelegations: true },
  { id: 9053, name: 'Insight Venture Partners X', ownerId: 2005, defaultPublisherId: 1002, type: 'Fund', requireGPApprovalForDelegations: false },
  
  // === THOMA BRAVO FUNDS ===
  { id: 9009, name: 'Thoma Bravo XV', ownerId: 2006, defaultPublisherId: 1001, type: 'Fund', requireGPApprovalForDelegations: false },
  { id: 9054, name: 'Thoma Bravo Discover Fund IV', ownerId: 2006, defaultPublisherId: 1001, type: 'Fund', requireGPApprovalForDelegations: true },
  
  // === VISTA EQUITY FUNDS ===
  { id: 9010, name: 'Vista Equity VIII', ownerId: 2007, defaultPublisherId: 1002, type: 'Fund', requireGPApprovalForDelegations: true },
  { id: 9055, name: 'Vista Foundation Fund V', ownerId: 2007, defaultPublisherId: 1002, type: 'Fund', requireGPApprovalForDelegations: false },
  
  // === BLACKSTONE FUNDS ===
  { id: 9011, name: 'Blackstone Capital Partners IX', ownerId: 2008, defaultPublisherId: 1004, type: 'Fund', requireGPApprovalForDelegations: true },
  { id: 9012, name: 'Blackstone Growth Fund III', ownerId: 2008, defaultPublisherId: 1004, type: 'Fund', requireGPApprovalForDelegations: true },
  { id: 9104, name: 'Project Refinitiv Co-Invest', ownerId: 2008, defaultPublisherId: 1004, type: 'Co-Investment', requireGPApprovalForDelegations: true },
  
  // === KKR FUNDS ===
  { id: 9013, name: 'KKR Americas Fund XIII', ownerId: 2009, defaultPublisherId: 1005, type: 'Fund', requireGPApprovalForDelegations: true },
  { id: 9014, name: 'KKR Global Infrastructure IV', ownerId: 2009, defaultPublisherId: 1005, type: 'Fund', requireGPApprovalForDelegations: false },
  { id: 9105, name: 'Project Internet Brands SPV', ownerId: 2009, defaultPublisherId: 1005, type: 'SPV', requireGPApprovalForDelegations: true },
  
  // === APOLLO FUNDS ===
  { id: 9015, name: 'Apollo Fund X', ownerId: 2010, defaultPublisherId: 1006, type: 'Fund', requireGPApprovalForDelegations: true },
  { id: 9016, name: 'Apollo Natural Resources IV', ownerId: 2010, defaultPublisherId: 1006, type: 'Fund', requireGPApprovalForDelegations: false },
  
  // === CARLYLE FUNDS ===
  { id: 9017, name: 'Carlyle Partners VIII', ownerId: 2011, defaultPublisherId: 1007, type: 'Fund', requireGPApprovalForDelegations: true },
  { id: 9018, name: 'Carlyle Europe Partners VI', ownerId: 2011, defaultPublisherId: 1007, type: 'Fund', requireGPApprovalForDelegations: true },
  { id: 9106, name: 'Project Getty Co-Invest', ownerId: 2011, defaultPublisherId: 1007, type: 'Co-Investment', requireGPApprovalForDelegations: false },
  
  // === ARES FUNDS ===
  { id: 9019, name: 'Ares Corporate Opportunities VI', ownerId: 2012, defaultPublisherId: 1008, type: 'Fund', requireGPApprovalForDelegations: true },
  { id: 9020, name: 'Ares Special Situations Fund V', ownerId: 2012, defaultPublisherId: 1008, type: 'Fund', requireGPApprovalForDelegations: false },
  
  // === TPG FUNDS ===
  { id: 9021, name: 'TPG Partners IX', ownerId: 2013, defaultPublisherId: 1009, type: 'Fund', requireGPApprovalForDelegations: true },
  { id: 9022, name: 'TPG Rise Climate Fund', ownerId: 2013, defaultPublisherId: 1009, type: 'Fund', requireGPApprovalForDelegations: true },
  
  // === BAIN CAPITAL FUNDS ===
  { id: 9023, name: 'Bain Capital Fund XIV', ownerId: 2014, defaultPublisherId: 1010, type: 'Fund', requireGPApprovalForDelegations: true },
  { id: 9024, name: 'Bain Capital Tech Opportunities III', ownerId: 2014, defaultPublisherId: 1010, type: 'Fund', requireGPApprovalForDelegations: false },
  
  // === WARBURG PINCUS FUNDS ===
  { id: 9025, name: 'Warburg Pincus Global Growth 14', ownerId: 2015, defaultPublisherId: 1011, type: 'Fund', requireGPApprovalForDelegations: true },
  { id: 9026, name: 'Warburg Pincus China-Southeast Asia III', ownerId: 2015, defaultPublisherId: 1011, type: 'Fund', requireGPApprovalForDelegations: true },
  
  // === HELLMAN & FRIEDMAN FUNDS ===
  { id: 9027, name: 'Hellman & Friedman Capital Partners XI', ownerId: 2016, defaultPublisherId: 1012, type: 'Fund', requireGPApprovalForDelegations: true },
  { id: 9107, name: 'Project ServiceNow Co-Invest', ownerId: 2016, defaultPublisherId: 1012, type: 'Co-Investment', requireGPApprovalForDelegations: true },
  
  // === GENERAL ATLANTIC FUNDS ===
  { id: 9028, name: 'General Atlantic 2024 Fund', ownerId: 2018, defaultPublisherId: 1004, type: 'Fund', requireGPApprovalForDelegations: false },
  { id: 9029, name: 'BeyondNetZero Fund II', ownerId: 2018, defaultPublisherId: 1004, type: 'Fund', requireGPApprovalForDelegations: true },
  
  // === SILVER LAKE FUNDS ===
  { id: 9030, name: 'Silver Lake Partners VII', ownerId: 2021, defaultPublisherId: 1005, type: 'Fund', requireGPApprovalForDelegations: true },
  { id: 9031, name: 'Silver Lake Alpine II', ownerId: 2021, defaultPublisherId: 1005, type: 'Fund', requireGPApprovalForDelegations: false },
  { id: 9108, name: 'Project Qualtrics SPV', ownerId: 2021, defaultPublisherId: 1005, type: 'SPV', requireGPApprovalForDelegations: true },
  
  // === EQT FUNDS ===
  { id: 9032, name: 'EQT X', ownerId: 2023, defaultPublisherId: 1006, type: 'Fund', requireGPApprovalForDelegations: true },
  { id: 9033, name: 'EQT Infrastructure VI', ownerId: 2023, defaultPublisherId: 1006, type: 'Fund', requireGPApprovalForDelegations: true },
  
  // === PERMIRA FUNDS ===
  { id: 9034, name: 'Permira VIII', ownerId: 2024, defaultPublisherId: 1007, type: 'Fund', requireGPApprovalForDelegations: true },
  { id: 9035, name: 'Permira Growth Opportunities III', ownerId: 2024, defaultPublisherId: 1007, type: 'Fund', requireGPApprovalForDelegations: false },
  
  // === ACCEL FUNDS ===
  { id: 9036, name: 'Accel XVI', ownerId: 2032, defaultPublisherId: 2032, type: 'Fund', requireGPApprovalForDelegations: false },
  { id: 9037, name: 'Accel Growth Fund VII', ownerId: 2032, defaultPublisherId: 2032, type: 'Fund', requireGPApprovalForDelegations: true },
  
  // === LIGHTSPEED FUNDS ===
  { id: 9038, name: 'Lightspeed Venture Partners XVI', ownerId: 2033, defaultPublisherId: 2033, type: 'Fund', requireGPApprovalForDelegations: false },
  { id: 9039, name: 'Lightspeed Growth Fund IV', ownerId: 2033, defaultPublisherId: 2033, type: 'Fund', requireGPApprovalForDelegations: true },
  
  // === GREYLOCK FUNDS ===
  { id: 9040, name: 'Greylock XVII', ownerId: 2034, defaultPublisherId: 2034, type: 'Fund', requireGPApprovalForDelegations: false },
  { id: 9109, name: 'Project Discord Co-Invest', ownerId: 2034, defaultPublisherId: 2034, type: 'Co-Investment', requireGPApprovalForDelegations: true },
  
  // === NEA FUNDS ===
  { id: 9041, name: 'NEA 18', ownerId: 2035, defaultPublisherId: 1008, type: 'Fund', requireGPApprovalForDelegations: true },
  { id: 9042, name: 'NEA Green Fund', ownerId: 2035, defaultPublisherId: 1008, type: 'Fund', requireGPApprovalForDelegations: false },
]

// Helper to extract LP-specific payload from full payload
function extractLPPayload(fullPayload: any, lpId: number): any {
  if (!fullPayload || typeof fullPayload !== 'object') {
    return fullPayload
  }

  const filtered: any = {}

  for (const [key, value] of Object.entries(fullPayload)) {
    if (Array.isArray(value)) {
      // Filter arrays that contain LP-specific data
      if (key === 'line_items' || key === 'lp_metrics' || key === 'lpMetrics' || key === 'lineItems') {
        const lpItem = value.find((item: any) => item.lp_id === lpId || item.lpId === lpId)
        if (lpItem) {
          filtered[key] = [lpItem]
        }
      } else {
        // Keep other arrays as-is (portfolio_companies, etc.)
        filtered[key] = value
      }
    } else if (value && typeof value === 'object') {
      // Recursively filter nested objects
      filtered[key] = extractLPPayload(value, lpId)
    } else {
      // Keep primitive values
      filtered[key] = value
    }
  }

  return filtered
}

// Capital Call payload for envelope 10001 - one envelope per LP
const payload10001_ohio = {
  currency: 'USD',
  due_date: '2025-10-31',
  bank_details: { swift: 'BOFAUS3N', account: '123456789' },
  line_items: [
    { lp_id: 3001, lp_name: 'State of Ohio', amount: 5000000.00, share_pct: 0.05 },
  ],
}

const payload10001_harvard = {
  currency: 'USD',
  due_date: '2025-10-31',
  bank_details: { swift: 'BOFAUS3N', account: '123456789' },
  line_items: [
    { lp_id: 3002, lp_name: 'Harvard Mgmt', amount: 12500000.00, share_pct: 0.125 },
  ],
}

const payload10001_calpers = {
  currency: 'USD',
  due_date: '2025-10-31',
  bank_details: { swift: 'BOFAUS3N', account: '123456789' },
  line_items: [
    { lp_id: 3007, lp_name: 'CalPERS', amount: 10000000.00, share_pct: 0.10 },
  ],
}

// NAV Update payloads - one per LP
const payload10003_blackrock = {
  period_end: '2025-09-30',
  fund_level_metrics: {
    gross_asset_value: 450000000.00,
    net_asset_value: 448000000.00,
    dpi: 0.15,
    tvpi: 1.45,
  },
  lp_metrics: [
    { lp_id: 3005, nav: 25000000.00, unfunded_commitment: 5000000.00 },
  ],
}

const payload10003_gic = {
  period_end: '2025-09-30',
  fund_level_metrics: {
    gross_asset_value: 450000000.00,
    net_asset_value: 448000000.00,
    dpi: 0.15,
    tvpi: 1.45,
  },
  lp_metrics: [
    { lp_id: 3006, nav: 15000000.00, unfunded_commitment: 2000000.00 },
  ],
}

// Schedule of Investments - shared data, same for all recipients
const payload10008_shared = {
  portfolio_companies: [
    { name: 'Stripe', sector: 'Fintech', cost: 15000000.00, fair_value: 45000000.00 },
    { name: 'Databricks', sector: 'Data', cost: 10000000.00, fair_value: 22000000.00 },
    { name: 'OpenAI', sector: 'AI', cost: 5000000.00, fair_value: 85000000.00 },
  ],
}

// Envelopes: One per LP (not one envelope with multiple recipients)
export const mockEnvelopes: Omit<Envelope, 'hash'>[] = [
  // Capital Call 10001 - split into 3 envelopes (one per LP)
  { id: 10001, publisherId: 1001, userId: 501, assetOwnerId: 2001, assetId: 9001, recipientId: 3001, timestamp: '2025-10-15T10:00:00.000Z', version: 1, status: 'Delivered', dataType: 'CAPITAL_CALL' },
  { id: 10002, publisherId: 1001, userId: 501, assetOwnerId: 2001, assetId: 9001, recipientId: 3002, timestamp: '2025-10-15T10:00:00.000Z', version: 1, status: 'Delivered', dataType: 'CAPITAL_CALL' },
  { id: 10003, publisherId: 1001, userId: 501, assetOwnerId: 2001, assetId: 9001, recipientId: 3007, timestamp: '2025-10-15T10:00:00.000Z', version: 1, status: 'Delivered', dataType: 'CAPITAL_CALL' },
  // Distribution 10004 - split into 3 envelopes
  { id: 10004, publisherId: 2002, userId: 507, assetOwnerId: 2002, assetId: 9003, recipientId: 3002, timestamp: '2025-10-16T10:00:00.000Z', version: 1, status: 'Delivered', dataType: 'DISTRIBUTION' },
  { id: 10005, publisherId: 2002, userId: 507, assetOwnerId: 2002, assetId: 9003, recipientId: 3003, timestamp: '2025-10-16T10:00:00.000Z', version: 1, status: 'Delivered', dataType: 'DISTRIBUTION' },
  { id: 10006, publisherId: 2002, userId: 507, assetOwnerId: 2002, assetId: 9003, recipientId: 3004, timestamp: '2025-10-16T10:00:00.000Z', version: 1, status: 'Delivered', dataType: 'DISTRIBUTION' },
  // NAV Update 10007 - split into 2 envelopes
  { id: 10007, publisherId: 1003, userId: 501, assetOwnerId: 2003, assetId: 9005, recipientId: 3005, timestamp: '2025-10-17T10:00:00.000Z', version: 1, status: 'Delivered', dataType: 'NAV_UPDATE' },
  { id: 10008, publisherId: 1003, userId: 501, assetOwnerId: 2003, assetId: 9005, recipientId: 3006, timestamp: '2025-10-17T10:00:00.000Z', version: 1, status: 'Delivered', dataType: 'NAV_UPDATE' },
  // Quarterly Report 10009 - split into 2 envelopes
  { id: 10009, publisherId: 1002, userId: 515, assetOwnerId: 2004, assetId: 9007, recipientId: 3001, timestamp: '2025-10-18T10:00:00.000Z', version: 1, status: 'Delivered', dataType: 'QUARTERLY_REPORT' },
  { id: 10010, publisherId: 1002, userId: 515, assetOwnerId: 2004, assetId: 9007, recipientId: 3008, timestamp: '2025-10-18T10:00:00.000Z', version: 1, status: 'Delivered', dataType: 'QUARTERLY_REPORT' },
  // Capital Call 10011
  { id: 10011, publisherId: 1001, userId: 501, assetOwnerId: 2006, assetId: 9009, recipientId: 3004, timestamp: '2025-10-19T10:00:00.000Z', version: 1, status: 'Delivered', dataType: 'CAPITAL_CALL' },
  { id: 10012, publisherId: 1001, userId: 501, assetOwnerId: 2006, assetId: 9009, recipientId: 3007, timestamp: '2025-10-19T10:00:00.000Z', version: 1, status: 'Delivered', dataType: 'CAPITAL_CALL' },
  // K-1 Tax Form 10013
  { id: 10013, publisherId: 1002, userId: 515, assetOwnerId: 2005, assetId: 9008, recipientId: 3002, timestamp: '2025-10-20T10:00:00.000Z', version: 1, status: 'Delivered', dataType: 'K-1_TAX_FORM' },
  { id: 10014, publisherId: 1002, userId: 515, assetOwnerId: 2005, assetId: 9008, recipientId: 3003, timestamp: '2025-10-20T10:00:00.000Z', version: 1, status: 'Delivered', dataType: 'K-1_TAX_FORM' },
  // Capital Call 10015
  { id: 10015, publisherId: 2002, userId: 507, assetOwnerId: 2002, assetId: 9102, recipientId: 3003, timestamp: '2025-10-21T10:00:00.000Z', version: 1, status: 'Delivered', dataType: 'CAPITAL_CALL' },
  // SOI Update 10016 - shared data, same payload for all
  { id: 10016, publisherId: 1003, userId: 501, assetOwnerId: 2003, assetId: 9006, recipientId: 3005, timestamp: '2025-10-22T10:00:00.000Z', version: 1, status: 'Delivered', dataType: 'SOI_UPDATE' },
  { id: 10017, publisherId: 1003, userId: 501, assetOwnerId: 2003, assetId: 9006, recipientId: 3006, timestamp: '2025-10-22T10:00:00.000Z', version: 1, status: 'Delivered', dataType: 'SOI_UPDATE' },
  // Legal Notice 10018
  { id: 10018, publisherId: 1001, userId: 501, assetOwnerId: 2001, assetId: 9101, recipientId: 3001, timestamp: '2025-10-23T10:00:00.000Z', version: 1, status: 'Delivered', dataType: 'LEGAL_NOTICE' },
  { id: 10019, publisherId: 1001, userId: 501, assetOwnerId: 2001, assetId: 9101, recipientId: 3002, timestamp: '2025-10-23T10:00:00.000Z', version: 1, status: 'Delivered', dataType: 'LEGAL_NOTICE' },
  // Distribution 10020
  { id: 10020, publisherId: 1002, userId: 515, assetOwnerId: 2007, assetId: 9010, recipientId: 3008, timestamp: '2025-10-24T10:00:00.000Z', version: 1, status: 'Delivered', dataType: 'DISTRIBUTION' },
  { id: 10021, publisherId: 1002, userId: 515, assetOwnerId: 2007, assetId: 9010, recipientId: 3004, timestamp: '2025-10-24T10:00:00.000Z', version: 1, status: 'Delivered', dataType: 'DISTRIBUTION' },
  // K-1 Tax Form 10022 - for Deloitte delegate (3008) - matches delegation D-106
  // This envelope is for subscriber 3008 (Teacher's Retirement System of Texas) 
  // and matches the delegation D-106 which has assetScope: 'ALL' and typeScope: ['K-1_TAX_FORM']
  // Subscriber 3008 is subscribed to assets 9007 (Benchmark VIII) and 9010 (Vista Equity VIII)
  // Using asset 9010 (Vista Equity VIII) owned by assetOwnerId 2007
  { id: 10022, publisherId: 1002, userId: 515, assetOwnerId: 2007, assetId: 9010, recipientId: 3008, timestamp: '2025-10-25T10:00:00.000Z', version: 1, status: 'Delivered', dataType: 'K-1_TAX_FORM' },
]

export const mockPayloads: Payload[] = [
  { id: 1, envelopeId: 10001, data: payload10001_ohio },
  { id: 2, envelopeId: 10002, data: payload10001_harvard },
  { id: 3, envelopeId: 10003, data: payload10001_calpers },
  { id: 4, envelopeId: 10004, data: {} },
  { id: 5, envelopeId: 10005, data: {} },
  { id: 6, envelopeId: 10006, data: {} },
  { id: 7, envelopeId: 10007, data: payload10003_blackrock },
  { id: 8, envelopeId: 10008, data: payload10003_gic },
  { id: 9, envelopeId: 10009, data: {} },
  { id: 10, envelopeId: 10010, data: {} },
  { id: 11, envelopeId: 10011, data: {} },
  { id: 12, envelopeId: 10012, data: {} },
  { id: 13, envelopeId: 10013, data: {} },
  { id: 14, envelopeId: 10014, data: {} },
  { id: 15, envelopeId: 10015, data: {} },
  { id: 16, envelopeId: 10016, data: payload10008_shared },
  { id: 17, envelopeId: 10017, data: payload10008_shared },
  { id: 18, envelopeId: 10018, data: {} },
  { id: 19, envelopeId: 10019, data: {} },
  { id: 20, envelopeId: 10020, data: {} },
  { id: 21, envelopeId: 10021, data: {} },
  { id: 22, envelopeId: 10022, data: {} },
]

export const mockDelegations: Delegation[] = [
  // === STATE PENSION FUND DELEGATIONS ===
  // Ohio (3001) -> Chronograph for portfolio management
  { id: 'D-109', subscriberId: 3001, delegateId: 4003, assetScope: 'ALL', typeScope: 'ALL', status: 'Active', gpApprovalRequired: false, canManageSubscriptions: true, createdAt: '2025-11-01T10:00:00.000Z' },
  // Ohio (3001) -> Deloitte for tax documents
  { id: 'D-108', subscriberId: 3001, delegateId: 4001, assetScope: [9001, 9002], typeScope: ['K-1_TAX_FORM'], status: 'Pending GP Approval', gpApprovalRequired: true, gpApprovalStatus: 'Pending', canManageSubscriptions: false, createdAt: '2025-10-22T10:00:00.000Z' },
  // CalPERS (3007) -> Chronograph for full portfolio visibility
  { id: 'D-104', subscriberId: 3007, delegateId: 4003, assetScope: 'ALL', typeScope: 'ALL', status: 'Active', gpApprovalRequired: false, canManageSubscriptions: false, createdAt: '2025-03-01T10:00:00.000Z' },
  // CalPERS (3007) -> Hamilton Lane for analytics
  { id: 'D-111', subscriberId: 3007, delegateId: 4014, assetScope: 'ALL', typeScope: ['NAV_UPDATE', 'SOI_UPDATE', 'QUARTERLY_REPORT'], status: 'Active', gpApprovalRequired: false, canManageSubscriptions: false, createdAt: '2025-04-01T10:00:00.000Z' },
  // CalSTRS (3009) -> eFront for data aggregation
  { id: 'D-112', subscriberId: 3009, delegateId: 4011, assetScope: 'ALL', typeScope: 'ALL', status: 'Active', gpApprovalRequired: false, canManageSubscriptions: true, createdAt: '2025-04-15T10:00:00.000Z' },
  // NYSTRS (3010) -> Burgiss for benchmarking
  { id: 'D-113', subscriberId: 3010, delegateId: 4006, assetScope: 'ALL', typeScope: ['NAV_UPDATE', 'SOI_UPDATE'], status: 'Active', gpApprovalRequired: false, canManageSubscriptions: false, createdAt: '2025-05-01T10:00:00.000Z' },
  // Florida SBA (3011) -> Cambridge Associates for advisory
  { id: 'D-114', subscriberId: 3011, delegateId: 4013, assetScope: 'ALL', typeScope: 'ALL', status: 'Active', gpApprovalRequired: false, canManageSubscriptions: true, createdAt: '2025-05-15T10:00:00.000Z' },
  // Teacher Retirement Texas (3008) -> Deloitte for K-1s
  { id: 'D-106', subscriberId: 3008, delegateId: 4001, assetScope: 'ALL', typeScope: ['K-1_TAX_FORM'], status: 'Active', gpApprovalRequired: true, gpApprovalStatus: 'Approved', gpApprovedAt: '2025-04-01T10:00:00.000Z', gpApprovedById: 512, canManageSubscriptions: false, createdAt: '2025-03-25T10:00:00.000Z' },
  // Virginia Retirement (3012) -> PwC for tax
  { id: 'D-115', subscriberId: 3012, delegateId: 4002, assetScope: 'ALL', typeScope: ['K-1_TAX_FORM'], status: 'Active', gpApprovalRequired: false, canManageSubscriptions: false, createdAt: '2025-06-01T10:00:00.000Z' },
  // Washington State (3013) -> Mantle for data
  { id: 'D-116', subscriberId: 3013, delegateId: 4004, assetScope: 'ALL', typeScope: 'ALL', status: 'Active', gpApprovalRequired: false, canManageSubscriptions: false, createdAt: '2025-06-15T10:00:00.000Z' },
  // Oregon (3014) -> Preqin for benchmarking
  { id: 'D-117', subscriberId: 3014, delegateId: 4012, assetScope: 'ALL', typeScope: ['NAV_UPDATE', 'SOI_UPDATE'], status: 'Active', gpApprovalRequired: false, canManageSubscriptions: false, createdAt: '2025-07-01T10:00:00.000Z' },
  // Wisconsin (3015) -> EY for audit support
  { id: 'D-118', subscriberId: 3015, delegateId: 4007, assetScope: 'ALL', typeScope: ['K-1_TAX_FORM', 'QUARTERLY_REPORT'], status: 'Active', gpApprovalRequired: false, canManageSubscriptions: false, createdAt: '2025-07-15T10:00:00.000Z' },
  
  // === UNIVERSITY ENDOWMENT DELEGATIONS ===
  // Harvard (3002) -> Chronograph for full management
  { id: 'D-110', subscriberId: 3002, delegateId: 4003, assetScope: 'ALL', typeScope: 'ALL', status: 'Active', gpApprovalRequired: false, canManageSubscriptions: true, createdAt: '2025-11-05T10:00:00.000Z' },
  // Harvard (3002) -> Mantle for financial data
  { id: 'D-102', subscriberId: 3002, delegateId: 4004, assetScope: [9001, 9002], typeScope: ['CAPITAL_CALL', 'DISTRIBUTION'], status: 'Active', gpApprovalRequired: false, canManageSubscriptions: false, createdAt: '2025-02-01T10:00:00.000Z' },
  // Yale (3003) -> Burgiss for analytics
  { id: 'D-103', subscriberId: 3003, delegateId: 4006, assetScope: 'ALL', typeScope: ['NAV_UPDATE', 'SOI_UPDATE'], status: 'Active', gpApprovalRequired: false, canManageSubscriptions: false, createdAt: '2025-02-15T10:00:00.000Z' },
  // Yale (3003) -> KPMG for audit
  { id: 'D-119', subscriberId: 3003, delegateId: 4008, assetScope: 'ALL', typeScope: ['K-1_TAX_FORM'], status: 'Active', gpApprovalRequired: false, canManageSubscriptions: false, createdAt: '2025-08-01T10:00:00.000Z' },
  // Princeton (3019) -> Hamilton Lane for portfolio management
  { id: 'D-120', subscriberId: 3019, delegateId: 4014, assetScope: 'ALL', typeScope: 'ALL', status: 'Active', gpApprovalRequired: false, canManageSubscriptions: true, createdAt: '2025-08-15T10:00:00.000Z' },
  // Stanford (3020) -> Cambridge Associates
  { id: 'D-121', subscriberId: 3020, delegateId: 4013, assetScope: 'ALL', typeScope: 'ALL', status: 'Active', gpApprovalRequired: false, canManageSubscriptions: false, createdAt: '2025-09-01T10:00:00.000Z' },
  // MIT (3018) -> Carta LP Services
  { id: 'D-122', subscriberId: 3018, delegateId: 4005, assetScope: 'ALL', typeScope: 'ALL', status: 'Active', gpApprovalRequired: false, canManageSubscriptions: false, createdAt: '2025-09-15T10:00:00.000Z' },
  // Duke (3021) -> Chronograph
  { id: 'D-123', subscriberId: 3021, delegateId: 4003, assetScope: 'ALL', typeScope: 'ALL', status: 'Active', gpApprovalRequired: false, canManageSubscriptions: false, createdAt: '2025-10-01T10:00:00.000Z' },
  
  // === SOVEREIGN WEALTH FUND DELEGATIONS ===
  // CPPIB (3004) -> PwC for tax
  { id: 'D-107', subscriberId: 3004, delegateId: 4002, assetScope: [9009], typeScope: ['K-1_TAX_FORM'], status: 'Pending GP Approval', gpApprovalRequired: true, gpApprovalStatus: 'Pending', canManageSubscriptions: false, createdAt: '2025-10-20T10:00:00.000Z' },
  // CPPIB (3004) -> eFront for data
  { id: 'D-124', subscriberId: 3004, delegateId: 4011, assetScope: 'ALL', typeScope: 'ALL', status: 'Active', gpApprovalRequired: false, canManageSubscriptions: true, createdAt: '2025-10-15T10:00:00.000Z' },
  // GIC (3006) -> Burgiss for benchmarking
  { id: 'D-125', subscriberId: 3006, delegateId: 4006, assetScope: 'ALL', typeScope: ['NAV_UPDATE', 'SOI_UPDATE'], status: 'Active', gpApprovalRequired: false, canManageSubscriptions: false, createdAt: '2025-05-01T10:00:00.000Z' },
  // ADIA (3028) -> Hamilton Lane
  { id: 'D-126', subscriberId: 3028, delegateId: 4014, assetScope: 'ALL', typeScope: 'ALL', status: 'Active', gpApprovalRequired: false, canManageSubscriptions: true, createdAt: '2025-06-01T10:00:00.000Z' },
  // Temasek (3030) -> Preqin
  { id: 'D-127', subscriberId: 3030, delegateId: 4012, assetScope: 'ALL', typeScope: ['NAV_UPDATE', 'SOI_UPDATE'], status: 'Active', gpApprovalRequired: false, canManageSubscriptions: false, createdAt: '2025-07-01T10:00:00.000Z' },
  // Norway Fund (3029) -> Deloitte
  { id: 'D-128', subscriberId: 3029, delegateId: 4001, assetScope: 'ALL', typeScope: ['K-1_TAX_FORM'], status: 'Active', gpApprovalRequired: true, gpApprovalStatus: 'Approved', gpApprovedAt: '2025-08-01T10:00:00.000Z', gpApprovedById: 532, canManageSubscriptions: false, createdAt: '2025-07-15T10:00:00.000Z' },
  // QIA (3031) -> EY for audit
  { id: 'D-129', subscriberId: 3031, delegateId: 4007, assetScope: 'ALL', typeScope: ['K-1_TAX_FORM', 'QUARTERLY_REPORT'], status: 'Active', gpApprovalRequired: false, canManageSubscriptions: false, createdAt: '2025-08-01T10:00:00.000Z' },
  
  // === ASSET MANAGER DELEGATIONS ===
  // BlackRock (3005) -> Carta LP Services
  { id: 'D-105', subscriberId: 3005, delegateId: 4005, assetScope: [9005, 9006], typeScope: 'ALL', status: 'Active', gpApprovalRequired: false, canManageSubscriptions: false, createdAt: '2025-03-15T10:00:00.000Z' },
  // BlackRock (3005) -> Chronograph for management
  { id: 'D-130', subscriberId: 3005, delegateId: 4003, assetScope: 'ALL', typeScope: 'ALL', status: 'Active', gpApprovalRequired: false, canManageSubscriptions: true, createdAt: '2025-09-01T10:00:00.000Z' },
  
  // === INSURANCE COMPANY DELEGATIONS ===
  // MetLife (3036) -> Mantle
  { id: 'D-131', subscriberId: 3036, delegateId: 4004, assetScope: 'ALL', typeScope: 'ALL', status: 'Active', gpApprovalRequired: false, canManageSubscriptions: false, createdAt: '2025-10-01T10:00:00.000Z' },
  // Prudential (3037) -> PwC
  { id: 'D-132', subscriberId: 3037, delegateId: 4002, assetScope: 'ALL', typeScope: ['K-1_TAX_FORM'], status: 'Active', gpApprovalRequired: false, canManageSubscriptions: false, createdAt: '2025-10-15T10:00:00.000Z' },
  // Allianz (3039) -> Grant Thornton
  { id: 'D-133', subscriberId: 3039, delegateId: 4009, assetScope: 'ALL', typeScope: ['K-1_TAX_FORM', 'QUARTERLY_REPORT'], status: 'Active', gpApprovalRequired: false, canManageSubscriptions: false, createdAt: '2025-11-01T10:00:00.000Z' },
  
  // === FAMILY OFFICE DELEGATIONS ===
  // Walton Enterprises (3041) -> Kirkland & Ellis (legal)
  { id: 'D-134', subscriberId: 3041, delegateId: 4018, assetScope: 'ALL', typeScope: ['LEGAL_NOTICE'], status: 'Active', gpApprovalRequired: true, gpApprovalStatus: 'Approved', gpApprovedAt: '2025-06-01T10:00:00.000Z', gpApprovedById: 545, canManageSubscriptions: false, createdAt: '2025-05-15T10:00:00.000Z' },
  // Cascade Investment (3043) -> Hamilton Lane
  { id: 'D-135', subscriberId: 3043, delegateId: 4014, assetScope: 'ALL', typeScope: 'ALL', status: 'Active', gpApprovalRequired: false, canManageSubscriptions: true, createdAt: '2025-07-01T10:00:00.000Z' },
  
  // === PENDING DELEGATIONS ===
  // Penn (3016) -> BDO for tax - pending GP approval
  { id: 'D-136', subscriberId: 3016, delegateId: 4010, assetScope: 'ALL', typeScope: ['K-1_TAX_FORM'], status: 'Pending GP Approval', gpApprovalRequired: true, gpApprovalStatus: 'Pending', canManageSubscriptions: false, createdAt: '2025-11-15T10:00:00.000Z' },
  // Columbia (3023) -> Latham for legal - pending GP approval
  { id: 'D-137', subscriberId: 3023, delegateId: 4021, assetScope: [9011, 9012], typeScope: ['LEGAL_NOTICE'], status: 'Pending GP Approval', gpApprovalRequired: true, gpApprovalStatus: 'Pending', canManageSubscriptions: false, createdAt: '2025-11-20T10:00:00.000Z' },
]

// Subscriptions - Which LPs can access which assets
export const mockSubscriptions: Subscription[] = [
  // KP Fund XVIII (9001) - Ohio, Harvard, CalPERS (accepted)
  { id: 'S-001', assetId: 9001, subscriberId: 3001, grantedById: 2001, grantedAt: '2024-01-15T10:00:00.000Z', acceptedAt: '2024-01-16T10:00:00.000Z', status: 'Active' },
  { id: 'S-002', assetId: 9001, subscriberId: 3002, grantedById: 2001, grantedAt: '2024-01-15T10:00:00.000Z', acceptedAt: '2024-01-17T10:00:00.000Z', status: 'Active' },
  { id: 'S-003', assetId: 9001, subscriberId: 3007, grantedById: 2001, grantedAt: '2024-01-15T10:00:00.000Z', acceptedAt: '2024-01-18T10:00:00.000Z', status: 'Active' },
  // KP Growth III (9002) - Ohio, Harvard
  { id: 'S-004', assetId: 9002, subscriberId: 3001, grantedById: 2001, grantedAt: '2024-02-01T10:00:00.000Z', acceptedAt: '2024-02-02T10:00:00.000Z', status: 'Active' },
  { id: 'S-005', assetId: 9002, subscriberId: 3002, grantedById: 2001, grantedAt: '2024-02-01T10:00:00.000Z', acceptedAt: '2024-02-03T10:00:00.000Z', status: 'Active' },
  // Sequoia Seed 2025 (9003) - Harvard, Yale, CPPIB
  { id: 'S-006', assetId: 9003, subscriberId: 3002, grantedById: 2002, grantedAt: '2024-03-01T10:00:00.000Z', acceptedAt: '2024-03-02T10:00:00.000Z', status: 'Active' },
  { id: 'S-007', assetId: 9003, subscriberId: 3003, grantedById: 2002, grantedAt: '2024-03-01T10:00:00.000Z', acceptedAt: '2024-03-02T10:00:00.000Z', status: 'Active' },
  { id: 'S-008', assetId: 9003, subscriberId: 3004, grantedById: 2002, grantedAt: '2024-03-01T10:00:00.000Z', acceptedAt: '2024-03-03T10:00:00.000Z', status: 'Active' },
  // Sequoia Growth X (9004) - Harvard, Yale
  { id: 'S-009', assetId: 9004, subscriberId: 3002, grantedById: 2002, grantedAt: '2024-03-15T10:00:00.000Z', acceptedAt: '2024-03-16T10:00:00.000Z', status: 'Active' },
  { id: 'S-010', assetId: 9004, subscriberId: 3003, grantedById: 2002, grantedAt: '2024-03-15T10:00:00.000Z', acceptedAt: '2024-03-16T10:00:00.000Z', status: 'Active' },
  // a16z Crypto IV (9005) - BlackRock, GIC
  { id: 'S-011', assetId: 9005, subscriberId: 3005, grantedById: 2003, grantedAt: '2024-04-01T10:00:00.000Z', acceptedAt: '2024-04-02T10:00:00.000Z', status: 'Active' },
  { id: 'S-012', assetId: 9005, subscriberId: 3006, grantedById: 2003, grantedAt: '2024-04-01T10:00:00.000Z', acceptedAt: '2024-04-02T10:00:00.000Z', status: 'Active' },
  // a16z Bio II (9006) - BlackRock, GIC
  { id: 'S-013', assetId: 9006, subscriberId: 3005, grantedById: 2003, grantedAt: '2024-04-15T10:00:00.000Z', acceptedAt: '2024-04-16T10:00:00.000Z', status: 'Active' },
  { id: 'S-014', assetId: 9006, subscriberId: 3006, grantedById: 2003, grantedAt: '2024-04-15T10:00:00.000Z', acceptedAt: '2024-04-16T10:00:00.000Z', status: 'Active' },
  // Benchmark VIII (9007) - Ohio, TRS Texas
  { id: 'S-015', assetId: 9007, subscriberId: 3001, grantedById: 2004, grantedAt: '2024-05-01T10:00:00.000Z', acceptedAt: '2024-05-02T10:00:00.000Z', status: 'Active' },
  { id: 'S-016', assetId: 9007, subscriberId: 3008, grantedById: 2004, grantedAt: '2024-05-01T10:00:00.000Z', acceptedAt: '2024-05-03T10:00:00.000Z', status: 'Active' },
  // Insight Partners XII (9008) - Harvard, Yale
  { id: 'S-017', assetId: 9008, subscriberId: 3002, grantedById: 2005, grantedAt: '2024-05-15T10:00:00.000Z', acceptedAt: '2024-05-16T10:00:00.000Z', status: 'Active' },
  { id: 'S-018', assetId: 9008, subscriberId: 3003, grantedById: 2005, grantedAt: '2024-05-15T10:00:00.000Z', acceptedAt: '2024-05-16T10:00:00.000Z', status: 'Active' },
  // Thoma Bravo XV (9009) - CPPIB, CalPERS
  { id: 'S-019', assetId: 9009, subscriberId: 3004, grantedById: 2006, grantedAt: '2024-06-01T10:00:00.000Z', acceptedAt: '2024-06-02T10:00:00.000Z', status: 'Active' },
  { id: 'S-020', assetId: 9009, subscriberId: 3007, grantedById: 2006, grantedAt: '2024-06-01T10:00:00.000Z', acceptedAt: '2024-06-02T10:00:00.000Z', status: 'Active' },
  // Vista Equity VIII (9010) - TRS Texas, CPPIB
  { id: 'S-021', assetId: 9010, subscriberId: 3008, grantedById: 2007, grantedAt: '2024-06-15T10:00:00.000Z', acceptedAt: '2024-06-16T10:00:00.000Z', status: 'Active' },
  { id: 'S-022', assetId: 9010, subscriberId: 3004, grantedById: 2007, grantedAt: '2024-06-15T10:00:00.000Z', acceptedAt: '2024-06-16T10:00:00.000Z', status: 'Active' },
  // Project SpaceX Co-Invest (9101) - Ohio, Harvard
  { id: 'S-023', assetId: 9101, subscriberId: 3001, grantedById: 2001, grantedAt: '2024-07-01T10:00:00.000Z', acceptedAt: '2024-07-02T10:00:00.000Z', status: 'Active' },
  { id: 'S-024', assetId: 9101, subscriberId: 3002, grantedById: 2001, grantedAt: '2024-07-01T10:00:00.000Z', acceptedAt: '2024-07-02T10:00:00.000Z', status: 'Active' },
  // Project Stripe SPV (9102) - Yale
  { id: 'S-025', assetId: 9102, subscriberId: 3003, grantedById: 2002, grantedAt: '2024-07-15T10:00:00.000Z', acceptedAt: '2024-07-16T10:00:00.000Z', status: 'Active' },
  // Project Databricks (9103) - BlackRock, GIC
  { id: 'S-026', assetId: 9103, subscriberId: 3005, grantedById: 2003, grantedAt: '2024-08-01T10:00:00.000Z', acceptedAt: '2024-08-02T10:00:00.000Z', status: 'Active' },
  { id: 'S-027', assetId: 9103, subscriberId: 3006, grantedById: 2003, grantedAt: '2024-08-01T10:00:00.000Z', acceptedAt: '2024-08-02T10:00:00.000Z', status: 'Active' },
  
  // === PENDING INVITATIONS (LP needs to accept) ===
  // Sequoia inviting Ohio to Sequoia Seed 2025 (9003)
  { id: 'S-028', assetId: 9003, subscriberId: 3001, grantedById: 2002, grantedAt: '2025-11-01T10:00:00.000Z', status: 'Pending LP Acceptance', inviteMessage: 'We are pleased to invite State of Ohio Pension to join Sequoia Seed 2025. Please review and accept to receive fund updates.' },
  // Sequoia inviting Ohio to Sequoia Growth X (9004)
  { id: 'S-029', assetId: 9004, subscriberId: 3001, grantedById: 2002, grantedAt: '2025-11-01T10:00:00.000Z', status: 'Pending LP Acceptance', inviteMessage: 'You are invited to subscribe to Sequoia Growth X for Q4 2025 capital calls and distributions.' },
  // Thoma Bravo inviting Ohio to Thoma Bravo XV (9009)
  { id: 'S-030', assetId: 9009, subscriberId: 3001, grantedById: 2006, grantedAt: '2025-11-15T10:00:00.000Z', status: 'Pending LP Acceptance', inviteMessage: 'Thoma Bravo is extending an invitation for data feed access to Fund XV. Please accept to begin receiving updates.' },
  // a16z inviting Ohio to a16z Crypto IV (9005)
  { id: 'S-031', assetId: 9005, subscriberId: 3001, grantedById: 2003, grantedAt: '2025-11-20T10:00:00.000Z', status: 'Pending LP Acceptance', inviteMessage: 'Welcome to a16z Crypto IV. Accept this invitation to access your capital account statements and fund communications.' },
  
  // === PENDING REQUESTS (LP requesting, Asset Owner needs to approve) ===
  // Note: Harvard already has an active subscription to KP Fund XVIII (S-002), so no duplicate request
  // Note: Yale already has an active subscription to Insight Partners XII (S-018), so no duplicate request
  // Note: CPPIB already has an active subscription to Vista Equity VIII (S-022), so no duplicate request
  // Example: BlackRock requesting subscription to a new asset (if needed for demo)
  // { id: 'S-033', assetId: 9001, subscriberId: 3005, grantedById: 2001, grantedAt: '2025-11-26T10:00:00.000Z', status: 'Pending Asset Manager Approval', requestMessage: 'BlackRock requests subscription access for portfolio tracking.' },
]

// Publishing Rights - GP delegates publishing rights to Fund Admins
export const mockPublishingRights: PublishingRight[] = [
  // Kleiner Perkins (2001) -> Genii Admin Services (1001) for all KP assets
  { id: 'PR-001', assetOwnerId: 2001, publisherId: 1001, assetScope: [9001, 9002, 9101], canManageSubscriptions: true, canApproveSubscriptions: true, canApproveDelegations: true, canViewData: true, grantedAt: '2024-01-01T10:00:00.000Z', status: 'Active' },
  // Andreessen Horowitz (2003) -> Carta Fund Admin (1003) for a16z assets
  { id: 'PR-002', assetOwnerId: 2003, publisherId: 1003, assetScope: [9005, 9006, 9051, 9103], canManageSubscriptions: false, canApproveSubscriptions: false, canApproveDelegations: false, canViewData: true, grantedAt: '2024-01-15T10:00:00.000Z', status: 'Active' },
  // Benchmark (2004) -> Aduro Advisors (1002)
  { id: 'PR-003', assetOwnerId: 2004, publisherId: 1002, assetScope: [9007, 9052], canManageSubscriptions: true, canApproveSubscriptions: false, canApproveDelegations: true, canViewData: true, grantedAt: '2024-02-01T10:00:00.000Z', status: 'Active' },
  // Insight Partners (2005) -> Aduro Advisors (1002)
  { id: 'PR-004', assetOwnerId: 2005, publisherId: 1002, assetScope: [9008, 9053], canManageSubscriptions: false, canApproveSubscriptions: true, canApproveDelegations: false, canViewData: true, grantedAt: '2024-02-15T10:00:00.000Z', status: 'Active' },
  // Thoma Bravo (2006) -> Genii Admin Services (1001)
  { id: 'PR-005', assetOwnerId: 2006, publisherId: 1001, assetScope: [9009, 9054], canManageSubscriptions: true, canApproveSubscriptions: true, canApproveDelegations: false, canViewData: true, grantedAt: '2024-03-01T10:00:00.000Z', status: 'Active' },
  // Vista Equity (2007) -> Aduro Advisors (1002)
  { id: 'PR-006', assetOwnerId: 2007, publisherId: 1002, assetScope: [9010, 9055], canManageSubscriptions: false, canApproveSubscriptions: false, canApproveDelegations: false, canViewData: true, grantedAt: '2024-03-15T10:00:00.000Z', status: 'Active' },
  // Blackstone (2008) -> SS&C Technologies (1004)
  { id: 'PR-007', assetOwnerId: 2008, publisherId: 1004, assetScope: [9011, 9012, 9104], canManageSubscriptions: true, canApproveSubscriptions: true, canApproveDelegations: true, canViewData: true, grantedAt: '2024-04-01T10:00:00.000Z', status: 'Active' },
  // KKR (2009) -> Citco Group (1005)
  { id: 'PR-008', assetOwnerId: 2009, publisherId: 1005, assetScope: [9013, 9014, 9105], canManageSubscriptions: true, canApproveSubscriptions: true, canApproveDelegations: true, canViewData: true, grantedAt: '2024-04-15T10:00:00.000Z', status: 'Active' },
  // Apollo (2010) -> Apex Group (1006)
  { id: 'PR-009', assetOwnerId: 2010, publisherId: 1006, assetScope: [9015, 9016], canManageSubscriptions: true, canApproveSubscriptions: false, canApproveDelegations: true, canViewData: true, grantedAt: '2024-05-01T10:00:00.000Z', status: 'Active' },
  // Carlyle (2011) -> State Street (1007)
  { id: 'PR-010', assetOwnerId: 2011, publisherId: 1007, assetScope: [9017, 9018, 9106], canManageSubscriptions: true, canApproveSubscriptions: true, canApproveDelegations: true, canViewData: true, grantedAt: '2024-05-15T10:00:00.000Z', status: 'Active' },
  // Ares (2012) -> Northern Trust (1008)
  { id: 'PR-011', assetOwnerId: 2012, publisherId: 1008, assetScope: [9019, 9020], canManageSubscriptions: false, canApproveSubscriptions: true, canApproveDelegations: false, canViewData: true, grantedAt: '2024-06-01T10:00:00.000Z', status: 'Active' },
  // TPG (2013) -> SEI Investments (1009)
  { id: 'PR-012', assetOwnerId: 2013, publisherId: 1009, assetScope: [9021, 9022], canManageSubscriptions: true, canApproveSubscriptions: true, canApproveDelegations: true, canViewData: true, grantedAt: '2024-06-15T10:00:00.000Z', status: 'Active' },
  // Bain Capital (2014) -> BNY Mellon (1010)
  { id: 'PR-013', assetOwnerId: 2014, publisherId: 1010, assetScope: [9023, 9024], canManageSubscriptions: true, canApproveSubscriptions: false, canApproveDelegations: true, canViewData: true, grantedAt: '2024-07-01T10:00:00.000Z', status: 'Active' },
  // Warburg Pincus (2015) -> U.S. Bank (1011)
  { id: 'PR-014', assetOwnerId: 2015, publisherId: 1011, assetScope: [9025, 9026], canManageSubscriptions: true, canApproveSubscriptions: true, canApproveDelegations: false, canViewData: true, grantedAt: '2024-07-15T10:00:00.000Z', status: 'Active' },
  // Hellman & Friedman (2016) -> JTC Group (1012)
  { id: 'PR-015', assetOwnerId: 2016, publisherId: 1012, assetScope: [9027, 9107], canManageSubscriptions: false, canApproveSubscriptions: false, canApproveDelegations: true, canViewData: true, grantedAt: '2024-08-01T10:00:00.000Z', status: 'Active' },
  // General Atlantic (2018) -> SS&C Technologies (1004)
  { id: 'PR-016', assetOwnerId: 2018, publisherId: 1004, assetScope: [9028, 9029], canManageSubscriptions: true, canApproveSubscriptions: true, canApproveDelegations: false, canViewData: true, grantedAt: '2024-08-15T10:00:00.000Z', status: 'Active' },
  // Silver Lake (2021) -> Citco Group (1005)
  { id: 'PR-017', assetOwnerId: 2021, publisherId: 1005, assetScope: [9030, 9031, 9108], canManageSubscriptions: true, canApproveSubscriptions: true, canApproveDelegations: true, canViewData: true, grantedAt: '2024-09-01T10:00:00.000Z', status: 'Active' },
  // EQT (2023) -> Apex Group (1006)
  { id: 'PR-018', assetOwnerId: 2023, publisherId: 1006, assetScope: [9032, 9033], canManageSubscriptions: true, canApproveSubscriptions: false, canApproveDelegations: true, canViewData: true, grantedAt: '2024-09-15T10:00:00.000Z', status: 'Active' },
  // Permira (2024) -> State Street (1007)
  { id: 'PR-019', assetOwnerId: 2024, publisherId: 1007, assetScope: [9034, 9035], canManageSubscriptions: false, canApproveSubscriptions: true, canApproveDelegations: false, canViewData: true, grantedAt: '2024-10-01T10:00:00.000Z', status: 'Active' },
  // NEA (2035) -> Northern Trust (1008)
  { id: 'PR-020', assetOwnerId: 2035, publisherId: 1008, assetScope: [9041, 9042], canManageSubscriptions: true, canApproveSubscriptions: true, canApproveDelegations: true, canViewData: true, grantedAt: '2024-10-15T10:00:00.000Z', status: 'Active' },
  // Note: Sequoia (2002), Accel (2032), Lightspeed (2033), Greylock (2034) self-publish
]

// =============================================================================
// UNIFIED ACCESS GRANTS
// Merges PublishingRights and Delegations into a single model.
// - GP grants (canPublish=true): Converted from PublishingRights
// - LP grants (canPublish=false): Converted from Delegations
// =============================================================================
export const mockAccessGrants: AccessGrant[] = [
  // === GP GRANTS (converted from PublishingRights) ===
  // Kleiner Perkins (2001) -> Genii Admin Services (1001) for all KP assets
  { id: 'AG-001', grantorId: 2001, granteeId: 1001, assetScope: [9001, 9002, 9101], dataTypeScope: 'ALL', canPublish: true, canViewData: true, canManageSubscriptions: true, canApproveSubscriptions: true, canApproveDelegations: true, requiresApproval: false, approvalStatus: null, approvedById: null, approvedAt: null, status: 'Active', grantedAt: '2024-01-01T10:00:00.000Z' },
  // Andreessen Horowitz (2003) -> Carta Fund Admin (1003) for a16z assets
  { id: 'AG-002', grantorId: 2003, granteeId: 1003, assetScope: [9005, 9006, 9051, 9103], dataTypeScope: 'ALL', canPublish: true, canViewData: true, canManageSubscriptions: false, canApproveSubscriptions: false, canApproveDelegations: false, requiresApproval: false, approvalStatus: null, approvedById: null, approvedAt: null, status: 'Active', grantedAt: '2024-01-15T10:00:00.000Z' },
  // Benchmark (2004) -> Aduro Advisors (1002)
  { id: 'AG-003', grantorId: 2004, granteeId: 1002, assetScope: [9007, 9052], dataTypeScope: 'ALL', canPublish: true, canViewData: true, canManageSubscriptions: true, canApproveSubscriptions: false, canApproveDelegations: true, requiresApproval: false, approvalStatus: null, approvedById: null, approvedAt: null, status: 'Active', grantedAt: '2024-02-01T10:00:00.000Z' },
  // Insight Partners (2005) -> Aduro Advisors (1002)
  { id: 'AG-004', grantorId: 2005, granteeId: 1002, assetScope: [9008, 9053], dataTypeScope: 'ALL', canPublish: true, canViewData: true, canManageSubscriptions: false, canApproveSubscriptions: true, canApproveDelegations: false, requiresApproval: false, approvalStatus: null, approvedById: null, approvedAt: null, status: 'Active', grantedAt: '2024-02-15T10:00:00.000Z' },
  // Thoma Bravo (2006) -> Genii Admin Services (1001)
  { id: 'AG-005', grantorId: 2006, granteeId: 1001, assetScope: [9009, 9054], dataTypeScope: 'ALL', canPublish: true, canViewData: true, canManageSubscriptions: true, canApproveSubscriptions: true, canApproveDelegations: false, requiresApproval: false, approvalStatus: null, approvedById: null, approvedAt: null, status: 'Active', grantedAt: '2024-03-01T10:00:00.000Z' },
  // Vista Equity (2007) -> Aduro Advisors (1002)
  { id: 'AG-006', grantorId: 2007, granteeId: 1002, assetScope: [9010, 9055], dataTypeScope: 'ALL', canPublish: true, canViewData: true, canManageSubscriptions: false, canApproveSubscriptions: false, canApproveDelegations: false, requiresApproval: false, approvalStatus: null, approvedById: null, approvedAt: null, status: 'Active', grantedAt: '2024-03-15T10:00:00.000Z' },
  // Blackstone (2008) -> SS&C Technologies (1004)
  { id: 'AG-007', grantorId: 2008, granteeId: 1004, assetScope: [9011, 9012, 9104], dataTypeScope: 'ALL', canPublish: true, canViewData: true, canManageSubscriptions: true, canApproveSubscriptions: true, canApproveDelegations: true, requiresApproval: false, approvalStatus: null, approvedById: null, approvedAt: null, status: 'Active', grantedAt: '2024-04-01T10:00:00.000Z' },
  // KKR (2009) -> Citco Group (1005)
  { id: 'AG-008', grantorId: 2009, granteeId: 1005, assetScope: [9013, 9014, 9105], dataTypeScope: 'ALL', canPublish: true, canViewData: true, canManageSubscriptions: true, canApproveSubscriptions: true, canApproveDelegations: true, requiresApproval: false, approvalStatus: null, approvedById: null, approvedAt: null, status: 'Active', grantedAt: '2024-04-15T10:00:00.000Z' },
  // Apollo (2010) -> Apex Group (1006)
  { id: 'AG-009', grantorId: 2010, granteeId: 1006, assetScope: [9015, 9016], dataTypeScope: 'ALL', canPublish: true, canViewData: true, canManageSubscriptions: true, canApproveSubscriptions: false, canApproveDelegations: true, requiresApproval: false, approvalStatus: null, approvedById: null, approvedAt: null, status: 'Active', grantedAt: '2024-05-01T10:00:00.000Z' },
  // Carlyle (2011) -> State Street (1007)
  { id: 'AG-010', grantorId: 2011, granteeId: 1007, assetScope: [9017, 9018, 9106], dataTypeScope: 'ALL', canPublish: true, canViewData: true, canManageSubscriptions: true, canApproveSubscriptions: true, canApproveDelegations: true, requiresApproval: false, approvalStatus: null, approvedById: null, approvedAt: null, status: 'Active', grantedAt: '2024-05-15T10:00:00.000Z' },
  // Ares (2012) -> Northern Trust (1008)
  { id: 'AG-011', grantorId: 2012, granteeId: 1008, assetScope: [9019, 9020], dataTypeScope: 'ALL', canPublish: true, canViewData: true, canManageSubscriptions: false, canApproveSubscriptions: true, canApproveDelegations: false, requiresApproval: false, approvalStatus: null, approvedById: null, approvedAt: null, status: 'Active', grantedAt: '2024-06-01T10:00:00.000Z' },
  // TPG (2013) -> SEI Investments (1009)
  { id: 'AG-012', grantorId: 2013, granteeId: 1009, assetScope: [9021, 9022], dataTypeScope: 'ALL', canPublish: true, canViewData: true, canManageSubscriptions: true, canApproveSubscriptions: true, canApproveDelegations: true, requiresApproval: false, approvalStatus: null, approvedById: null, approvedAt: null, status: 'Active', grantedAt: '2024-06-15T10:00:00.000Z' },
  // Bain Capital (2014) -> BNY Mellon (1010)
  { id: 'AG-013', grantorId: 2014, granteeId: 1010, assetScope: [9023, 9024], dataTypeScope: 'ALL', canPublish: true, canViewData: true, canManageSubscriptions: true, canApproveSubscriptions: false, canApproveDelegations: true, requiresApproval: false, approvalStatus: null, approvedById: null, approvedAt: null, status: 'Active', grantedAt: '2024-07-01T10:00:00.000Z' },
  // Warburg Pincus (2015) -> U.S. Bank (1011)
  { id: 'AG-014', grantorId: 2015, granteeId: 1011, assetScope: [9025, 9026], dataTypeScope: 'ALL', canPublish: true, canViewData: true, canManageSubscriptions: true, canApproveSubscriptions: true, canApproveDelegations: false, requiresApproval: false, approvalStatus: null, approvedById: null, approvedAt: null, status: 'Active', grantedAt: '2024-07-15T10:00:00.000Z' },
  // Hellman & Friedman (2016) -> JTC Group (1012)
  { id: 'AG-015', grantorId: 2016, granteeId: 1012, assetScope: [9027, 9107], dataTypeScope: 'ALL', canPublish: true, canViewData: true, canManageSubscriptions: false, canApproveSubscriptions: false, canApproveDelegations: true, requiresApproval: false, approvalStatus: null, approvedById: null, approvedAt: null, status: 'Active', grantedAt: '2024-08-01T10:00:00.000Z' },
  // General Atlantic (2018) -> SS&C Technologies (1004)
  { id: 'AG-016', grantorId: 2018, granteeId: 1004, assetScope: [9028, 9029], dataTypeScope: 'ALL', canPublish: true, canViewData: true, canManageSubscriptions: true, canApproveSubscriptions: true, canApproveDelegations: false, requiresApproval: false, approvalStatus: null, approvedById: null, approvedAt: null, status: 'Active', grantedAt: '2024-08-15T10:00:00.000Z' },
  // Silver Lake (2021) -> Citco Group (1005)
  { id: 'AG-017', grantorId: 2021, granteeId: 1005, assetScope: [9030, 9031, 9108], dataTypeScope: 'ALL', canPublish: true, canViewData: true, canManageSubscriptions: true, canApproveSubscriptions: true, canApproveDelegations: true, requiresApproval: false, approvalStatus: null, approvedById: null, approvedAt: null, status: 'Active', grantedAt: '2024-09-01T10:00:00.000Z' },
  // EQT (2023) -> Apex Group (1006)
  { id: 'AG-018', grantorId: 2023, granteeId: 1006, assetScope: [9032, 9033], dataTypeScope: 'ALL', canPublish: true, canViewData: true, canManageSubscriptions: true, canApproveSubscriptions: false, canApproveDelegations: true, requiresApproval: false, approvalStatus: null, approvedById: null, approvedAt: null, status: 'Active', grantedAt: '2024-09-15T10:00:00.000Z' },
  // Permira (2024) -> State Street (1007)
  { id: 'AG-019', grantorId: 2024, granteeId: 1007, assetScope: [9034, 9035], dataTypeScope: 'ALL', canPublish: true, canViewData: true, canManageSubscriptions: false, canApproveSubscriptions: true, canApproveDelegations: false, requiresApproval: false, approvalStatus: null, approvedById: null, approvedAt: null, status: 'Active', grantedAt: '2024-10-01T10:00:00.000Z' },
  // NEA (2035) -> Northern Trust (1008)
  { id: 'AG-020', grantorId: 2035, granteeId: 1008, assetScope: [9041, 9042], dataTypeScope: 'ALL', canPublish: true, canViewData: true, canManageSubscriptions: true, canApproveSubscriptions: true, canApproveDelegations: true, requiresApproval: false, approvalStatus: null, approvedById: null, approvedAt: null, status: 'Active', grantedAt: '2024-10-15T10:00:00.000Z' },
  
  // === LP GRANTS (converted from Delegations) ===
  // STATE PENSION FUND DELEGATIONS
  // Ohio (3001) -> Chronograph for portfolio management
  { id: 'AG-101', grantorId: 3001, granteeId: 4003, assetScope: 'ALL', dataTypeScope: 'ALL', canPublish: false, canViewData: true, canManageSubscriptions: true, canApproveSubscriptions: false, canApproveDelegations: false, requiresApproval: false, approvalStatus: null, approvedById: null, approvedAt: null, status: 'Active', grantedAt: '2025-11-01T10:00:00.000Z' },
  // Ohio (3001) -> Deloitte for tax documents (pending GP approval)
  { id: 'AG-102', grantorId: 3001, granteeId: 4001, assetScope: [9001, 9002], dataTypeScope: ['K-1_TAX_FORM'], canPublish: false, canViewData: true, canManageSubscriptions: false, canApproveSubscriptions: false, canApproveDelegations: false, requiresApproval: true, approvalStatus: 'Pending', approvedById: null, approvedAt: null, status: 'Pending Approval', grantedAt: '2025-10-22T10:00:00.000Z' },
  // CalPERS (3007) -> Chronograph for full portfolio visibility
  { id: 'AG-103', grantorId: 3007, granteeId: 4003, assetScope: 'ALL', dataTypeScope: 'ALL', canPublish: false, canViewData: true, canManageSubscriptions: false, canApproveSubscriptions: false, canApproveDelegations: false, requiresApproval: false, approvalStatus: null, approvedById: null, approvedAt: null, status: 'Active', grantedAt: '2025-03-01T10:00:00.000Z' },
  // CalPERS (3007) -> Hamilton Lane for analytics
  { id: 'AG-104', grantorId: 3007, granteeId: 4014, assetScope: 'ALL', dataTypeScope: ['NAV_UPDATE', 'SOI_UPDATE', 'QUARTERLY_REPORT'], canPublish: false, canViewData: true, canManageSubscriptions: false, canApproveSubscriptions: false, canApproveDelegations: false, requiresApproval: false, approvalStatus: null, approvedById: null, approvedAt: null, status: 'Active', grantedAt: '2025-04-01T10:00:00.000Z' },
  // CalSTRS (3009) -> eFront for data aggregation
  { id: 'AG-105', grantorId: 3009, granteeId: 4011, assetScope: 'ALL', dataTypeScope: 'ALL', canPublish: false, canViewData: true, canManageSubscriptions: true, canApproveSubscriptions: false, canApproveDelegations: false, requiresApproval: false, approvalStatus: null, approvedById: null, approvedAt: null, status: 'Active', grantedAt: '2025-04-15T10:00:00.000Z' },
  // NYSTRS (3010) -> Burgiss for benchmarking
  { id: 'AG-106', grantorId: 3010, granteeId: 4006, assetScope: 'ALL', dataTypeScope: ['NAV_UPDATE', 'SOI_UPDATE'], canPublish: false, canViewData: true, canManageSubscriptions: false, canApproveSubscriptions: false, canApproveDelegations: false, requiresApproval: false, approvalStatus: null, approvedById: null, approvedAt: null, status: 'Active', grantedAt: '2025-05-01T10:00:00.000Z' },
  // Florida SBA (3011) -> Cambridge Associates for advisory
  { id: 'AG-107', grantorId: 3011, granteeId: 4013, assetScope: 'ALL', dataTypeScope: 'ALL', canPublish: false, canViewData: true, canManageSubscriptions: true, canApproveSubscriptions: false, canApproveDelegations: false, requiresApproval: false, approvalStatus: null, approvedById: null, approvedAt: null, status: 'Active', grantedAt: '2025-05-15T10:00:00.000Z' },
  // Teacher Retirement Texas (3008) -> Deloitte for K-1s (approved)
  { id: 'AG-108', grantorId: 3008, granteeId: 4001, assetScope: 'ALL', dataTypeScope: ['K-1_TAX_FORM'], canPublish: false, canViewData: true, canManageSubscriptions: false, canApproveSubscriptions: false, canApproveDelegations: false, requiresApproval: true, approvalStatus: 'Approved', approvedById: 512, approvedAt: '2025-04-01T10:00:00.000Z', status: 'Active', grantedAt: '2025-03-25T10:00:00.000Z' },
  // Virginia Retirement (3012) -> PwC for tax
  { id: 'AG-109', grantorId: 3012, granteeId: 4002, assetScope: 'ALL', dataTypeScope: ['K-1_TAX_FORM'], canPublish: false, canViewData: true, canManageSubscriptions: false, canApproveSubscriptions: false, canApproveDelegations: false, requiresApproval: false, approvalStatus: null, approvedById: null, approvedAt: null, status: 'Active', grantedAt: '2025-06-01T10:00:00.000Z' },
  // Washington State (3013) -> Mantle for data
  { id: 'AG-110', grantorId: 3013, granteeId: 4004, assetScope: 'ALL', dataTypeScope: 'ALL', canPublish: false, canViewData: true, canManageSubscriptions: false, canApproveSubscriptions: false, canApproveDelegations: false, requiresApproval: false, approvalStatus: null, approvedById: null, approvedAt: null, status: 'Active', grantedAt: '2025-06-15T10:00:00.000Z' },
  // Oregon (3014) -> Preqin for benchmarking
  { id: 'AG-111', grantorId: 3014, granteeId: 4012, assetScope: 'ALL', dataTypeScope: ['NAV_UPDATE', 'SOI_UPDATE'], canPublish: false, canViewData: true, canManageSubscriptions: false, canApproveSubscriptions: false, canApproveDelegations: false, requiresApproval: false, approvalStatus: null, approvedById: null, approvedAt: null, status: 'Active', grantedAt: '2025-07-01T10:00:00.000Z' },
  // Wisconsin (3015) -> EY for audit support
  { id: 'AG-112', grantorId: 3015, granteeId: 4007, assetScope: 'ALL', dataTypeScope: ['K-1_TAX_FORM', 'QUARTERLY_REPORT'], canPublish: false, canViewData: true, canManageSubscriptions: false, canApproveSubscriptions: false, canApproveDelegations: false, requiresApproval: false, approvalStatus: null, approvedById: null, approvedAt: null, status: 'Active', grantedAt: '2025-07-15T10:00:00.000Z' },
  
  // UNIVERSITY ENDOWMENT DELEGATIONS
  // Harvard (3002) -> Chronograph for full management
  { id: 'AG-113', grantorId: 3002, granteeId: 4003, assetScope: 'ALL', dataTypeScope: 'ALL', canPublish: false, canViewData: true, canManageSubscriptions: true, canApproveSubscriptions: false, canApproveDelegations: false, requiresApproval: false, approvalStatus: null, approvedById: null, approvedAt: null, status: 'Active', grantedAt: '2025-11-05T10:00:00.000Z' },
  // Harvard (3002) -> Mantle for financial data
  { id: 'AG-114', grantorId: 3002, granteeId: 4004, assetScope: [9001, 9002], dataTypeScope: ['CAPITAL_CALL', 'DISTRIBUTION'], canPublish: false, canViewData: true, canManageSubscriptions: false, canApproveSubscriptions: false, canApproveDelegations: false, requiresApproval: false, approvalStatus: null, approvedById: null, approvedAt: null, status: 'Active', grantedAt: '2025-02-01T10:00:00.000Z' },
  // Yale (3003) -> Burgiss for analytics
  { id: 'AG-115', grantorId: 3003, granteeId: 4006, assetScope: 'ALL', dataTypeScope: ['NAV_UPDATE', 'SOI_UPDATE'], canPublish: false, canViewData: true, canManageSubscriptions: false, canApproveSubscriptions: false, canApproveDelegations: false, requiresApproval: false, approvalStatus: null, approvedById: null, approvedAt: null, status: 'Active', grantedAt: '2025-02-15T10:00:00.000Z' },
  // Yale (3003) -> KPMG for audit
  { id: 'AG-116', grantorId: 3003, granteeId: 4008, assetScope: 'ALL', dataTypeScope: ['K-1_TAX_FORM'], canPublish: false, canViewData: true, canManageSubscriptions: false, canApproveSubscriptions: false, canApproveDelegations: false, requiresApproval: false, approvalStatus: null, approvedById: null, approvedAt: null, status: 'Active', grantedAt: '2025-08-01T10:00:00.000Z' },
  // Princeton (3019) -> Hamilton Lane for portfolio management
  { id: 'AG-117', grantorId: 3019, granteeId: 4014, assetScope: 'ALL', dataTypeScope: 'ALL', canPublish: false, canViewData: true, canManageSubscriptions: true, canApproveSubscriptions: false, canApproveDelegations: false, requiresApproval: false, approvalStatus: null, approvedById: null, approvedAt: null, status: 'Active', grantedAt: '2025-08-15T10:00:00.000Z' },
  // Stanford (3020) -> Cambridge Associates
  { id: 'AG-118', grantorId: 3020, granteeId: 4013, assetScope: 'ALL', dataTypeScope: 'ALL', canPublish: false, canViewData: true, canManageSubscriptions: false, canApproveSubscriptions: false, canApproveDelegations: false, requiresApproval: false, approvalStatus: null, approvedById: null, approvedAt: null, status: 'Active', grantedAt: '2025-09-01T10:00:00.000Z' },
  // MIT (3018) -> Carta LP Services
  { id: 'AG-119', grantorId: 3018, granteeId: 4005, assetScope: 'ALL', dataTypeScope: 'ALL', canPublish: false, canViewData: true, canManageSubscriptions: false, canApproveSubscriptions: false, canApproveDelegations: false, requiresApproval: false, approvalStatus: null, approvedById: null, approvedAt: null, status: 'Active', grantedAt: '2025-09-15T10:00:00.000Z' },
  // Duke (3021) -> Chronograph
  { id: 'AG-120', grantorId: 3021, granteeId: 4003, assetScope: 'ALL', dataTypeScope: 'ALL', canPublish: false, canViewData: true, canManageSubscriptions: false, canApproveSubscriptions: false, canApproveDelegations: false, requiresApproval: false, approvalStatus: null, approvedById: null, approvedAt: null, status: 'Active', grantedAt: '2025-10-01T10:00:00.000Z' },
  
  // SOVEREIGN WEALTH FUND DELEGATIONS
  // CPPIB (3004) -> PwC for tax (pending GP approval)
  { id: 'AG-121', grantorId: 3004, granteeId: 4002, assetScope: [9009], dataTypeScope: ['K-1_TAX_FORM'], canPublish: false, canViewData: true, canManageSubscriptions: false, canApproveSubscriptions: false, canApproveDelegations: false, requiresApproval: true, approvalStatus: 'Pending', approvedById: null, approvedAt: null, status: 'Pending Approval', grantedAt: '2025-10-20T10:00:00.000Z' },
  // CPPIB (3004) -> eFront for data
  { id: 'AG-122', grantorId: 3004, granteeId: 4011, assetScope: 'ALL', dataTypeScope: 'ALL', canPublish: false, canViewData: true, canManageSubscriptions: true, canApproveSubscriptions: false, canApproveDelegations: false, requiresApproval: false, approvalStatus: null, approvedById: null, approvedAt: null, status: 'Active', grantedAt: '2025-10-15T10:00:00.000Z' },
  // GIC (3006) -> Burgiss for benchmarking
  { id: 'AG-123', grantorId: 3006, granteeId: 4006, assetScope: 'ALL', dataTypeScope: ['NAV_UPDATE', 'SOI_UPDATE'], canPublish: false, canViewData: true, canManageSubscriptions: false, canApproveSubscriptions: false, canApproveDelegations: false, requiresApproval: false, approvalStatus: null, approvedById: null, approvedAt: null, status: 'Active', grantedAt: '2025-05-01T10:00:00.000Z' },
  // ADIA (3028) -> Hamilton Lane
  { id: 'AG-124', grantorId: 3028, granteeId: 4014, assetScope: 'ALL', dataTypeScope: 'ALL', canPublish: false, canViewData: true, canManageSubscriptions: true, canApproveSubscriptions: false, canApproveDelegations: false, requiresApproval: false, approvalStatus: null, approvedById: null, approvedAt: null, status: 'Active', grantedAt: '2025-06-01T10:00:00.000Z' },
  // Temasek (3030) -> Preqin
  { id: 'AG-125', grantorId: 3030, granteeId: 4012, assetScope: 'ALL', dataTypeScope: ['NAV_UPDATE', 'SOI_UPDATE'], canPublish: false, canViewData: true, canManageSubscriptions: false, canApproveSubscriptions: false, canApproveDelegations: false, requiresApproval: false, approvalStatus: null, approvedById: null, approvedAt: null, status: 'Active', grantedAt: '2025-07-01T10:00:00.000Z' },
  // Norway Fund (3029) -> Deloitte (approved)
  { id: 'AG-126', grantorId: 3029, granteeId: 4001, assetScope: 'ALL', dataTypeScope: ['K-1_TAX_FORM'], canPublish: false, canViewData: true, canManageSubscriptions: false, canApproveSubscriptions: false, canApproveDelegations: false, requiresApproval: true, approvalStatus: 'Approved', approvedById: 532, approvedAt: '2025-08-01T10:00:00.000Z', status: 'Active', grantedAt: '2025-07-15T10:00:00.000Z' },
  // QIA (3031) -> EY for audit
  { id: 'AG-127', grantorId: 3031, granteeId: 4007, assetScope: 'ALL', dataTypeScope: ['K-1_TAX_FORM', 'QUARTERLY_REPORT'], canPublish: false, canViewData: true, canManageSubscriptions: false, canApproveSubscriptions: false, canApproveDelegations: false, requiresApproval: false, approvalStatus: null, approvedById: null, approvedAt: null, status: 'Active', grantedAt: '2025-08-01T10:00:00.000Z' },
  
  // ASSET MANAGER DELEGATIONS
  // BlackRock (3005) -> Carta LP Services
  { id: 'AG-128', grantorId: 3005, granteeId: 4005, assetScope: [9005, 9006], dataTypeScope: 'ALL', canPublish: false, canViewData: true, canManageSubscriptions: false, canApproveSubscriptions: false, canApproveDelegations: false, requiresApproval: false, approvalStatus: null, approvedById: null, approvedAt: null, status: 'Active', grantedAt: '2025-03-15T10:00:00.000Z' },
  // BlackRock (3005) -> Chronograph for management
  { id: 'AG-129', grantorId: 3005, granteeId: 4003, assetScope: 'ALL', dataTypeScope: 'ALL', canPublish: false, canViewData: true, canManageSubscriptions: true, canApproveSubscriptions: false, canApproveDelegations: false, requiresApproval: false, approvalStatus: null, approvedById: null, approvedAt: null, status: 'Active', grantedAt: '2025-09-01T10:00:00.000Z' },
  
  // INSURANCE COMPANY DELEGATIONS
  // MetLife (3036) -> Mantle
  { id: 'AG-130', grantorId: 3036, granteeId: 4004, assetScope: 'ALL', dataTypeScope: 'ALL', canPublish: false, canViewData: true, canManageSubscriptions: false, canApproveSubscriptions: false, canApproveDelegations: false, requiresApproval: false, approvalStatus: null, approvedById: null, approvedAt: null, status: 'Active', grantedAt: '2025-10-01T10:00:00.000Z' },
  // Prudential (3037) -> PwC
  { id: 'AG-131', grantorId: 3037, granteeId: 4002, assetScope: 'ALL', dataTypeScope: ['K-1_TAX_FORM'], canPublish: false, canViewData: true, canManageSubscriptions: false, canApproveSubscriptions: false, canApproveDelegations: false, requiresApproval: false, approvalStatus: null, approvedById: null, approvedAt: null, status: 'Active', grantedAt: '2025-10-15T10:00:00.000Z' },
  // Allianz (3039) -> Grant Thornton
  { id: 'AG-132', grantorId: 3039, granteeId: 4009, assetScope: 'ALL', dataTypeScope: ['K-1_TAX_FORM', 'QUARTERLY_REPORT'], canPublish: false, canViewData: true, canManageSubscriptions: false, canApproveSubscriptions: false, canApproveDelegations: false, requiresApproval: false, approvalStatus: null, approvedById: null, approvedAt: null, status: 'Active', grantedAt: '2025-11-01T10:00:00.000Z' },
  
  // FAMILY OFFICE DELEGATIONS
  // Walton Enterprises (3041) -> Kirkland & Ellis (legal) (approved)
  { id: 'AG-133', grantorId: 3041, granteeId: 4018, assetScope: 'ALL', dataTypeScope: ['LEGAL_NOTICE'], canPublish: false, canViewData: true, canManageSubscriptions: false, canApproveSubscriptions: false, canApproveDelegations: false, requiresApproval: true, approvalStatus: 'Approved', approvedById: 545, approvedAt: '2025-06-01T10:00:00.000Z', status: 'Active', grantedAt: '2025-05-15T10:00:00.000Z' },
  // Cascade Investment (3043) -> Hamilton Lane
  { id: 'AG-134', grantorId: 3043, granteeId: 4014, assetScope: 'ALL', dataTypeScope: 'ALL', canPublish: false, canViewData: true, canManageSubscriptions: true, canApproveSubscriptions: false, canApproveDelegations: false, requiresApproval: false, approvalStatus: null, approvedById: null, approvedAt: null, status: 'Active', grantedAt: '2025-07-01T10:00:00.000Z' },
  
  // PENDING DELEGATIONS
  // Penn (3016) -> BDO for tax - pending GP approval
  { id: 'AG-135', grantorId: 3016, granteeId: 4010, assetScope: 'ALL', dataTypeScope: ['K-1_TAX_FORM'], canPublish: false, canViewData: true, canManageSubscriptions: false, canApproveSubscriptions: false, canApproveDelegations: false, requiresApproval: true, approvalStatus: 'Pending', approvedById: null, approvedAt: null, status: 'Pending Approval', grantedAt: '2025-11-15T10:00:00.000Z' },
  // Columbia (3023) -> Latham for legal - pending GP approval
  { id: 'AG-136', grantorId: 3023, granteeId: 4021, assetScope: [9011, 9012], dataTypeScope: ['LEGAL_NOTICE'], canPublish: false, canViewData: true, canManageSubscriptions: false, canApproveSubscriptions: false, canApproveDelegations: false, requiresApproval: true, approvalStatus: 'Pending', approvedById: null, approvedAt: null, status: 'Pending Approval', grantedAt: '2025-11-20T10:00:00.000Z' },
]
