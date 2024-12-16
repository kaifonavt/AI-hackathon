import Navigation from "@/components/navigation";
import { AuthProvider } from "@/context/AuthContext";
import "./globals.css";
import { titleFont, textFont } from "./fonts";
export const metadata = {
  title: "NotSecretSanta",
  description: "Your personal Christmas copilot",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${titleFont.variable} ${textFont.variable}`}>
      <body className="min-h-screen flex flex-col">
        <AuthProvider>
          <Navigation />
          <main
            style={{
              backgroundImage: 'url("/backgrounds/sigma_back.png")',
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
              backgroundAttachment: "fixed",
            }}
          >
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}
