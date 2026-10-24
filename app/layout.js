import { Bricolage_Grotesque, Space_Grotesk, Space_Mono } from "next/font/google";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MobileNav from "@/components/MobileNav";
import "./globals.css";

// headings
const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
});

// normal text
const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

// little labels and prices
const spaceMono = Space_Mono({
  variable: "--font-space-mono",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata = {
  title: "Campus Bazaar | buy, sell & swap at NSUT",
  description:
    "The marketplace just for NSUT students. Notes, books, gadgets, hostel stuff and help, under anonymous usernames.",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${bricolage.variable} ${spaceGrotesk.variable} ${spaceMono.variable} h-full antialiased`}
    >
      {/* pb-24 leaves room for the phone tab bar */}
      <body className="flex min-h-full flex-col pb-24 font-sans sm:pb-0">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
        <MobileNav />
      </body>
    </html>
  );
}
