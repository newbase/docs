/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./src/**/*.{js,jsx,ts,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                brand: {
                    50: '#c9e2fd62',
                    100: '#E6F1FD',
                    500: '#0a84ff',
                    600: '#0284c7',
                    700: '#0060c0',
                    900: '#0c4a6e',
                },
                green: {
                    50: '#EBFFEE',
                    100: '#CFF7D3',
                    500: '#30d158',
                    600: '#229945',
                    700: '#1E7E3F',
                    900: '#155735',
                },
                orange: {
                    50: '#fff7ed',
                    100: '#FFEDD5',
                    500: '#FF9F0A',
                    600: '#FF8C00',
                    700: '#FF7400',
                    900: '#FF4B00',
                },
                yellow: {
                    50: '#fff7ed',
                    100: '#FFEDD5',
                    500: '#FFD60A',
                    600: '#FFC200',
                    700: '#FFA800',
                    900: '#FF8400',
                },
                red: {
                    50: '#FFEFEE',
                    100: '#FFCDD2',
                    500: '#FF0000',
                    600: '#E60000',
                    700: '#CC0000',
                    900: '#990000',
                },
                indigo: {
                    50: '#eef2ff',
                    100: '#e0e7ff',
                    500: '#6366F1',
                    600: '#585BF2',
                    700: '#4A49E0',
                    900: '#2C2C86',
                },
                purple: {
                    50: '#BF5AF220',
                    100: '#BF5AF245',
                    500: '#BF5AF2',
                    600: '#A044BC',
                    700: '#8838A8',
                    900: '#571C80',
                },
            },
            borderRadius: {
                lg: 'var(--radius)',
                md: 'calc(var(--radius) - 2px)',
                sm: 'calc(var(--radius) - 4px)',
            },
            fontSize: {
                xs: '0.75rem',      // 12px
                sm: '0.875rem',     // 14px
                base: '1rem',       // 16px
                lg: '1.125rem',     // 18px
                xl: '1.25rem',      // 20px
                '2xl': '1.5rem',    // 24px
                '3xl': '1.875rem',  // 30px
                '4xl': '2.25rem',   // 36px
            },
            fontWeight: {
                normal: 'var(--font-weight-normal)',
                medium: 'var(--font-weight-medium)',
                semibold: 'var(--font-weight-semibold)',
                bold: 'var(--font-weight-bold)',
            },
            letterSpacing: {
                tight: 'var(--letter-spacing-tight)',
                normal: 'var(--letter-spacing-normal)',
                wide: 'var(--letter-spacing-wide)',
            },
        },
    },
    plugins: [require("tailwindcss-animate")],
};
