export interface User {
  id: string;
  name: string;
  email: string;
  preferred_citation_style?: string;
  preferred_template?: string;
  preferred_writing_style?: string;
}

export type ReviewType =
  | 'systematic'
  | 'narrative'
  | 'scoping'
  | 'meta-analysis'
  | 'critical'
  | 'state-of-the-art'
  | 'bibliometric';

export type CitationStyle =
  | 'IEEE'
  | 'APA'
  | 'MLA'
  | 'Chicago'
  | 'Harvard'
  | 'Vancouver'
  | 'BibTeX';

export type WritingStyle = 'academic' | 'natural' | 'concise';

export type Template =
  | 'IEEE Conference'
  | 'IEEE Journal'
  | 'APA Journal'
  | 'ACM Conference'
  | 'Springer Nature'
  | 'Elsevier'
  | 'Harvard Style'
  | 'Standard Academic';

export interface Phase {
  name: string;
  label: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  progress: number;
}

export interface Citation {
  key?: string;
  title: string;
  authors?: string[];
  year?: number | null;
  doi?: string | null;
  journal?: string | null;
  url?: string | null;
  verified: boolean;
  status?: 'VERIFIED' | 'PARTIAL' | 'REJECTED';
  confidence?: number;
  bibtex?: string;
}

export interface ReviewResult {
  content: string;
  polished_content?: string;
  citations: Citation[];
  confidence: number;
  burstiness: number;
  banned_words: string[];
  bibtex?: string;
  task_id?: string;
  topic?: string;
}

export interface WSMessage {
  type: string;
  step?: string;
  progress?: number;
  data?: {
    subtopics?: string[];
    papers_found?: number;
    citations_verified?: number;
    burstiness?: number;
    [key: string]: any;
  };
  [key: string]: any;
}
