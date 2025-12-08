export function getUserId() {
  let userId = localStorage.getItem("userId");

  if (!userId) {
    const now = new Date();
    const datePart = now
      .toISOString()
      .slice(2, 10) // "25-06-17"
      .replace(/-/g, ''); // → "250617"

    const randomPart = String(Math.floor(Math.random() * 90) + 10); // Random 2-digit number (10–99)

    userId = `WS${datePart}-${randomPart}`;
    localStorage.setItem("userId", userId);
  }

  return userId;
}
