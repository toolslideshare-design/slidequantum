export type BlogPost = {
  title: string;
  slug: string;
  content: string;
  seoDescription: string;
  date: string;
};

export type SiteSettings = {
  name: string;
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
  url: string;
};

export type HeadCodeSettings = {
  code: string;
  updatedAt: string | null;
};

export type BodyCodeSettings = {
  code: string;
  updatedAt: string | null;
};

export type FaviconSettings = {
  href: string;
  fileName: string;
  contentType: string;
  updatedAt: string | null;
};

export type AiSettings = {
  geminiApiKey: string;
  updatedAt: string | null;
};

export type LayoutLink = {
  label: string;
  href: string;
};

export type FooterLinkGroup = {
  title: string;
  links: LayoutLink[];
};

export type LayoutSettings = {
  header: {
    logoText: string;
    navigationLinks: LayoutLink[];
    loginButtonText: string;
    ctaButtonText: string;
  };
  footer: {
    description: string;
    linkGroups: FooterLinkGroup[];
    copyrightText: string;
    privacyPolicyLink: LayoutLink;
    contactLink: LayoutLink;
    socialLinks: LayoutLink[];
  };
};

export type PublicUser = {
  id: string;
  name: string;
  email: string;
};

export type StoredUser = PublicUser & {
  passwordHash: string;
  salt: string;
  createdAt: string;
};

export type DownloadHistoryItem = {
  id: string;
  userId: string;
  title: string;
  slideshareUrl: string;
  format: "PDF" | "PPT";
  downloadUrl?: string;
  downloadedAt: string;
};

export type SavedPresentation = {
  id: string;
  userId: string;
  title: string;
  slideshareUrl: string;
  thumbnailUrl: string;
  savedAt: string;
};

export type AiPresentationSummary = {
  shortSummary: string;
  keyPoints: string[];
  mainTopics: string[];
};

export type AiPresentationNotes = {
  studyNotes: string[];
  importantConcepts: string[];
  quickRevision: string;
};

export type AiQuizQuestion = {
  type: "mcq" | "true_false" | "short_answer";
  question: string;
  options: string[];
  correctAnswer: string;
};

export type AiPresentationQuiz = {
  questions: AiQuizQuestion[];
};

export type AiExplainerMode = "beginner" | "student" | "professional";

export type AiExplainerSection = {
  title: string;
  explanation: string;
};

export type AiPresentationExplainer = {
  simpleExplanation: string;
  sections: AiExplainerSection[];
  realWorldMeaning: string;
  easyLearningMode: string;
  suggestedQuestions: string[];
  ttsText: string;
};

export type AiExplainerFollowUp = {
  answer: string;
  suggestedQuestions: string[];
};

export type HomepageContentData = {
  heroContent: {
    badge: string;
    headline: string;
    subtitle: string;
    whatIsHeading: string;
    whatIs: string;
    urlPlaceholder: string;
    downloadLabel: string;
    previewLabel: string;
  };
  howItWorksContent: {
    heading: string;
    intro: string;
    closing: string;
    steps: { title: string; description: string }[];
  };
  differentiatorsContent: {
    heading: string;
    body: string;
  };
  formatsContent: {
    heading: string;
    intro: string;
    items: { title: string; description: string }[];
  };
  featuresContent: {
    heading: string;
    intro: string;
    items: { title: string; description: string; icon: string }[];
  };
  trustedUsersContent: {
    heading: string;
    intro: string;
    items: { title: string; description: string; icon: string }[];
  };
  comparisonContent: {
    heading: string;
    subheading: string;
    prosColumnLabel: string;
    consColumnLabel: string;
    rows: { pro: string; con: string }[];
  };
  conclusionContent: {
    heading: string;
    body: string;
  };
  faqContent: {
    heading: string;
    items: { question: string; answer: string }[];
  };
};
