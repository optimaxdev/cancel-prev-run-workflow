import { info, setFailed } from '@actions/core';
import { context } from '@actions/github';
import { actions, GITHUB_RUN_ID, workflowIdsFromConfig } from './config';

const run = async (): Promise<void> => {
  const {
    sha, ref, repo: { owner, repo }, payload,
  } = context;

  let branch = ref.slice(11);

  let headSha = sha;

  if (payload.pull_request) {
    branch = payload.pull_request.head.ref;
    headSha = payload.pull_request.head.sha;
  }

  console.info({
    sha, headSha, branch, owner, repo, GITHUB_RUN_ID,
  });

  const workflowIdsToCancel: string[] = [];

  const { data: currentRun } = await actions.getWorkflowRun({
    owner,
    repo,
    run_id: Number(GITHUB_RUN_ID),
  });

  if (workflowIdsFromConfig) {
    workflowIdsFromConfig.replace(/\s/g, '')
      .split(',')
      .forEach((n) => workflowIdsToCancel.push(n));
  } else {
    workflowIdsToCancel.push(String(currentRun.workflow_id));
  }

  console.log(`Found workflow_ids: ${JSON.stringify(workflowIdsToCancel)}`);

  await Promise.all(workflowIdsToCancel.map(async (workflowId) => {
    try {
      const { data } = await actions.listWorkflowRuns({
        owner,
        repo,
        workflow_id: workflowId,
        branch,
      });

      const runningWorkflows = data.workflow_runs.filter(
        (workflowRun) => {
          const createdAt = new Date(workflowRun.created_at);
          const currentRunCreatedAt = new Date(currentRun.created_at || '');

          return workflowRun.head_branch === branch && workflowRun.head_sha !== headSha && workflowRun.status !== 'completed'
            && createdAt < currentRunCreatedAt;
        },
      );

      runningWorkflows.forEach(async ({ id }) => {
        const { status }: {status: string} = await actions.cancelWorkflowRun({
          owner,
          repo,
          run_id: id,
        });
        console.log(`Cancel run ${id} responded with status ${status}`);
      });
    } catch (e) {
      const msg = e.message || e;
      console.error(`Error while cancelling workflows_id ${workflowIdsFromConfig}: ${msg}`);
    }
  }));
};

run()
  .then(() => info('Cancel Complete.'))
  .catch((e) => setFailed(e.message));

export default run;
