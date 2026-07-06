export const wordFormatter = (str: string | null | undefined): string => {
  //this outputs string values like "FY_3", like "Fy 3"
  if (!str || typeof str !== "string") {
    return "";
  }

  const words = str.split("_");

  const formattedWords = words.map((word) => {
    if (!isNaN(parseFloat(word))) {
      return word;
    }
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  });

  return formattedWords.join(" ");
};

export const dashRemover = (str: string | null | undefined): string => {
  //this outputs string values like "FY_3", like "FY 3"
  if (!str || typeof str !== "string") {
    return "";
  }

  const words = str.split("_");

  return words.join(" ");
};
