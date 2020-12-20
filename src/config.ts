import { getInput } from '@actions/core';
import { getOctokit } from '@actions/github';

export const githubToken = getInput('github-token', { required: true });

export const workflowIdsFromConfig = getInput('workflow_id', { required: false });

export const { GITHUB_RUN_ID } = process.env;

export const { actions } = getOctokit(githubToken);
