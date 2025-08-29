export interface Message {
  content: string;
  type: 'user' | 'assistant';
  timestamp: Date;
}
