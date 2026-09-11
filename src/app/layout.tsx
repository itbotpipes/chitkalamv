import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import BackgroundMusic from "./BackgroundMusic";
import { ToastProvider } from "./ToastNotification";

const cabinet = localFont({
  src: "../../public/CabinetGrotesk_Complete/Fonts/WEB/fonts/CabinetGrotesk-Variable.woff2",
  variable: "--font-cabinet",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Studio Chitkala - Where Thought Finds Form",
  description: "Studio Chitkala is a creative branding, design and motion studio based in Surat.",
  icons: {
    icon: '/favicon.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${cabinet.variable} antialiased`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap" rel="stylesheet" />
      </head>
      <body className={cabinet.className}>
        <ToastProvider>
          {children}
          <BackgroundMusic />
        </ToastProvider>
      </body>
    </html>
  );
}
