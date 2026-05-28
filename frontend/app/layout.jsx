import './styles/globals.css';

export const metadata = {
  title: 'CodeForge LMS',
  description: 'Learn to build real software. Master the craft.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
