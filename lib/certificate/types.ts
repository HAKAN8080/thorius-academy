export interface CertificateData {
  fullName: string;
  courseTitle: string;
  completionDate: Date;
  certificateId: string;
  verifyUrl: string;
  qrDataUrl?: string;
}

export interface GenerateCertificateResult {
  success: true;
  certificate_url: string;
  certificate_id: string;
  emailed: boolean;
}

export interface GenerateCertificateError {
  success: false;
  error: string;
  status: number;
}

export type GenerateCertificateResponse =
  | GenerateCertificateResult
  | GenerateCertificateError;
