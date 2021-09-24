import * as core from '@actions/core'
import * as github from '@actions/github'
import * as handler from './handler'
import * as utils from './utils'
import Octokit = require('@octokit/rest')

export async function run(): Promise<void> {
    try {
        const token = core.getInput('repo-token', { required: true })
        const configPath = core.getInput('configuration-path', {
            required: true,
        })

        const client = new github.GitHub(token) as Octokit
        const { repo, sha } = github.context
        const config = await utils.fetchConfigurationFile(client, {
            owner: repo.owner,
            repo: repo.repo,
            path: configPath,
            ref: sha,
        })

        if (!isHandlerConfig(config)) {
            throw new Error('Invalid action configuration')
        }
        await handler.handlePullRequest(client, github.context, config)
    } catch (error) {
        core.setFailed(error as Error)
    }
}

function isHandlerConfig(obj: unknown): obj is handler.Config {
    return obj instanceof Object
}
