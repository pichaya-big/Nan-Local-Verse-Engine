import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "./theme-provider";

export const metadata: Metadata = {
  title: "Nan Local-Verse Engine",
  description: "ระบบเสกแคมเปญอัจฉริยะสำหรับผู้ประกอบการเมืองน่าน",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // suppressHydrationWarning สำคัญมาก เพื่อไม่ให้ Next.js บ่นตอนสลับฝั่ง Server/Client
    <html lang="th" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Google+Sans:ital,opsz,wght@0,17..18,400..700;1,17..18,400..700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 min-h-screen w-full antialiased transition-colors duration-200">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          {/* กำหนดให้ความกว้างแผ่เต็มหน้าจอ 100% ไม่มี Container ส่วนกลางมาบีบ */}
          <main className="w-full min-h-screen">
            {children}
          </main>
        </ThemeProvider>
      </body>
    </html>
  );
}