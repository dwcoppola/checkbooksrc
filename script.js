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
    const time = new Date();
    if (action == "Withdrawal") {
        amount = Number(amount) * -1;
    }
    const transaction = `${getTransactionID()},${action},${amount},${memo},${notClear},${time.toString().slice(4,15)};`;
    localStorage[`account-${account}-transactions`] += transaction;
    incrementTransactionID();
}

function getTransactionData() {
    const account = document.getElementById('account');
    const action = document.getElementById('action');
    const amount = document.getElementById('amount');
    const memo = document.getElementById('memo');
    const notClear = document.getElementById('not-clear');
    if (account.value) {
        addTransaction(account.value, action.value, amount.value, memo.value, notClear.checked);
        location.reload();
    } else {
        setTimeout(() => {alert("You need to pick an account")}, 150);
    }
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

function getTransactionByID(transactionID) {
    const numberOfAccounts = getAllAccountNames().length;
    for (let i=0; i<numberOfAccounts; i++) {
        let accountTransactions = localStorage[`account-${i}-transactions`].split(';').slice(0, this.length - 1);
        for (transaction of accountTransactions) {
            if (transaction[0] === transactionID.toString()) {
                return transaction.split(',');
            } else {
                continue;
            }
        }
    }
    return "Not Found";
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
    localStorage['user-state'] = getAccountID();
    incrementAcountID();
    alert(`You have successfully added ${accountName}`);
    location.reload();
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

function gotoEditTransaction(transactionID) {
    console.log(transactionID)
}

function showAddAccountSection() {
    const addAcctSect = document.getElementById('add-account');
    addAcctSect.innerHTML = `
        <p>Fill out the form to add an account (<a onclick="hideAddAccountSection()">hide form</a>)</p>
       
        <div class="form-group">
            <label>Account Name</label>
            <input class="form-control" id="account-name" autocomplete="off"/>
        </div>

        <div class="form-group">
            <label>Start Balance</label>
            <input class="form-control" id="start-balance" autocomplete="off"/>
        </div>

        <div class="form-group">       
            <button onclick="getAccountData()" class="btn btn-default">Save</button>
        </div>`;
    const accountName = document.getElementById('account-name');
    accountName.focus();
}

function hideAddAccountSection() {
    const addAccount = document.getElementById('add-account');
    removeAllChildren(addAccount);
    addAccount.innerHTML = `<button onclick="showAddAccountSection()" class="btn btn-default">Add Account</button>`;
}

function showAddTransactionSection() {
    const addTransSect = document.getElementById('add-transaction');
    addTransSect.innerHTML = `
    <p>Fill out the form to add a transaction (<a onclick="hideAddTransactionSection()">hide form</a>)</p>
                
    <div class="form-group">
        <label>Action</label>
        <select class="form-control" id="action">
            <option selected disabled value="">Choose:</option>
            <option value="Deposit">Deposit</option>
            <option value="Withdrawal">Withdrawal</option>
        </select>
    </div>
        
    <div class="form-group">
        <label>Amount</label>
        <input type="number" min="0.01" step="0.01" class="form-control" id="amount" autocomplete="off"/>
    </div>
    
    <div class="form-group">
        <label>Memo</label>
        <input class="form-control" id="memo" autocomplete="off"/>
    </div>
    
    <div class="form-group">
        <label>Not Clear?</label>
        <input type="checkbox" id="not-clear"/>
    </div>
    
    <div class="form-group">
        <button class="btn btn-default" onclick="getTransactionData()">Save</button>
    </div>`
}

function hideAddTransactionSection() {
    const addTransaction = document.getElementById('add-transaction');
    removeAllChildren(addTransaction);
    addTransaction.innerHTML = `<button onclick="showAddTransactionSection()" class="btn btn-default">Add Transaction</button>`;
}

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

function populateTransactionTable() {
    const transactions = getAllAccountTransactions();
    if (transactions !== undefined) {
        const table = document.getElementById('transaction-table');
        if (table) {
            removeAllChildren(table);
            table.innerHTML = 
            `<thead>
                <tr>
                    <th>Date</th>
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
                `<tr id="row-${transaction.split(',')[0]}">
                    <td>${transaction.split(',')[5]}</td>
                    <td>${transaction.split(',')[2]}</td>
                    <td>${transaction.split(',')[3]}</td>
                    <td><span class="glyphicon glyphicon-pencil" onclick="gotoEditTransaction(${transaction.split(',')[0]})"></span></td>
                </tr>`
            }
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