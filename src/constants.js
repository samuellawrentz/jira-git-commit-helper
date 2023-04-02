const CONSTANTS = {
    actions: [
        { label: '$(add) Enter ticket number manually', action: 'enter-manually' },
        { label: '$(refresh) Fetch latest tickets', action: 'refresh' },
    ],
    types: ['🐞 Bug Fix', '⏫ Updates', '🔧 Optimization', '🧹 Clean up'],
    url: (baseURL) => `${baseURL}/rest/api/3/search/?jql=updated >= -20d AND project = CNTO AND assignee in (currentUser()) order by updated DESC&maxResults=15`,
    strings: {
        usernamePlaceholder: 'Enter your JIRA username/email',
        tokenPlaceholder: 'Enter your JIRA API token',
        ticketPlaceholder: 'Select the ticket',
        manualTicketPlaceholder: 'Enter ticket number manually (e.g. CNTO-1234)',
        typePlaceholder: 'Select type of the changes',
        fetchingTickets: 'Fetching JIRA tickets...',
        baseUrlPlaceholder: 'Enter your JIRA base URL (e.g. https://company.atlassian.net)',
    },
    storageKeys: {
        auth: 'jira-auth',
        tickets: 'jiraTickets',
        selectedIssues: 'selected-issues',
        baseUrl: 'base-url',
    }

}

const recentlySelectedSeperator = {
    label: 'Recent tickets',
    kind: -1
};

const TicktetSeparator = {
    label: 'Your tickets',
    kind: -1
};

module.exports = {
    CONSTANTS,
    recentlySelectedSeperator,
    TicktetSeparator
}