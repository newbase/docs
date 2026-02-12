import React from 'react';
// Logo is now in public folder
const medicrewLogo = '/assets/images/brand/medicrew_blue_logo.png';

interface VerificationEmailProps {
    code: string;
}

export const VerificationEmailTemplate: React.FC<VerificationEmailProps> = ({ code = '000000' }) => {
    return (
        <div style={{
            fontFamily: "'Pretendard', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
            maxWidth: '600px',
            margin: '0 auto',
            padding: '40px 20px',
            textAlign: 'center',
            backgroundColor: '#ffffff',
            color: '#111827'
        }}>
            {/* Header Logo */}
            <div style={{ marginBottom: '40px' }}>
                <img
                    src={medicrewLogo}
                    alt="medicrew"
                    style={{ height: '32px', width: 'auto' }}
                />
            </div>

            {/* Content Text */}
            <p style={{
                fontSize: '18px',
                lineHeight: '1.6',
                color: '#374151',
                margin: '0 0 40px 0',
                fontWeight: '500'
            }}>
                아래 인증번호 6자리를 입력하시고<br />
                정회원 인증을 완료해주세요.
            </p>

            {/* Verification Code */}
            <div style={{
                fontSize: '48px',
                fontWeight: '800',
                letterSpacing: '10px',
                color: '#1f2937',
                padding: '30px 0',
                margin: '40px 0',
                borderTop: '1px solid #f3f4f6',
                borderBottom: '1px solid #f3f4f6'
            }}>
                {code}
            </div>

            {/* Footer Logo & Tagline */}
            <div style={{ marginTop: '60px' }}>
                <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '48px',
                    height: '48px',
                    backgroundColor: '#007bff',
                    borderRadius: '50%',
                    marginBottom: '15px'
                }}>
                    <span style={{
                        color: 'white',
                        fontSize: '24px',
                        fontWeight: 'bold',
                        lineHeight: '1'
                    }}>m</span>
                </div>
                <p style={{
                    fontSize: '14px',
                    color: '#007bff',
                    fontWeight: '600',
                    margin: '0'
                }}>
                    AI patient first, Real patient safer
                </p>
            </div>
        </div>
    );
};

export default VerificationEmailTemplate;
