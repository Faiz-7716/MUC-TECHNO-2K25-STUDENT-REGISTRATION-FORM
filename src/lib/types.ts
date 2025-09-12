import { Timestamp } from "firebase/firestore";

export const departments = ["B.Sc. Computer Science", "B.Sc. Data Science", "BCA", "B.Com. CS", "B.Sc. Maths", "B.Com. General", "B.Com. Corporate Secretaryship", "BA Economics", "BBA"] as const;
export const years = ["1st Year", "2nd Year", "3rd Year"] as const;
export const events = ["Tech Quiz", "Bug Blaster", "Panel Debate", "Web Wizards", "Design Duel"] as const;
export const teamEvents = ["Panel Debate", "Web Wizards"];

export const REGISTRATION_FEE = 50;

export type Department = typeof departments[number];
export type Year = typeof years[number];
export type EventName = typeof events[number];

export const eventTimes: Record<EventName, string> = {
    "Tech Quiz": "10:15-11:15",
    "Bug Blaster": "10:15-11:15",
    "Panel Debate": "11:15-12:15",
    "Web Wizards": "11:15-12:00",
    "Design Duel": "11:15-11:45"
};

export interface RegistrationData {
  name: string;
  rollNumber: string;
  department: Department;
  year: Year;
  mobileNumber: string;
  event1: EventName;
  event2?: EventName;
  teamMember2?: string;
  feePaid: boolean;
}

export interface Registration extends RegistrationData {
  id: string;
  createdAt: Timestamp;
};
