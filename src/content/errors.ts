export interface ContentRepositoryIssue {
  path: string
  reason: string
}

export class ContentRepositoryError extends Error {
  issues: ContentRepositoryIssue[]

  constructor(issues: ContentRepositoryIssue[]) {
    const sortedIssues = [...issues].sort((left, right) =>
      left.path.localeCompare(right.path, 'en'),
    )
    super(
      sortedIssues
        .map((issue) => `${issue.path}: ${issue.reason}`)
        .join('\n'),
    )
    this.name = 'ContentRepositoryError'
    this.issues = sortedIssues
  }
}
