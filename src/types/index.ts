export interface Birthday {
  id: string;
  name: string;
  note: string | null;
  day: number;
  month: number;
  year: number | null;
  created_at: string;
}

export interface UpcomingBirthday extends Birthday {
  age: number | null;
  days_until: number;
}

export interface PushSubscriptionRecord {
  id: string;
  endpoint: string;
  p256dh: string;
  auth: string;
  created_at: string;
}

export type BirthdayFormData = {
  name: string;
  note: string;
  day: number;
  month: number;
  year: number | null;
};
