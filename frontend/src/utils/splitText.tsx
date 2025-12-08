export const splitCategory = (text: string) => {
  const words = text.trim().split(" ");
  if (words.length === 1) return text;

  const lastWord = words.pop(); // remove last word
  const firstPart = words.join(" "); // join the rest

  return (
    <>
      {firstPart}
      <br />
      {lastWord}
    </>
  );
};
