import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import { AuthProvider } from "@/components/auth-provider";
import "./globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  title: "TaskFlow | Modern Task Management",
  description: "Organize your tasks efficiently with TaskFlow",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${poppins.className} min-h-screen`}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
