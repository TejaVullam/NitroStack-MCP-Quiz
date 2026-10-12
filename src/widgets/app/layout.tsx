import type { Metadata } from 'next';
import './styles.css';
export const metadata: Metadata = { title: 'Quiz & Mind Map MCP', description: 'Interactive learning widgets' };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
