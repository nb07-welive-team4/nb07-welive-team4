export interface ResidentCsvRecord {
  building: string;
  unitNumber: string;
  name: string;
  contact: string;
  isHouseholder: string;
}

export interface CreateResidentDto {
  apartmentId?: string;
  building: string;
  unitNumber: string;
  name: string;
  contact: string;
  isHouseholder: "HOUSEHOLDER" | "MEMBER";
  residenceStatus?: "RESIDENCE" | "NO_RESIDENCE";
}
