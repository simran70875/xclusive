/** @type {import('tailwindcss').Config} */
export default {
    content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
    theme: {
        extend: {
            colors: {
                textGrey: '#3c484f', // Custom gray to replace gray-700
                // Add more custom colors here
            },
        },
    },
    plugins: [],
};
