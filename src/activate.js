// @ts-nocheck
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const { default: axios } = require('axios');
const vscode = require('vscode');
const Cache = require('vscode-cache');
const { recentlySelectedSeperator, TicktetSeparator, CONSTANTS } = require('./constants');
const { getCommitMessageString } = require('./utils');


/**
 * @param {vscode.ExtensionContext} context
 */
async function activate(context) {
    let issuesCache = new Cache(context);

    const setDetails = vscode.commands.registerCommand('jira-git-commit-helper.setUserDetails', async () => {
        const secrets = await context.secrets.get(CONSTANTS.storageKeys.auth)
        // check if auth is already stored in the secrets
        // if not, prompt for username and password
        if (!secrets) {

            //get password from username and password
            const username = await vscode.window.showInputBox({
                placeHolder: CONSTANTS.strings.usernamePlaceholder,
                ignoreFocusOut: true,
            });
            const password = await vscode.window.showInputBox({
                placeHolder: CONSTANTS.strings.tokenPlaceholder,
                password: true,
                ignoreFocusOut: true,
            });
            if (!username || !password) return vscode.window.showInformationMessage('Username and Token are required.');


            // store the auth in the secrets as base64 encoded string
            const auth = Buffer.from(`${username}:${password}`).toString('base64');
            await context.secrets.store(CONSTANTS.storageKeys.auth, auth);

            // get the base url from the user
            const baseUrl = await vscode.window.showInputBox({
                placeHolder: CONSTANTS.strings.baseUrlPlaceholder,
                ignoreFocusOut: true,
            });
            if (!baseUrl) return;
            await context.secrets.store(CONSTANTS.storageKeys.baseUrl, baseUrl);
        } else vscode.window.showInformationMessage('Data already present, please run "JIRA Commit Message: Clear Stored data" to clear.');
    })
    context.subscriptions.push(setDetails);
    // register a command to open the commit message editor
    const commitMessageEditor = vscode.commands.registerCommand('jira-git-commit-helper.createCommitMessage', async () => {
        const secrets = await context.secrets.get(CONSTANTS.storageKeys.auth)
        if (!secrets) {
            vscode.window.showErrorMessage('No JIRA credentials found')
            vscode.commands.executeCommand('jira-git-commit-helper.setUserDetails')
            return
        }

        // check if git extension is installed and enabled
        const vscodeGit = vscode.extensions.getExtension('vscode.git');
        const gitExtension = vscodeGit && vscodeGit.exports;
        if (gitExtension && !gitExtension.enabled) return vscode.window.showErrorMessage('No GIT extension found');

        // get the active repository
        let repos = gitExtension.getAPI(1).repositories;
        if (!repos && !repos.length && repos[0] && repos[0].inputBox) return vscode.window.showErrorMessage('No active repository found');


        // get list of tickets assigned to current user from JIRA
        const jiraTickets = await vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: CONSTANTS.strings.fetchingTickets,
            cancellable: false
        }, async () => {
            // make a request to JIRA API
            try {
                const cachedIssues = await issuesCache.get(CONSTANTS.storageKeys.tickets);
                const baseUrl = await context.secrets.get(CONSTANTS.storageKeys.baseUrl);
                if (!baseUrl) return vscode.window.showErrorMessage('No JIRA base URL found')

                if (cachedIssues) return cachedIssues;
                // get list of tickets assigned to current user from JIRA using axios
                const { data: { issues } } = await axios.get(CONSTANTS.url(baseUrl), {
                    headers: {
                        Authorization: `Basic ${secrets}`,
                    }
                });

                return issues.map(issue => ({
                    label: `${issue.fields.summary}`,
                    detail: issue.key,
                }));
            } catch (e) {
                console.log(e);
            }
        });
        if (!Array.isArray(jiraTickets))
            return vscode.window.showErrorMessage('Not able to find valid tickets. Use reset command to reset your information and try again.');

        // Store jira tickets in cache and set expiration to 30 mins in seconds
        await issuesCache.put(CONSTANTS.storageKeys.tickets, jiraTickets, 1800);


        const recentlySelectedIssues = ((await issuesCache.get(CONSTANTS.storageKeys.selectedIssues)) || [])


        const listItems = [
            ...CONSTANTS.actions,
            recentlySelectedSeperator,
            ...recentlySelectedIssues,
            TicktetSeparator,
            ...jiraTickets]

        const uniqueOptions = listItems.filter((item, index) => {
            return listItems.findIndex((item2) => item2.label === item.label) === index;
        });

        // show quick pick to select a ticket
        let selectedTicket = await vscode.window.showQuickPick(uniqueOptions, {
            placeHolder: CONSTANTS.strings.ticketPlaceholder,
            ignoreFocusOut: true,
            matchOnDetail: true,
        });

        if (selectedTicket && selectedTicket.action === CONSTANTS.actions[1].action) {
            // refresh the jiraTickets list
            await issuesCache.flush();
            return vscode.commands.executeCommand('jira-git-commit-helper.createCommitMessage');
        }

        if (selectedTicket && selectedTicket.action == CONSTANTS.actions[0].action) {
            const ticketNumber = await vscode.window.showInputBox({
                placeHolder: CONSTANTS.strings.manualTicketPlaceholder,
                ignoreFocusOut: true,
            });

            selectedTicket = {
                detail: ticketNumber,
                isManual: true,
            }
        }

        if (!selectedTicket || !selectedTicket.detail) return

        const selectedType = await vscode.window.showQuickPick(CONSTANTS.types, {
            placeHolder: CONSTANTS.strings.typePlaceholder,
            ignoreFocusOut: true,
            matchOnDetail: true,
        });

        // set the commit message on the scm input box based on the selected ticket
        vscode.commands.executeCommand('workbench.view.scm');
        vscode.commands.executeCommand('workbench.scm.focus');
        // set value to scm inputbox

        // Store selected jira tickets in cache and set expiration to 3 days in seconds
        if (!selectedTicket.isManual)
            issuesCache.put(CONSTANTS.storageKeys.selectedIssues, [selectedTicket, ...recentlySelectedIssues].slice(0, 4), 3 * 24 * 60 * 60)
        repos[0].inputBox.value = selectedTicket && selectedTicket.detail ? getCommitMessageString(selectedTicket.detail, selectedType, selectedTicket.label) : '';
    });

    context.subscriptions.push(commitMessageEditor);

    let resetToken = vscode.commands.registerCommand('jira-git-commit-helper.resetToken', async function () {
        await context.secrets.delete(CONSTANTS.storageKeys.auth)
        await context.secrets.delete(CONSTANTS.storageKeys.baseUrl)
        await issuesCache.flush()
        // Display a message box to the user
        vscode.window.showInformationMessage('Data has been cleared');
    });

    context.subscriptions.push(resetToken);

    const auth = await context.secrets.get(CONSTANTS.storageKeys.auth)
    if (!auth)
        vscode.commands.executeCommand('jira-git-commit-helper.setUserDetails')
}

module.exports = activate