interface WikiSummary {
  description?: string
  extract?: string
  wikibase_item?: string
}

interface WikidataClaim {
  mainsnak?: { datavalue?: { value?: string } }
  qualifiers?: { P407?: { datavalue?: { value?: { id?: string } } }[] }
}

const ENGLISH_LANGUAGE_QID = 'Q1860'

export interface WikipediaInfo {
  description: string | null
  url: string | null
}

async function fetchSummaryByTitle(title: string): Promise<WikiSummary | null> {
  const res = await fetch(
    `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title.replace(/ /g, '_'))}`,
  )
  if (!res.ok) return null
  return res.json()
}

async function searchBestTitle(query: string): Promise<string | null> {
  const url = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&format=json&origin=*&srlimit=1`
  const res = await fetch(url)
  if (!res.ok) return null
  const data = await res.json()
  return data?.query?.search?.[0]?.title ?? null
}

async function fetchOfficialWebsite(qid: string): Promise<string | null> {
  const url = `https://www.wikidata.org/w/api.php?action=wbgetclaims&entity=${qid}&property=P856&format=json&origin=*`
  const res = await fetch(url)
  if (!res.ok) return null
  const data = await res.json()
  const claims: WikidataClaim[] | undefined = data?.claims?.P856
  if (!claims || claims.length === 0) return null

  const preferred = claims.find((claim) => {
    const languageQualifiers = claim.qualifiers?.P407
    if (!languageQualifiers || languageQualifiers.length === 0) return true
    return languageQualifiers.some((q) => q.datavalue?.value?.id === ENGLISH_LANGUAGE_QID)
  })

  return (preferred ?? claims[0]).mainsnak?.datavalue?.value ?? null
}

export async function fetchWikipediaInfo(name: string): Promise<WikipediaInfo> {
  let summary = await fetchSummaryByTitle(name)
  if (!summary) {
    const resolvedTitle = await searchBestTitle(name)
    if (resolvedTitle) summary = await fetchSummaryByTitle(resolvedTitle)
  }
  if (!summary) return { description: null, url: null }

  const description = summary.description || summary.extract || null
  const url = summary.wikibase_item ? await fetchOfficialWebsite(summary.wikibase_item) : null

  return { description, url }
}
