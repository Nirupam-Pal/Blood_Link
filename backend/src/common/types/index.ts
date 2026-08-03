import { Request } from 'express';

export type JwtPayload = {
  sub: string;
  email: string;
  role: string;
};

export type AuthenticatedUser = {
  id: string;
  email: string;
  role: string;
};


export type AuthenticatedRequest = Request & { user?: AuthenticatedUser };

export type GeoPoint = {
  type: 'Point';
  coordinates: [number, number]; //[longitude, latitude]
};
