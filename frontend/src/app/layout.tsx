import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/components/providers/auth-provider";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "BloodLink — Modern Blood Donation Ecosystem",
  description: "Connecting Donors, Patients, and Blood Banks in Real Time.",
};

// Runs synchronously before hydration to set the .light/.dark class from
// the last saved preference (or system setting), so the page never flashes
// the wrong theme. This has to be a plain <script> emitted by this Server
// Component — rendering it from inside the client-side ThemeProvider tree
// (as next-themes did) is what Next.js 16 flags as a no-op script tag.
const THEME_INIT_SCRIPT = `(function(){try{var t=localStorage.getItem('theme')||'system';var d=t==='system'?(window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'):t;var r=document.documentElement;r.classList.remove('light','dark');r.classList.add(d);r.style.colorScheme=d;}catch(e){}})();`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="scroll-smooth">
      <head>
        <script suppressHydrationWarning dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body
        className={`${poppins.variable} font-sans antialiased bg-background text-foreground selection:bg-crimson-500 selection:text-white transition-colors duration-300`}
      >
        <ThemeProvider>
          <AuthProvider>{children}</AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}