export const PATIENT_COUGH_TEXT = "A patient coughs.";

const COUGH_MARKER_PATTERN =
  /^(?:\[(?:a\s+)?patient\s+coughs?\]|\((?:a\s+)?patient\s+coughs?\)|(?:a\s+)?patient\s+coughs?|cough|coughs|coughing|coughed|\[cough(?:ing|s|ed)?\]|\(cough(?:ing|s|ed)?\))\.?$/i;

export function normalizeTranscriptText(text: string) {
  const trimmedText = text.trim();
  if (!trimmedText) return text;

  return COUGH_MARKER_PATTERN.test(trimmedText) ? PATIENT_COUGH_TEXT : text;
}
