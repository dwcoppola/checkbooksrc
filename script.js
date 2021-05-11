// data and state

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

function clearStorage() {
    localStorage.clear();
    location.reload();
}

function incrementTransactionID() {
    localStorage['transaction-id'] = Number(localStorage['transaction-id']) + 1;
}

function getTransactionID() {
    return localStorage['transaction-id'];
}

function getAccountID() {
    return localStorage['account-id'];
}

function incrementAcountID() {
    localStorage['account-id'] = Number(localStorage['account-id']) + 1;
}

function checkUserState() {
    const accountID = localStorage['user-state'];
    const menu = document.getElementById('account');
    if (menu) {
        const options = menu.options;
        for (let option of options) {
            if (option.value === accountID) {
                option.selected = true;
            }
        }
    }
}


// create

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

    account.style.backgroundColor = '#fff';
    action.style.backgroundColor = '#fff';
    amount.style.backgroundColor = '#fff';
    memo.style.backgroundColor = '#fff';
    notClear.style.backgroundColor = '#fff';

    if (getAccountByID(account.value) === "Not found") {
        account.style.backgroundColor = '#ff0'
        setTimeout(() => {
            alert(`You must choose an account`);
        }, 100);
    } else if (action.value !== "Deposit" && action.value !== "Withdrawal") {
        action.style.backgroundColor = '#FF0'
        setTimeout(() => {
            alert(`You can only Deposit or Withdraw`);
        }, 100);
    } else if (Boolean(Number(amount.value)) === false && amount.value.toString() !== "0" || amount.value.trim() === '' || Number(amount.value) < 0) {
        amount.style.backgroundColor = '#FF0'
        setTimeout(() => {
            alert(`Please enter a positve number`);
        }, 100);
    } else if (notClear.checked !== true && notClear.checked !== false) {
        setTimeout(() => {
            alert(`Are you a hacker?`);
        }, 100);
    } else {
        addTransaction(account.value, action.value, Number(amount.value).toFixed(2), memo.value, notClear.checked);
        location.reload();        
    }

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
 
    if (accountName.value.trim() === '') {
        setTimeout(() => {
            alert(`Your Account Name can't be blank!`);
        }, 100);
    } else if (startBalance.value.trim() === '') {
        setTimeout(() => {
            alert(`Your Start Balance can't be blank!`);
        }, 100);
    } else { 
        addAccount(accountName.value.trim(), startBalance.value);
        accountName.value = '';
        startBalance.value = '';
        accountName.focus();
    }

} 


// read

function getAllAccountTransactions() {
    let output = [];
    const accountID = document.getElementById('account'); 
    if (accountID) {
        const accounts = localStorage[`account-${accountID.value}-transactions`];
        if (accounts !== undefined) {
            for (let account of accounts.split(';').slice(0, this.length - 1)) {
                output.push(account);
            }
            localStorage['user-state'] = accountID.value;
            return output;
        }
    }
}

function getTransactionByID(transactionID) {
    const numberOfAccounts = getAllAccounts().length;
    for (let i=0; i<numberOfAccounts; i++) {
        let accountTransactions = localStorage[`account-${i}-transactions`].split(';').slice(0, this.length - 1);
        for (let transaction of accountTransactions) {
            if (transaction.split(',')[0] === transactionID.toString()) {
                let output = [i, transaction]
                return output;
            } else {
                continue;
            }
        }
    }
    return "Not Found";
}

function getAllAccounts() {
    let output = [];
    const accounts = localStorage['accounts'].split(';').slice(0, this.length - 1);
    for (account of accounts) {
        output.push(account.split(','));
    };
    return output;
}

function getAccountByID(accountID) {
    const accounts = getAllAccounts();
    for (let account of accounts) {
        if (account[0] === accountID.toString()) {
            return account;
        }
    }
    return "Not found";
}

function getStartBalanceByID(accountID) {
    for (let account of getAllAccounts()) {
        if (account[0] === accountID.toString()) {
            return account[2];
        }
    }
}

function getAccountTransactionValues() {
    const account = document.getElementById('account').value;
    const start = getStartBalanceByID(account);
    output = [];
    if (account && start) {
        const transactions = localStorage[`account-${account}-transactions`].split(';').slice(0, this.length - 1);
        for (transaction of transactions) {
            let newArray = [transaction.split(',')[2], transaction.split(',')[4]]
            output.push(newArray);
        }
    }
    return output;
}

