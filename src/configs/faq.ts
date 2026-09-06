export interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

export const FAQS: FaqItem[] = [
  {
    id: "f-1",
    question: "Do I need an account to browse?",
    answer:
      "No. Anyone can search the directory and open group pages. An account is only needed to add a group, to report a listing, or to open links whose owner restricted them to signed-in members.",
  },
  {
    id: "f-2",
    question: "What do I need to list a group?",
    answer:
      "A verified email address and a verified WhatsApp number. You will receive a six-digit code by email, then a second code on WhatsApp. Once both are confirmed your listing publishes to the directory immediately.",
  },
  {
    id: "f-3",
    question: "How does the search actually work?",
    answer:
      'Ask the way you would ask a friend - "roofing contractors in Lakewood with financing". The query is parsed for topic, place, and group size, and every result carries a confidence score. Results are ordered by that score, highest first.',
  },
  {
    id: "f-4",
    question: "Can I hide my group link from the public?",
    answer:
      'Yes. Turn on "restrict to signed-in members" when you submit. The listing stays fully visible and searchable, but the join link only appears to signed-in members.',
  },
  {
    id: "f-5",
    question: "How are listings moderated?",
    answer:
      "Any signed-in member can report a group for a broken link or inappropriate content. Reports are reviewed by moderators, and a listing that passes the report threshold is suspended automatically pending review.",
  },
  {
    id: "f-6",
    question: "What happens to a group that gets suspended?",
    answer:
      "It disappears from the directory and from search results straight away. The owner can correct the listing and resubmit it with a note to the moderation team.",
  },
];
