const KEY = "toko:quiz-from-app";

export function markQuizOpenedFromApp(): void {
  try {
    sessionStorage.setItem(KEY, "1");
  } catch {
  }
}

export function quizOpenedFromApp(): boolean {
  try {
    return sessionStorage.getItem(KEY) === "1";
  } catch {
    return false;
  }
}
