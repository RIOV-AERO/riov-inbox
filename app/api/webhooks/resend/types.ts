/**
 * Official Resend Webhook Attachment Metadata
 */
export interface ResendWebhookAttachmentMetadata {
  id: string;
  filename: string;
  content_type: string;
  content_disposition?: string | null;
  content_id?: string | null;
}

/**
 * Official Resend Webhook Received Email Data
 */
export interface ResendWebhookReceivedData {
  email_id: string;
  created_at: string;
  from: string;
  to: string[];
  cc: string[];
  bcc: string[];
  message_id: string;
  subject: string;
  received_for: string[];
  attachments?: ResendWebhookAttachmentMetadata[];
}

/**
 * Official Resend Webhook Event Payload
 */
export interface ResendWebhookEvent {
  type: "email.received";
  created_at: string;
  data: ResendWebhookReceivedData;
}

/**
 * Resend API Response: Retrieve Received Email
 * GET https://api.resend.com/emails/receiving/{email_id}
 */
export interface ResendReceivedEmailResponse {
  object: "email";
  id: string;
  from: string;
  to: string[];
  cc: string[];
  bcc: string[];
  reply_to: string[];
  subject: string;
  html: string | null;
  text: string | null;
  headers: Record<string, string>;
  message_id: string;
  created_at: string;
  received_for: string[];
  raw: {
    download_url: string;
    expires_at: string;
  };
  attachments: {
    id: string;
    filename: string;
    content_type: string;
    content_disposition: string | null;
    content_id: string | null;
    size: number;
  }[];
}

/**
 * Resend API Response: Retrieve Received Email Attachment
 * GET https://api.resend.com/emails/receiving/{email_id}/attachments/{id}
 */
export interface ResendReceivedEmailAttachmentDetails {
  object: "attachment";
  id: string;
  filename: string;
  size: number;
  content_type: string;
  content_disposition: string | null;
  content_id: string | null;
  download_url: string;
  expires_at: string;
}

export interface AttachmentDownloadRecord {
  filename: string;
  contentType: string;
  size: number;
  content: Uint8Array;
  url: string | null;
}
