/**
 * Google Drive API Key Rotation Service
 * Handles frontend API key rotation with localStorage persistence
 */

import { ENV, GDRIVE_API_KEYS_ARRAY } from "@/lib/env.config";

const STORAGE_KEY = "gdrive_api_key_index";
const API_KEYS = GDRIVE_API_KEYS_ARRAY;

class GDriveKeyRotation {
  private currentIndex: number;

  constructor() {
    // Load last working key index from localStorage
    const stored = localStorage.getItem(STORAGE_KEY);
    this.currentIndex = stored ? parseInt(stored, 10) : 0;

    // Ensure index is valid
    if (this.currentIndex >= API_KEYS.length) {
      this.currentIndex = 0;
    }
  }

  getCurrentApiKey(): string | null {
    return API_KEYS[this.currentIndex] || null;
  }

  async rotateKey(): Promise<string | null> {
    try {
      // Ask backend for next key index
      const response = await fetch(
        `${ENV.API_BASE_URL}/gdrive/key-rotation?currentIndex=${this.currentIndex}`
      );

      if (!response.ok) {
        throw new Error("Failed to get next key index");
      }

      const data = await response.json();
      const nextIndex = data.data.nextIndex;

      // Update current index
      this.currentIndex = nextIndex;
      localStorage.setItem(STORAGE_KEY, this.currentIndex.toString());

      return this.getCurrentApiKey();
    } catch (error) {
      console.error("Key rotation failed:", error);
      // Fallback: manual rotation
      this.currentIndex = (this.currentIndex + 1) % API_KEYS.length;
      localStorage.setItem(STORAGE_KEY, this.currentIndex.toString());
      return this.getCurrentApiKey();
    }
  }

  async fetchWithRotation<T>(
    urlBuilder: (apiKey: string) => string,
    options?: RequestInit
  ): Promise<Response> {
    let lastError: Error | null = null;
    const maxRetries = API_KEYS.length;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      const apiKey = this.getCurrentApiKey();
      if (!apiKey) {
        throw new Error("No API keys available");
      }

      try {
        const url = urlBuilder(apiKey);
        const response = await fetch(url, options);

        // Check for rate limiting
        if (response.status === 429 || response.status === 403) {
          console.warn(
            `API key ${this.currentIndex} rate limited, rotating...`
          );
          await this.rotateKey();
          lastError = new Error(`Rate limited: ${response.status}`);
          continue;
        }

        if (!response.ok) {
          lastError = new Error(
            `HTTP ${response.status}: ${response.statusText}`
          );
          continue;
        }

        return response;
      } catch (error) {
        lastError = error as Error;
        console.warn(`API key ${this.currentIndex} failed, rotating...`);
        await this.rotateKey();
      }
    }

    throw lastError || new Error("All API keys exhausted");
  }
}

export const gdriveRotation = new GDriveKeyRotation();