function getBankBalance() {
    const values = getAccountTransactionValues();
    const account = document.getElementById('account').value;
    const start = getStartBalanceByID(account);
    let bankBalance = Number(start);
    for (let value of values) {
        if (value[1] === 'false') {
            bankBalance += Number(value[0]);
        }
    }
    return bankBalance.toFixed(2);    
}

function getAvailableBalance() {
    const values = getAccountTransactionValues();
    const account = document.getElementById('account').value;
    const start = getStartBalanceByID(account);
    let availableBalance = Number(start);
    for (let value of values) {
        if (value[1] === 'false') {
            availableBalance += Number(value[0]);
        } else if (value[1] === 'true' && Number(value[0] < 0)) {
            availableBalance += Number(value[0]);
        }
    }
    return availableBalance.toFixed(2);
}

// UPDATE

function updateAccount(accountID, name, startBalance) {
    const account = getAccountByID(accountID).join(',') + ';';
    let newAccount = getAccountByID(accountID);
    if (name) {
        newAccount[1] = name;
    }
    if (startBalance || startBalance === "0" || startBalance === 0) {
        newAccount[2] = startBalance;
    }
    newAccount = newAccount.join(',') + ';';
    localStorage.setItem(
        'accounts', 
        localStorage['accounts'].replace(account, newAccount)
    );
    location.reload();
}

function updateTransaction(transactionID, action, amount, memo, notClear) {
    const transaction = getTransactionByID(transactionID)[1] + ';';
    const account = getTransactionByID(transactionID)[0];
    let newTransaction = getTransactionByID(transactionID)[1].split(',');
    if (action) {
        newTransaction[1] = action;
    }
    if (amount) {
        newTransaction[2] = amount;
    }
    if (action === "Withdrawal" && Number(amount) > 0) {
        newTransaction[2] = amount * -1;
    }
    if (memo || memo === "") {
        newTransaction[3] = memo;
    }
    if (notClear) {
        newTransaction[4] = notClear;
    }

    newTransaction = newTransaction.join(',') + ';';
    localStorage.setItem(
        `account-${account}-transactions`, 
        localStorage.getItem(`account-${account}-transactions`).replace(transaction, newTransaction)
    );
    location.reload();
}

function getEditTransactionData(transactionID) {

    const account = document.getElementById('account');
    const action = document.getElementById('action');
    const amount = document.getElementById('amount');
    const memo = document.getElementById('memo');
    const notClear = document.getElementById('not-clear');

    account.style.backgroundColor = '#fff';
    action.style.backgroundColor = '#fff';
    amount.style.backgroundColor = '#fff';
    memo.style.backgroundColor = '#fff';
    notClear.style.backgroundColor = '#fff';

    if (getAccountByID(account.value) === "Not found") {
        account.style.backgroundColor = '#ff0'
        setTimeout(() => {
            alert(`You must choose an account`);
        }, 100);
    } else if (action.value !== "Deposit" && action.value !== "Withdrawal") {
        action.style.backgroundColor = '#FF0'
        setTimeout(() => {
            alert(`You can only Deposit or Withdraw`);
        }, 100);
    } else if (Boolean(Number(amount.value)) === false && amount.value.toString() !== "0" || amount.value.trim() === '' || Number(amount.value) < 0) {
        amount.style.backgroundColor = '#FF0'
        setTimeout(() => {
            alert(`Please enter a positve number`);
        }, 100);
    } else if (notClear.checked !== true && notClear.checked !== false) {
        setTimeout(() => {
            alert(`Are you a hacker?`);
        }, 100);
    } else {
        updateTransaction(transactionID, action.value, Number(amount.value).toFixed(2), memo.value, notClear.checked);
        location.reload();        
    }

}

function toggleClear(transactionID) {
    const notClear = getTransactionByID(transactionID)[1].split(',')[4];
    if (notClear === "false") {
        updateTransaction(transactionID, "", "", "", "true");
    } else {
        updateTransaction(transactionID, "", "", "", "false");
    }
}

// DELETE

function deleteTransaction(transactionID) {
    let answer = confirm("Are you sure?");
    if (answer) {
        const numberOfAccounts = getAllAccounts().length;
        for (let i=0; i<numberOfAccounts; i++) {
            let accountTransactions = localStorage[`account-${i}-transactions`].split(';').slice(0, this.length - 1);
            for (let transaction of accountTransactions) {
                if (transaction.split(',')[0].toString() === transactionID.toString()) {
                    localStorage[`account-${i}-transactions`] = localStorage[`account-${i}-transactions`].replace(transaction + ';', '');
                    location.reload();
                } else {
                }
            }
        }
    }
}

