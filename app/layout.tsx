export const metadata = {
  title: 'Tetris',
  description: 'Tetris game built with Next.js',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body style={{
        margin: 0,
        padding: 0,
        backgroundColor: '#000',
        color: '#fff',
        fontFamily: 'monospace',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column'
      }}>{children}</body>
    </html>
  )
}