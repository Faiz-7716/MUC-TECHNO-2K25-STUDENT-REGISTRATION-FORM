import { Timestamp } from "firebase/firestore";

export const departments = ["B.Sc. Computer Science", "B.Sc. Data Science", "BCA", "B.Com. CS"] as const;
export const years = ["1st Year", "2nd Year", "3rd Year"] as const;
export const events = ["Tech Quiz", "Bug Blaster", "Panel Debate", "Web Wizards", "Design Duel"] as const;
export const teamEvents = ["Panel Debate", "Web Wizards"];

export type Department = typeof departments[number];
export type Year = typeof years[number];
export type EventName = typeof events[number];

export type Registration = {
  id: string;
  name: string;
  rollNumber: string;
  department: Department;
  year: Year;
  mobileNumber: string;
  event: EventName;
  teamMember2?: string;
  createdAt: Timestamp;
};
