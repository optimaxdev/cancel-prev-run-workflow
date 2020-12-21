import { getInput } from '@actions/core';
// import { getOctokit } from '@actions/github';
import { actions } from '../src/config';

import run from '../src/main';

jest.spyOn(console, 'log').mockImplementation();

jest.mock('@actions/core');

jest.mock('@actions/github', () => {
  const MOCK_CONTEXT = {
    eventName: 'eventName',
    repo: {
      owner: 'owner',
      repo: 'repo',
    },
    ref: 'branchName',
    sha: 123456789101112,
    payload: {
      pull_request: { title: 'prTitle', head: { ref: 'branchName' } },
    },
  };
  return {
    getOctokit: jest.fn().mockImplementation(() => ({
      actions:
        {
          getWorkflowRun: jest.fn().mockReturnValue({ data: { workflow_id: 5, created_at: '01.02.16' } }),
          listWorkflowRuns: jest.fn().mockReturnValue({
            data: {
              workflow_runs: [{
                created_at: '01.01.16', head_branch: 'branch', head_sha: 1234, status: 'completed',
              }],
            },
          }),
          cancelWorkflowRun: jest.fn(),
        },

    })),
    context: MOCK_CONTEXT,
  };
});

describe('tests for cancel prev run workflow', () => {
  const OLD_ENV = process.env;

  // eslint-disable-next-line jest/no-hooks
  beforeEach(() => {
    jest.resetModules(); // this is important - it clears the cache
    process.env = { ...OLD_ENV };
    delete process.env.NODE_ENV;
  });

  // eslint-disable-next-line jest/no-hooks
  afterEach(() => {
    process.env = OLD_ENV;
  });

  it('initializes correctly', async () => {
    expect.hasAssertions();

    expect(getInput).toHaveBeenCalledWith('github-token', { required: true });
    expect(getInput).toHaveBeenCalledWith('workflow_id', { required: false });

    (getInput as jest.Mock).mockReturnValue('workFlowOne.yml, workFlowTwo.yml');
    expect(getInput('workflow_id', { required: false })).toBe('workFlowOne.yml, workFlowTwo.yml');
  });

  it('run()', async () => {
    expect.hasAssertions();

    process.env.NODE_ENV = 'dev';
    (getInput as jest.Mock).mockReturnValue('workFlowOne.yml, workFlowTwo.yml');

    await run();

    expect(actions.getWorkflowRun).toHaveBeenCalledWith();
  });
});
