const withMT = require("@material-tailwind/react/utils/withMT");

/** @type {import('tailwindcss').Config} */
export default withMT({
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        poppins: ["Poppins", "sans-serif"],
        roboto: ["Roboto", "sans-serif"],
        raleway: ["Raleway", "sans-serif"],
        montserrat: ["Montserrat", "sans-serif"],
      },
      colors: {
        "stratx-sidebar-bg" : "#FF6B00",
        "stratx-accent-blue" : "#b3cef2",
        "stratx-accent-cherry" : "#FF6B00",
        "stratx-accent-white" : "#FBFDFF",
        "stratx-main-bg" : "#1F1F1F",
        "stratx-card-bg" : "#353535",
        primary: "#FF6B00",
        seccondary: "#0f111c",
        accent: "#b0cdf2",
        page: "#1F1F1F",
      },
    },
  },
  plugins: [],
});
