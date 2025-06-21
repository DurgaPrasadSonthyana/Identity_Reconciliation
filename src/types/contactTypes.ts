export interface ContactRequest {
  email?: string;
  phoneNumber?: string;
}

export interface ContactResponse {
  primaryContactId: number;
  emails: string[];
  phoneNumbers: string[];
  secondaryContactIds: number[];
}
