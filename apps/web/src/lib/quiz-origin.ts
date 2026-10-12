// Remembers, for this tab only, that the parent opened the public quiz from
// inside the app (the /suivi hub). The quiz lives outside the app shell and
// never loads better-auth, so this flag is how its header knows to offer a
// way back. sessionStorage: gone when the tab closes, nothing sent anywhere.

const KEY = "toko:quiz-from-app";

export function markQuizOpenedFromApp(): void {
  try {
    sessionStorage.setItem(KEY, "1");
  } catch {
    // Private mode or storage disabled: the quiz still works, without the link.
  }
}

export function quizOpenedFromApp(): boolean {
  try {
    return sessionStorage.getItem(KEY) === "1";
  } catch {
    return false;
  }
}
