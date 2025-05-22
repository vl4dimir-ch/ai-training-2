import { ApiProperty } from '@nestjs/swagger';

export class GeoLocation {
  @ApiProperty({ example: '-37.3159', description: 'Latitude coordinate' })
  lat: string;

  @ApiProperty({ example: '81.1496', description: 'Longitude coordinate' })
  lng: string;
}

export class Address {
  @ApiProperty({ example: 'Kulas Light', description: 'Street name' })
  street: string;

  @ApiProperty({ example: 'Apt. 556', description: 'Suite number or additional address info' })
  suite: string;

  @ApiProperty({ example: 'Gwenborough', description: 'City name' })
  city: string;

  @ApiProperty({ example: '92998-3874', description: 'Postal code' })
  zipcode: string;

  @ApiProperty({ type: GeoLocation, description: 'Geographic coordinates' })
  geo: GeoLocation;
}

export class Company {
  @ApiProperty({ example: 'Romaguera-Crona', description: 'Company name' })
  name: string;

  @ApiProperty({ example: 'Multi-layered client-server neural-net', description: 'Company catch phrase' })
  catchPhrase: string;

  @ApiProperty({ example: 'harness real-time e-markets', description: 'Company business description' })
  bs: string;
}

export class UserResponse {
  @ApiProperty({ example: 1, description: 'The unique identifier of the user' })
  id: number;

  @ApiProperty({ example: 'Leanne Graham', description: 'Full name of the user' })
  name: string;

  @ApiProperty({ example: 'Bret', description: 'Username for the account' })
  username: string;

  @ApiProperty({ example: 'sincere@april.biz', description: 'Email address' })
  email: string;

  @ApiProperty({ example: '1-770-736-8031 x56442', description: 'Contact phone number' })
  phone: string;

  @ApiProperty({ example: 'hildegard.org', description: 'Personal or business website' })
  website: string;

  @ApiProperty({ description: 'Timestamp of when the user was created' })
  createdAt: Date;

  @ApiProperty({ description: 'Timestamp of the last update to the user' })
  updatedAt: Date;

  @ApiProperty({ type: Address, nullable: true, description: 'User\'s address information' })
  address: Address | null;

  @ApiProperty({ type: Company, nullable: true, description: 'User\'s company information' })
  company: Company | null;
} 