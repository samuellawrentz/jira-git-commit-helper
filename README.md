# JIRA Git Commit Message Extension for VS Code

This VS Code extension automatically inserts the details of currently assigned JIRA tickets into Git commit messages, helping to ensure that necessary information is included and reducing errors.

<p align="center">
  <img width="100%" src="assets/extension.gif">
</p>

## Features

- Automatically inserts JIRA ticket details into Git commit messages
- Retrieves the details of the currently assigned JIRA ticket using the JIRA REST API
- Caches API responses for improved performance and reduced API usage
- Clears cache on window close to avoid stale data

## Installation

Install the extension from the VS Code marketplace by searching for "JIRA Commit Message" or by following [this link](https://marketplace.visualstudio.com/items?itemName=SamuelLawrentz.jira-git-commit-helper).

## Configuration

The extension can be configured through the following settings:

The extension will get the configuration when its first activated. If you change the configuration, you need to reload the window to make it work.

- `jiraCommitMessage.baseURL`: The URL of your JIRA instance, e.g. `https://mycompany.atlassian.net`.
- `jiraCommitMessage.username`: The email to use for the JIRA API, e.g `name@yourcompany.com`
- `jiraCommitMessage.token`: The API token to use for the JIRA API. You can generate one in your JIRA profile settings. (See [here](https://confluence.atlassian.com/cloud/api-tokens-938839638.html) for more information.)

## Note
If you want to clear the token or username or password, run the command - `JIRA Commit Message: Clear Stored data` from the command palette. This will clear the token and other creds.

You can start over again by running the command - `JIRA Commit Message: Enter User Details for the JIRA API` from the command palette.palette

## Available Commands
The following are the available commands for this extension.
```json
    "commands": [
      {
        "command": "jira-git-commit-helper.createCommitMessage",
        "title": "JIRA Commit Message: Create Commit Message"
      },
      {
        "command": "jira-git-commit-helper.resetToken",
        "title": "JIRA Commit Message: Clear Stored data"
      },
      {
        "command": "jira-git-commit-helper.setUserDetails",
        "title": "JIRA Commit Message: Enter User Details for the JIRA API"
      }
    ]
```

## Usage

When creating a new Git commit, the extension will automatically retrieve the details of the currently assigned JIRA ticket and insert them into the commit message template. The commit message will then be pre-filled with the JIRA ticket information, which can be edited as necessary.

To activate the extension, open the command palette (Ctrl+Shift+P) and select "JIRA Commit Message: Create Commit Message".
- You can select a JIRA ticket from the list of tickets assigned to you or enter a ticket ID manually.
- Select the type of commit you are making from the list of available commit types.
- Enter a commit message and press Enter to create the commit.

> Note: This extension does not store any of your data locally. It is stored within VSCode Extension Cache and hence you can never access the username, token or URL directly. It can be set and unset only via the available commands.

## Additional information
Please have a look at this blog post for more clarity - https://samuellawrentz.com/blog/jira-git-commit-workflow-vscode-extension/


## Contributing

If you wish to contribute to this extension, please follow the steps below:

1. Fork the repository
2. Clone your fork to your local machine
3. Create a new branch for your changes
4. Make your changes and commit them
5. Push your branch to your fork
6. Open a pull request

## License

This extension is licensed under the [MIT License](./license.md).
