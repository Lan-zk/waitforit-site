import { ContentPage } from '@/components/ContentPage'
import { getI18n } from '@/i18n/server'

export default async function NotFound() {
  const { dictionary } = await getI18n()

  return (
    <ContentPage
      homeLabel={dictionary.pages.backHome}
      title={dictionary.pages.notFoundTitle}
    >
      <p>{dictionary.pages.notFoundBody}</p>
    </ContentPage>
  )
}
