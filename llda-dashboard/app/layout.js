import "./globals.css";
import Script from "next/script";

export const metadata = {
  title: "LLDA Water Quality Dashboard",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        />
      </head>
      <body>
        {children}

        {/* Load everything in guaranteed order */}
        <Script src="/assets/js/bootstrap.js" strategy="afterInteractive" />
      </body>
    </html>
  );
}
