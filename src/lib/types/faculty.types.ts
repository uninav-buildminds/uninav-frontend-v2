import { Department } from "./department.types";

export interface Faculty {
  id: string;
  name: string;
  description?: string;
  departments?: Department[];
}