import type { Metadata } from "next";
import "./globals.css";
import { ReactQueryClientProvider } from "@/components/providers";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  title: {
    template: "%s | TaskFlow",
    default: "TaskFlow - Your AI-powered productivity companion",
  },
  description: "Your AI-powered productivity companion",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      cz-shortcut-listen="true"
      suppressHydrationWarning
    >
      <body
        className="antialiased"
        data-qb-installed="true"
        cz-shortcut-listen="true"
      >
        <ReactQueryClientProvider>
          <Navbar />
          {children}
          <Toaster
            position="top-right"
            reverseOrder={false}
          />
          <Footer />
        </ReactQueryClientProvider>
      </body>
    </html>
  );
}
