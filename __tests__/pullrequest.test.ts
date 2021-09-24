/* eslint-disable @typescript-eslint/no-explicit-any */

import * as github from '@actions/github'
import { Context } from '@actions/github/lib/context'
import { PullRequest } from '../src/pullrequest'
import Octokit = require('@octokit/rest')

jest.mock('@actions/core')
jest.mock('@actions/github')
jest.mock('git-diff-parser', () => jest.fn().mockImplementation(input => input))

describe('PullRequest', () => {
    let context: Context
    let client: Octokit

    beforeEach(async () => {
        context = {
            payload: {
                action: 'opened',
                number: '1',
                pull_request: {
                    number: 1,
                    labels: [],
                    title: 'test',
                    user: {
                        login: 'pr-creator',
                    },
                },
                repository: {
                    name: 'auto-assign',
                    owner: {
                        login: 'acorretti',
                    },
                },
            },
            repo: {
                owner: 'acorretti',
                repo: 'auto-assign',
            },
        } as any
        client = new github.GitHub('token')
        client.pulls = {
            get: jest.fn().mockResolvedValue({ data: { diff_url: 'url' } }),
        } as any
        client.request = jest
            .fn()
            .mockResolvedValue({ data: 'diffBody' }) as any
    })

    describe('getDiff', () => {
        test('throws if the payload is not found', async () => {
            delete context.payload.pull_request
            const pr = new PullRequest(client, context)

            expect(pr.getDiff()).rejects.toThrow('webhook payload not found')
        })
        test('gets the pull request details', async () => {
            const pr = new PullRequest(client, context)

            expect(await pr.getDiff()).toEqual('diffBody')
        })
    })
})
