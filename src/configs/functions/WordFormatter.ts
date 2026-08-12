import { NOT_APPLICABLE } from "../const";

export const wordFormatter = (str: string | null | undefined): string => {
  if (!str || typeof str !== "string") {
    return NOT_APPLICABLE;
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
  if (!str || typeof str !== "string") {
    return NOT_APPLICABLE;
  }

  const words = str.split("_");

  return words.join(" ");
};

export const singularize = (label: string): string => {
  if (/ies$/i.test(label)) return label.replace(/ies$/i, "y");
  if (/s$/i.test(label)) return label.replace(/s$/i, "");
  return label;
};
