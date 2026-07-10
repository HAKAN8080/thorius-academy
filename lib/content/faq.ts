export interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

export interface FaqCategory {
  id: string;
  title: string;
  items: FaqItem[];
}
