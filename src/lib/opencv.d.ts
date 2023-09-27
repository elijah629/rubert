export {}

type cv = typeof import("mirada/dist/src/types/opencv/_types");

declare global {
  interface Window {
    cv: cv;
  }
}
