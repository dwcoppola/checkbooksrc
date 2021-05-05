// Storage //

if (localStorage['account-id'] === undefined) {
    localStorage['account-id'] = 0;
}

if (localStorage['transaction-id'] === undefined) {
    localStorage['transaction-id'] = 0;
}

if (localStorage['accounts'] === undefined) {
    localStorage['accounts'] = '';
}

if (localStorage['user-state'] === undefined) {
    localStorage['user-state'] = '';
}

// Transactions //

function getTransactionID() {
    return localStorage['transaction-id'];
}

function incrementTransactionID() {
    localStorage['transaction-id'] = Number(localStorage['transaction-id']) + 1;
}

function addTransaction(account, action, amount, memo, notClear) {
    const transaction = `${getTransactionID()},${action},${amount},${memo},${notClear};`;
    localStorage[`account-${account}-transactions`] += transaction;
    incrementTransactionID();
}

function getTransactionData() {
    const account = document.getElementById('account');
    const action = document.getElementById('action');
    const amount = document.getElementById('amount');
    const memo = document.getElementById('memo');
    const notClear = document.getElementById('not-clear');
    addTransaction(account.value, action.value, amount.value, memo.value, notClear.checked);
    location.reload();
}

function getAllAccountTransactions() {
    let output = [];
    const accountID = document.getElementById('account'); 
    if (accountID) {
        const accounts = localStorage[`account-${accountID.value}-transactions`];
        if (accounts !== undefined) {
            for (account of accounts.split(';').slice(0, this.length - 1)) {
                output.push(account);
            }
            localStorage['user-state'] = accountID.value;
            return output;
        }
    }
}

// Accounts //

function getAccountID() {
    return localStorage['account-id'];
}

function incrementAcountID() {
    localStorage['account-id'] = Number(localStorage['account-id']) + 1;
}

function addAccount(accountName, startBalance) {
    localStorage['accounts'] += `${getAccountID()},${accountName},${startBalance};`;
    localStorage[`account-${getAccountID()}-transactions`] = '';
    incrementAcountID();
}

function getAccountData() {
    const accountName = document.getElementById('account-name');
    const startBalance = document.getElementById('start-balance');
    addAccount(accountName.value.trim(), startBalance.value);
    accountName.value = '';
    startBalance.value = '';
    accountName.focus();
} 

function getAllAccounts() {
    let output = [];
    const accounts = localStorage['accounts'].split(';').slice(0, this.length - 1);
    for (account of accounts) {
        output.push(account.split(','));
    };
    return output;
}

function getAllAccountNames() {
    let output = [];
    const accounts = localStorage['accounts'].split(';').slice(0, this.length - 1);
    for (account of accounts) {
        output.push(account.split(',')[1]);
    };
    return output;    
}


// DOM //

function populateAccountMenu() {
    const accounts = getAllAccounts();
    const menu = document.getElementById('account');
    if (menu !== null) {
        for (account of accounts) {
            menu.innerHTML += `<option value="${account[0]}">${account[1]}</option>`;
        }
    }
}
populateAccountMenu();

//todo: show / hide this form
function populateTransactionTable() {
    const transactions = getAllAccountTransactions();
    const table = document.getElementById('transaction-table');
    if (table) {
        removeAllChildren(table);
        table.innerHTML = 
        `<thead>
            <tr>
                <th>Action</th>
                <th>Amount</th>
                <th>Memo</th>
                <th>Edit</th>
            </tr>
        </thead>
        <tbody>
        </tbody>`
        const tbody = document.querySelector('tbody');
        for (transaction of transactions) {
            // todo: truncate memo text
            tbody.innerHTML +=
            `<tr>
                <td>${transaction.split(',')[1]}</td>
                <td>${transaction.split(',')[2]}</td>
                <td>${transaction.split(',')[3]}</td>
                <td><span class="glyphicon glyphicon-pencil"></span></td>
            </tr>`
        }
    }
}

function removeAllChildren(parent) {
    while (parent.firstChild) {
        parent.removeChild(parent.firstChild);
    }
}


// Errors // 

function alertUser() {
    alert("Something went wrong. Please check your inputs and try again.")
}


// Random
// This is a way to do initial caps. How ridiculous!
// action.value.slice(0,1).toUpperCase() + action.value.slice(1, action.value.length)


// State

function checkUserState() {
    const accountID = localStorage['user-state'];
    const menu = document.getElementById('account');
    if (menu) {
        const options = menu.options;
        for (option of options) {
            if (option.value === accountID) {
                option.selected = true;
            }
        }
    }
}

checkUserState();
populateTransactionTable();