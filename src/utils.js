// A collection of utility functions

function getCommitMessageString(ticketID, type, ticketSummary) {
    // If copy-summary action is selected, return the ticket summary with the ticket ID
    // else return the ticket ID with the type of change
    if(type && typeof type === 'object' && type.action === 'copy-summary') return `(${ticketID}) - ${ticketSummary}`;
    return `(${ticketID}) ${type || ''}: `;
}

// require exports
module.exports = {
    getCommitMessageString
}


