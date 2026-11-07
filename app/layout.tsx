import React from 'react'
import PiAuthSilent from '../components/PiAuthSilent'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <script src="https://sdk.minepi.com/pi-sdk.js"></script>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <title>GOYE Web3 Business Hub</title>
        <meta name="description" content="AI + Web3 Business Infrastructure on Pi Network" />
      </head>
      <body className="bg-black text-white antialiased">
        <PiAuthSilent />
        {children}
      </body>
    </html>
  )
}
