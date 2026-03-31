import { AuthProvider } from '@/lib/auth';
import "./globals.css";

export const metadata = {
  title: 'Flow — ניהול עסקי',
  description: 'פלטפורמת ניהול עסקית לעסקים קטנים ובינוניים',
};

export default function RootLayout({ children }) {
  return (
    <html lang="he" dir="rtl">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
