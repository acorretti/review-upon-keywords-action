import * as core from '@actions/core'
import * as github from '@actions/github'
import * as handler from '../src/handler'
import * as utils from '../src/utils'
import { mocked } from 'ts-jest/utils'
import { run } from '../src/main'

jest.mock('@actions/core')
jest.mock('@actions/github')
jest.mock('../src/utils')
jest.mock('../src/handler')

const mockedUtils = mocked(utils)
const coreMocked = mocked(core)
const mockedHandler = mocked(handler)

describe('run', () => {
    beforeEach(() => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        github.context = {
            eventName: '',
            workflow: '',
            action: '',
            actor: '',
            payload: {
                action: 'opened',
                number: '1',
                pull_request: {
                    number: 1,
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
            issue: {
                owner: 'acorretti',
                repo: 'auto-assign',
                number: 1,
            },
            sha: '',
            ref: '',
        }
    })

    test('succeeds the process', async () => {
        coreMocked.getInput.mockImplementation(name => {
            switch (name) {
                case 'repo-token':
                    return 'token'
                case 'configuration-path':
                    return '.github/auto_assign.yml'
            }
        })

        mockedUtils.fetchConfigurationFile.mockImplementation(async () => ({
            addAssignees: false,
            addReviewers: true,
            reviewers: ['reviewerA', 'reviewerB', 'reviewerC'],
        }))

        mockedHandler.handlePullRequest.mockImplementation(async () => {})

        await run()

        expect(mockedHandler.handlePullRequest).toBeCalled()
    })
})
