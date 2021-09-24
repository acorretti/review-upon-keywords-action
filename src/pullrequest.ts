import * as core from '@actions/core'
import { Context } from '@actions/github/lib/context'
import DiffParser = require('git-diff-parser')
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

    async getDiff(): Promise<DiffParser.Result> {
        if (!this.context.payload.pull_request) {
            throw new Error('webhook payload not found')
        }
        const prDetails = await this.client.pulls.get({
            owner: this.context.repo.owner,
            repo: this.context.repo.repo,
            number: this.context.payload.pull_request.number,
        })
        const { data: diffBody } = await this.client.request(
            prDetails.data.diff_url
        )
        return DiffParser(diffBody)
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
