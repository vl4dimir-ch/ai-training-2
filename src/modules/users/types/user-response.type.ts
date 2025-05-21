export type GeoLocationType = {
  lat: string;
  lng: string;
};

export type AddressType = {
  street: string;
  suite: string;
  city: string;
  zipcode: string;
  geo: GeoLocationType;
};

export type CompanyType = {
  name: string;
  catchPhrase: string;
  bs: string;
};

export type UserResponse = {
  id: number;
  name: string;
  username: string;
  email: string;
  phone: string;
  website: string;
  createdAt: Date;
  updatedAt: Date;
  address: AddressType | null;
  company: CompanyType | null;
}; 