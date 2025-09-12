import { API_BASE_URL } from "@/lib/utils";
import axios from "redaxios";

export const httpClient = axios.create({ baseURL: API_BASE_URL, withCredentials: true });
