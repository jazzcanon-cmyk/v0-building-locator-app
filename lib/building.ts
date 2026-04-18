export interface Building {
    id: number | string;
    name: string;
    description?: string;
    latitude: number;
    longitude: number;
    address?: string;
    floor?: number;
    category?: string;
    password?: string;
    memo?: string;
  }
  
  export interface BuildingWithDistance extends Building {
    distance: number; // meters
  }
  
  export type GeolocationErrorCode = 1 | 2 | 3;
  
  export interface GeolocationErrorInfo {
    code: GeolocationErrorCode;
    message: string;
    userMessage: string;
  }
  