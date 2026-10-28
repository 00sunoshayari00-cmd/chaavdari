// app/admin/layout.tsx
import "../globals.css";

export const metadata = { title: "Admin", robots: { index: false } };

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