function deleteAccount(accountID) {
    const account = getAccountByID(accountID).join(',') + ';';
    localStorage['accounts'] = localStorage['accounts'].replace(account, '')
    localStorage.removeItem(`account-${accountID}-transactions`);
    location.reload();
} 

// DOM //

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
    hideAddTransactionSection();
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
        <input class="form-control" id="amount" autocomplete="off"/>
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
    hideAddAccountSection();
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
        for (let account of accounts) {
            menu.innerHTML += `<option value="${account[0]}">${account[1]}</option>`;
        }
    }
}

function populateTransactionTable() {
    const transactions = getAllAccountTransactions();
    if (transactions !== undefined) {
        const container = document.getElementById('transaction-container');
        if (container) {
            removeAllChildren(container);
            for (let transaction of transactions.reverse()) {
                container.innerHTML += 
                `<div class="${transaction.split(',')[4] === 'true' ? "red" : "black"} well" id="well-${transaction.split(',')[0]}">
                    <p class="glyphicon glyphicon-pencil" style="float: right" class="no-margin"onclick="showTransactionEdit(${transaction.split(',')[0]})"></p>
                    <p class="no-margin">${transaction.split(',')[5]}</p>
                    <p class="no-margin">${transaction.split(',')[3].trim() === '' ? 'No Memo' : transaction.split(',')[3].trim()}</p>
                    <p class="no-margin">$${transaction.split(',')[2]}</p>
                    <p class="glyphicon glyphicon-remove" style="float: right" class="no-margin"onclick="deleteTransaction(${transaction.split(',')[0]})"></p>
                    <p class="no-margin">Not clear? <input ${transaction.split(',')[4] === 'true' ? 'checked' : ''} type="checkbox" onchange="toggleClear(${transaction.split(',')[0]})"/></p>
                </div>`
            }
        }
    }
    populateBalances();
}

function removeAllChildren(parent) {
    while (parent.firstChild) {
        parent.removeChild(parent.firstChild);
    }
}

function populateBalances() {
    const balanceSection = document.getElementById('balances');
    const account = document.getElementById('account');
    if (account.value) {
        balanceSection.innerHTML = `
        <div>
            <p>Available: $${getAvailableBalance(account.value)} | Bank: $${getBankBalance(account.value)}</p>
        </div>`;
    }
}

function showTransactionEdit(transactionID) {
    const domTransactions = document.getElementById('transaction-container');
    removeAllChildren(domTransactions);

    const editSection = document.getElementById('edit-transaction');
    const transaction = getTransactionByID(transactionID)[1].split(',');

    editSection.innerHTML = `
    <p>Change fields and save to edit the transaction (<a onclick="hideTransactionEdit()">hide form</a>)</p>
     
    <div class="form-group">
        <label>Action</label>
        <select class="form-control" id="action">
            <option value="Deposit">Deposit</option>
            <option value="Withdrawal">Withdrawal</option>
        </select>
    </div>
        
    <div class="form-group">
        <label>Amount</label>
        <input class="form-control" id="amount" autocomplete="off"/>
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
        <button class="btn btn-default" onclick="getEditTransactionData(${transactionID})">Save</button>
    </div>`

    const currentAction = document.getElementById('action');
    const currentAmount = document.getElementById('amount');
    const currentMemo = document.getElementById('memo');
    const currentNotClear = document.getElementById('not-clear');

    currentAction.value = transaction[1]
    if (Number(transaction[2]) < 0) {
        currentAmount.value = transaction[2] * -1
    } else {
        currentAmount.value = transaction[2]
    }
    currentMemo.value = transaction[3]
    if (transaction[4] = 'false') {
        !currentNotClear.checked
    } else if (transaction[4] = 'true') {
        currentNotClear.checked
    }

}

function hideTransactionEdit() {
    const editTransaction = document.getElementById('edit-transaction');
    removeAllChildren(editTransaction);
    populateTransactionTable();
}


// Errors // 

function alertUser() {
    alert("Something went wrong. Please check your inputs and try again.")
}


// Random
// This is a way to do initial caps. How ridiculous!
// action.value.slice(0,1).toUpperCase() + action.value.slice(1, action.value.length)


// State



populateAccountMenu();
checkUserState();
populateTransactionTable();
populateBalances();