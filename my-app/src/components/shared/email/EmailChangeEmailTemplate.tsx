import React from 'react';

export default function EmailChangeEmailTemplate(): React.ReactElement {
    const verificationCode = '123456';

    return (
        <div style={{
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
            maxWidth: '600px',
            margin: '0 auto',
            backgroundColor: '#ffffff'
        }}>
            {/* Email Container */}
            <div style={{ padding: '40px 20px' }}>
                {/* Logo */}
                <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                    <div style={{
                        display: 'inline-block',
                        fontSize: '28px',
                        fontWeight: 'bold',
                        color: '#0085FF',
                        letterSpacing: '-0.5px'
                    }}>
                        Medicrew
                    </div>
                </div>

                {/* Main Content */}
                <div style={{
                    backgroundColor: '#F8FAFB',
                    borderRadius: '16px',
                    padding: '40px 30px',
                    textAlign: 'center'
                }}>
                    <h1 style={{
                        fontSize: '24px',
                        fontWeight: 'bold',
                        color: '#1F2937',
                        marginBottom: '16px',
                        marginTop: '0'
                    }}>
                        이메일 변경 인증
                    </h1>

                    <p style={{
                        fontSize: '15px',
                        color: '#6B7280',
                        lineHeight: '1.6',
                        marginBottom: '32px'
                    }}>
                        이메일 변경을 완료하기 위해<br />
                        아래 인증번호를 입력해주세요.
                    </p>

                    {/* Verification Code Box */}
                    <div style={{
                        backgroundColor: '#ffffff',
                        borderRadius: '12px',
                        padding: '24px',
                        marginBottom: '24px',
                        border: '2px solid #E5E7EB'
                    }}>
                        <div style={{
                            fontSize: '13px',
                            color: '#9CA3AF',
                            marginBottom: '8px',
                            fontWeight: '500'
                        }}>
                            인증번호
                        </div>
                        <div style={{
                            fontSize: '36px',
                            fontWeight: 'bold',
                            color: '#0085FF',
                            letterSpacing: '4px'
                        }}>
                            {verificationCode}
                        </div>
                    </div>

                    <p style={{
                        fontSize: '13px',
                        color: '#9CA3AF',
                        lineHeight: '1.5',
                        margin: '0'
                    }}>
                        이 인증번호는 10분간 유효합니다.
                    </p>
                </div>

                {/* Footer */}
                <div style={{
                    textAlign: 'center',
                    marginTop: '40px',
                    paddingTop: '24px',
                    borderTop: '1px solid #E5E7EB'
                }}>
                    <p style={{
                        fontSize: '12px',
                        color: '#9CA3AF',
                        margin: '0 0 8px 0'
                    }}>
                        AI patient first, Real patient safer
                    </p>
                    <p style={{
                        fontSize: '11px',
                        color: '#D1D5DB',
                        margin: '0'
                    }}>
                        © 2024 Medicrew. All rights reserved.
                    </p>
                </div>
            </div>
        </div>
    );
}
