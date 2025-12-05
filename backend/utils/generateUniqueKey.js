exports.generateUniqueKey = async () => {
  const randomNum = Math.floor(Math.random() * 1000000);
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const randomAlphabet = alphabet[Math.floor(Math.random() * alphabet.length)];
  const paddedRandomNum = String(randomNum).padStart(6, "0");
  return `SL-${randomAlphabet}${paddedRandomNum}`;
};
