export interface SupportedAirport {
  code: string;
  label: string;
}

export const SUPPORTED_AIRPORTS: SupportedAirport[] = [
  { code: "", label: "All Airports (20 Hubs)" },
  { code: "DEL", label: "DEL - Indira Gandhi Int'l, Delhi" },
  { code: "BOM", label: "BOM - Chhatrapati Shivaji Maharaj, Mumbai" },
  { code: "BLR", label: "BLR - Kempegowda Int'l, Bengaluru" },
  { code: "LKO", label: "LKO - Chaudhary Charan Singh, Lucknow" },
  { code: "HYD", label: "HYD - Rajiv Gandhi Int'l, Hyderabad" },
  { code: "CCU", label: "CCU - Netaji Subhash Chandra Bose, Kolkata" },
  { code: "MAA", label: "MAA - Chennai Int'l, Chennai" },
  { code: "AMD", label: "AMD - Sardar Vallabhbhai Patel, Ahmedabad" },
  { code: "GOI", label: "GOI - Dabolim Airport, Goa" },
  { code: "GOX", label: "GOX - Manohar Int'l, Mopa Goa" },
  { code: "COK", label: "COK - Cochin Int'l, Kochi" },
  { code: "ATQ", label: "ATQ - Sri Guru Ram Dass Jee, Amritsar" },
  { code: "JAI", label: "JAI - Jaipur Int'l, Jaipur" },
  { code: "IXC", label: "IXC - Shaheed Bhagat Singh, Chandigarh" },
  { code: "BBI", label: "BBI - Biju Patnaik Int'l, Bhubaneswar" },
  { code: "TRV", label: "TRV - Thiruvananthapuram Int'l" },
  { code: "VTZ", label: "VTZ - Visakhapatnam Int'l" },
  { code: "IXE", label: "IXE - Mangaluru Int'l" },
  { code: "IXR", label: "IXR - Birsa Munda, Ranchi" },
  { code: "GAU", label: "GAU - Lokpriya Gopinath Bordoloi, Guwahati" },
];

