export interface CertificateData {
  fullName: string;
  courseTitle: string;
  completionDate: Date;
}

export interface GenerateCertificateResult {
  success: true;
  certificate_url: string;
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
