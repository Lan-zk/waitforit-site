'use server'

import { cookies } from 'next/headers'

import { isLocale, localeCookieName } from '@/i18n/config'

const oneYearInSeconds = 60 * 60 * 24 * 365

export async function setLocale(formData: FormData) {
  const locale = formData.get('locale')

  if (!isLocale(locale)) {
    return
  }

  const cookieStore = await cookies()
  cookieStore.set(localeCookieName, locale, {
    httpOnly: true,
    maxAge: oneYearInSeconds,
    path: '/',
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  })
}
