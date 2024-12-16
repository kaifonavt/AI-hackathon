import { Pacifico, Montserrat } from 'next/font/google'

export const titleFont = Pacifico({
  weight: ['400'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-title'
})

export const textFont = Montserrat({
  weight: ['400', '700'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-text'
})