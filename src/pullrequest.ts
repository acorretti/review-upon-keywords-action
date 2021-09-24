import * as core from '@actions/core'
import { Context } from '@actions/github/lib/context'
import Octokit = require('@octokit/rest')

export class PullRequest {
    private client: Octokit
    private context: Context

    constructor(client: Octokit, context: Context) {
        this.client = client
        this.context = context
    }

    async addReviewers(reviewers: string[]): Promise<void> {
        const { owner, repo, number } = this.context.issue
        const result = await this.client.pulls.createReviewRequest({
            owner,
            repo,
            number,
            reviewers,
        })
        core.debug(JSON.stringify(result))
    }

    async addAssignees(assignees: string[]): Promise<void> {
        const { owner, repo, number } = this.context.issue
        const result = await this.client.issues.addAssignees({
            owner,
            repo,
            number,
            assignees,
        })
        core.debug(JSON.stringify(result))
    }

    hasAnyLabel(labels: string[]): boolean {
        if (!this.context.payload.pull_request) {
            return false
        }
        const {
            labels: pullRequestLabels = [],
        } = this.context.payload.pull_request
        return pullRequestLabels.some(label => labels.includes(label.name))
    }
}
