import React from 'react'

import './globals.css'

export const metadata = {
  description: 'Personal site',
  title: 'Wait For It',
}

export default function RootLayout(props: { children: React.ReactNode }) {
  const { children } = props

  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
