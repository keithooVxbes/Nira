import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { FocusTimerProvider } from "@/components/focus/FocusTimerProvider";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-plus-jakarta-sans",
});

export const metadata = {
  title: "Nira - Productivity Workspace",
  description: "Everything you need to stay on top of student life.",
};

export const dynamic = 'force-dynamic';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={plusJakartaSans.className}>
        <FocusTimerProvider>{children}</FocusTimerProvider>
      </body>
    </html>
  );
}
