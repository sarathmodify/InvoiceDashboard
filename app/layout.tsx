import '@/app/ui/global.css';
import { ReactNode } from 'react';
import { inter } from './ui/font';

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  console.log(inter,'inter');
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}