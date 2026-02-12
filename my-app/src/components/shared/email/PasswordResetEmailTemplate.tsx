import React from 'react';
// Logo is now in public folder
const medicrewLogo = '/assets/images/brand/medicrew_blue_logo.png';

export const PasswordResetEmailTemplate: React.FC = () => {
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
                비밀번호가 기억나지 않으시다면<br />
                새로운 비밀번호로 변경해주세요.
            </p>

            {/* Action Button */}
            <div style={{ margin: '40px 0' }}>
                <a
                    href="http://localhost:3000/password-reset/new"
                    style={{
                        display: 'inline-block',
                        padding: '16px 40px',
                        backgroundColor: '#007bff',
                        color: '#ffffff',
                        fontSize: '18px',
                        fontWeight: 'bold',
                        textDecoration: 'none',
                        borderRadius: '100px',
                        boxShadow: '0 4px 14px 0 rgba(0, 123, 255, 0.39)'
                    }}
                >
                    비밀번호 변경하기
                </a>
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

export default PasswordResetEmailTemplate;
