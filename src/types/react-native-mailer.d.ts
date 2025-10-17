// src/types/react-native-mailer.d.ts
declare module 'react-native-mailer' {
  export interface MailerOptions {
    subject: string;
    recipients: string[];
    body: string;
    isHTML?: boolean;
    attachments?: Array<{
      path: string;
      type: string;
      name: string;
    }>;
  }

  export type MailerCallback = (error: any, event: string) => void;

  const Mailer: {
    mail: (options: MailerOptions, callback: MailerCallback) => Promise<void>;
  };

  export default Mailer;
}
