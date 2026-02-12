import React from 'react';
import {
    VerificationEmailTemplate,
    PasswordResetEmailTemplate,
    EmailChangeEmailTemplate
} from '@/components/shared/email';

export default function EmailPreview(): React.ReactElement {
    return (
        <div className="min-h-screen bg-gray-100 flex flex-col items-center gap-10 p-10">
            {/* Verification Email */}
            <div className="bg-white shadow-2xl rounded-xl overflow-hidden shadow-gray-200/50 w-full max-w-[640px]">
                <div className="bg-gray-50 border-b border-gray-100 px-6 py-3 flex justify-between items-center text-xs text-gray-400">
                    <span>Email Preview: Verification Code</span>
                    <span className="bg-gray-200 px-2 py-0.5 rounded text-gray-500">HTML Standard</span>
                </div>
                <VerificationEmailTemplate code="123456" />
            </div>

            {/* Password Reset Email */}
            <div className="bg-white shadow-2xl rounded-xl overflow-hidden shadow-gray-200/50 w-full max-w-[640px]">
                <div className="bg-gray-50 border-b border-gray-100 px-6 py-3 flex justify-between items-center text-xs text-gray-400">
                    <span>Email Preview: Password Reset Link</span>
                    <span className="bg-gray-300 px-2 py-0.5 rounded text-gray-700 font-bold">NEW</span>
                </div>
                <PasswordResetEmailTemplate />
            </div>

            {/* Email Change Email */}
            <div className="bg-white shadow-2xl rounded-xl overflow-hidden shadow-gray-200/50 w-full max-w-[640px]">
                <div className="bg-gray-50 border-b border-gray-100 px-6 py-3 flex justify-between items-center text-xs text-gray-400">
                    <span>Email Preview: Email Change</span>
                    <span className="bg-gray-300 px-2 py-0.5 rounded text-gray-700 font-bold">NEW</span>
                </div>
                <EmailChangeEmailTemplate />
            </div>
        </div>
    );
}
