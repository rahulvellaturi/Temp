import { User } from '@prisma/client';
interface WelcomeEmailData {
    firstName: string;
    email: string;
    temporaryPassword?: string;
}
interface PasswordResetData {
    firstName: string;
    resetToken: string;
    resetUrl: string;
}
interface ClaimUpdateData {
    firstName: string;
    claimNumber: string;
    status: string;
    message?: string;
}
declare class EmailService {
    private transporter;
    constructor();
    private sendEmail;
    sendWelcomeEmail(data: WelcomeEmailData): Promise<boolean>;
    sendPasswordResetEmail(data: PasswordResetData): Promise<boolean>;
    sendClaimUpdateEmail(email: string, data: ClaimUpdateData): Promise<boolean>;
    sendPolicyRenewalReminder(email: string, user: User, policyNumber: string, renewalDate: Date): Promise<boolean>;
    testConnection(): Promise<boolean>;
}
export declare const emailService: EmailService;
export default emailService;
//# sourceMappingURL=emailService.d.ts.map