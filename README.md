# Cancel Prev Run Workflow
This is a GitHub Action that will cancel any previous runs that are not completed for a given workflow.


##  Example config:

### For testing:

```yml
name: Cancel Prev Run Workflow

on: [push, pull_request]

jobs:
  cancel:
    runs-on: ubuntu-latest
    name: Cancel
    steps:
      # To use this repository's private action, you must check out the repository
      - name: Checkout
        uses: actions/checkout@v2
      - name: Setting up BATS
        run: yarn
      - name: Build
        run: yarn build
      - name: Run
        uses: ./ # Uses an action in the root directory
        with:
          workflow_id: workflowOne.yml, workflowTwo.yml,
          access_token: ${{ secrets.GH_TOKEN }}
```

### For use:

```yml
name: Cancel Prev Run Workflow

on: [push, pull_request]

jobs:
  cancel:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/setup-node@v2
      - uses: optimaxdev/cancel-prev-run-workflow@main
        with:
          workflow_id: workflowOne.yml, workflowTwo.yml,
          github-token: ${{ secrets.GH_TOKEN }}
```