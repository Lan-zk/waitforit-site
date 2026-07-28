import { ContentPage } from '@/components/ContentPage'
import { getI18n } from '@/i18n/server'

export default async function NotFound() {
  const { dictionary, locale } = await getI18n()

  return (
    <ContentPage
      homeLabel={dictionary.pages.backHome}
      languageLabels={dictionary.language}
      locale={locale}
      title={dictionary.pages.notFoundTitle}
    >
      <p>{dictionary.pages.notFoundBody}</p>
    </ContentPage>
  )
}
