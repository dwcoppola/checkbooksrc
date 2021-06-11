/* 
I chose not to use classes in this exercise, but I did use objects
which I stringify and re-parse as needed
*/

// This basically tells the program what account the user is currently looking at
function checkUserState() {
    const accountID = localStorage['userState'];
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

// This adds an account object to the local storage
function addAccount(accountName, startBalance) {

    const account = {
        'id': getCurrentID('accountId'),
        'name': accountName,
        'startBalance': startBalance,
        'bankBalance': startBalance,
        'availableBalance': startBalance
    }

    localStorage[`account-${account.id}`] = JSON.stringify(account);
    localStorage['userState'] = account.id;
    
    incrementID('accountId');
    
    alert(`You have successfully added "${accountName}"`);
    location.reload();

}

function getAccountByID(id) {
    if (localStorage[`account-${id}`]) {
        return JSON.parse(localStorage[`account-${id}`]);
    } else {
        return null;
    }
}

function getAllAccounts() {
    let accounts = [];
    for (let i=0; i<Number(localStorage.accountId); i++) {
        if (localStorage[`account-${i}`]) {
            accounts.push(JSON.parse(localStorage[`account-${i}`]));
        }
    }
    return accounts
}

function promptForNameChange() {
    const accountId = document.getElementById('account').value;
    if (accountId !== '') {
        const newName = prompt('What would you like to rename this Account?');
        if (newName !== null || newName !== '') {
            changeAccountName(accountId, newName);
            location.reload();
        }
    } else {
        alert(`You're either a hacker or you don't have any accounts selected to edit`);
    }
}

function changeAccountName(id, newName) {
    let account = getAccountByID(id);
    account.name = newName;
    localStorage[`account-${id}`] = JSON.stringify(account);
}

function promptForDelete() {
    const accountId = document.getElementById('account').value;
    deleteAccount(accountId);
}

function cascadeDeleteTransactions(accountId) {
    const list = getAccountTransactions(accountId)
    for (item of list) {
        localStorage.removeItem(`transaction-${item.id}`);
    }
    location.reload()
}

function deleteAccount(id) {
    if (localStorage[`account-${id}`]) {
        const answer = confirm('Are you sure? This is not irreversible?')
        if (answer) {
            localStorage.removeItem(`account-${id}`)
        } else {
            // Do nothing
        }
        // Will add a cascade feature later when it's time (to purge irrelevant transactions)
        cascadeDeleteTransactions(id);
        location.reload();

    } else {
        alert(`You either don't have an account selected, or you hacked me.`)
    }
} 

// Add a transaction object to local storage
function addTransaction(accountID, action, amount, memo, notClear) {

    if (action == "Withdrawal") {
        amount = Number(amount) * -1;
    }

    // The object
    let transaction = {
        'id': getCurrentID('transactionId'),
        'account': getAccountByID(accountID),
        'action': action,
        'amount': amount,
        'memo': memo,
        'notClear': notClear,
        'time': (new Date()).toString().slice(0,15)
    }

    // Turns the object literal into a string and saves it in local storage
    localStorage[`transaction-${transaction.id}`] = JSON.stringify(transaction);
    incrementID('transactionId');

    updateBalances(accountID);

}

function getTransactionByID(id) {
    if (localStorage[`transaction-${id}`]) {
        return JSON.parse(localStorage[`transaction-${id}`]);
    } else {
        return null;
    }
}

function getAllTransactions() {
    let transactions = [];
    for (let i=0; i<Number(localStorage.transactionId); i++) {
        if (localStorage[`transaction-${i}`]) {
            transactions.push(JSON.parse(localStorage[`transaction-${i}`]));
        }
    }
    return transactions;
}

function getAccountTransactions(id) {
    let output = [];
    const transactions = getAllTransactions();
    for (transaction of transactions) {
        if (transaction.account.id.toString() === id.toString())  {
            output.push(transaction);
        }
    }
    return output;
}

function updateTransaction(id, action, amount, memo, notClear) {
    let transaction = getTransactionByID(id);
    if (transaction) {
        if (action) {
            transaction.action = action
        }
        if (amount) {
            transaction.amount = amount
        }
        if (memo || memo === '') {
            transaction.memo = memo
        }
        if (notClear === false || notClear === true) {
            transaction.notClear = notClear
        }
    }

    localStorage[`transaction-${id}`] = JSON.stringify(transaction);

    updateBalances(transaction.account.id);

}

function deleteTransaction(id) {
    const transaction = getTransactionByID(id);
    if (localStorage[`transaction-${id}`]) {
        const answer = confirm('Are you sure? This is not irreversible?')
        if (answer) {
            localStorage.removeItem(`transaction-${id}`);
            updateBalances(transaction.account.id)
            location.reload();
        } else {
            // Do nothing
        }
    } else {
        console.log('What account is that?')
    }    
}

function updateBalances(accountId) {
    // might be able to use th object instead of the id; just a thought
    const transactions = getAccountTransactions(accountId);
    let account = getAccountByID(accountId);

    if (getAllTransactions().length !== 0) {

        account.bankBalance = account.startBalance;
        account.availableBalance = account.startBalance;
        
        for (let transaction of transactions) {
            if (transaction.notClear === false) {
                account.bankBalance = (Number(account.bankBalance) + Number(transaction.amount)).toFixed(2);
                account.availableBalance = (Number(account.availableBalance) + Number(transaction.amount)).toFixed(2);
            } else if (transaction.notClear === true && Number(transaction.amount < 0)) {
                account.availableBalance = (Number(account.availableBalance) + Number(transaction.amount)).toFixed(2);
            }
        }

    } else if (getAllTransactions().length === 0) {
        account.bankBalance = account.startBalance;
        account.availableBalance = account.startBalance;
    }

    localStorage[`account-${accountId}`] = JSON.stringify(account);

}

/* Checks local storage and sets up some keys for use in the program if 
they don't already exist Also prompts user to add an account on their 
first time using the program */
function checkStorage() {
    if (localStorage['accountId'] === undefined) {
        localStorage['accountId'] = 0;
    }
    if (localStorage['transactionId'] === undefined) {
        localStorage['transactionId'] = 0;
    }
    if (localStorage['userState'] === undefined) {
        localStorage['userState'] = '';
    }
    if (localStorage['accountId'] === "0") {
        const newAccountName = prompt(`To continue, please tell us what you would like your first account to be called:`);
        const accountStartBalance = prompt(`And what is the starting balance?`);
        if (newAccountName === null || accountStartBalance === null) {
            alert('No problem. You can always do this later. Enjoy the app!');
        } else {
            if (!Boolean(Number(accountStartBalance))) {
                alert(`'The information you entered isn't going to work, but that's ok. You can always do this later. Enjoy the app!`);
            } else {
                addAccount(newAccountName, accountStartBalance);
            }
        }
    }
}

// For me
function clearStorage() {
    localStorage.clear();
    location.reload();
}

function incrementID(key) {
    localStorage[key] = Number(localStorage[key]) + 1;
}

function getCurrentID(key) {
    return localStorage[key];
}

// This gets the data from the add account form
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
    } else if (Boolean(Number(startBalance.value)) === false && Number(startBalance.value) !== 0) {
        setTimeout(() => {
            alert(`Start balance should be a number!`);
        }, 100);
    } else { 
        addAccount(accountName.value.trim(), startBalance.value);
        accountName.value = '';
        startBalance.value = '';
        accountName.focus();
    }

} 

// This gets the data from the add transaction form
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

    /* 
        These are tests for when a user is the one sending data
    */ 
        
    // Checks if account exists
    if (getAccountByID(account.value) === null) {
        account.style.backgroundColor = '#ff0'
        setTimeout(() => {
            alert(`You must choose an account`);
        }, 100);
    // Checks for a valid action of which there are 2
    } else if (action.value !== "Deposit" && action.value !== "Withdrawal") {
        action.style.backgroundColor = '#FF0'
        setTimeout(() => {
            alert(`You can only Deposit or Withdraw`);
        }, 100);
    // Check that the user puts in a number with 0 or 1 decimal point as an amount
    } else if ( Boolean(Number(amount.value)) === false && 
                amount.value.toString() !== "0" || 
                amount.value.trim() === '' || 
                Number(amount.value) < 0) {
        amount.style.backgroundColor = '#FF0'
        setTimeout(() => {
            alert(`Please enter a positve number`);
        }, 100);
    // CHeck if a non boolean value is submitted and then cracks a joke if so
    } else if (notClear.checked !== true && notClear.checked !== false) {
        setTimeout(() => {
            alert(`Are you a hacker?`);
        }, 100);
    } else {
    // Let's the data through into the function that creates the transaction object
        addTransaction(account.value, action.value, Number(amount.value).toFixed(2), memo.value, notClear.checked);
        location.reload();
    }

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
    } else if ( Boolean(Number(amount.value)) === false && 
                amount.value.toString() !== "0" || 
                amount.value.trim() === '' || 
                Number(amount.value) < 0) {
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

function renderAddAccountForm() {
    const addAcctSect = document.getElementById('add-account');
    addAcctSect.innerHTML = `
        <p>Fill out the form to add an account (<a onclick="hideAddAccountForm()">hide form</a>)</p>      
        <div class="form-group">
            <label>Account Name</label>
            <input onkeypress="getAccountDataWithEnter(event)" class="form-control" id="account-name" autocomplete="off"/>
        </div>
        <div class="form-group">
            <label>Start Balance</label>
            <input onkeypress="getAccountDataWithEnter(event)" class="form-control" id="start-balance" autocomplete="off"/>
        </div>
        <div class="form-group">       
            <button onclick="getAccountData()" class="btn btn-default">Save</button>
        </div>`;
    const accountName = document.getElementById('account-name');
    accountName.focus();
    hideAddTransactionForm();
}

function hideAddAccountForm() {
    const addAccount = document.getElementById('add-account');
    removeAllChildren(addAccount);
    addAccount.innerHTML = `<button onclick="renderAddAccountForm()" class="btn btn-default">Add Account</button>`;
}

function showAddTransactionSection() {
    const addTransSect = document.getElementById('add-transaction');
    addTransSect.innerHTML = `
        <p>Fill out the form to add a transaction (<a onclick="hideAddTransactionForm()">hide form</a>)</p>  
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
            <input onkeypress="getTransactionDataWithEnter(event)" class="form-control" id="amount" autocomplete="off"/>
        </div>
        <div class="form-group">
            <label>Memo</label>
            <input onkeypress="getTransactionDataWithEnter(event)" class="form-control" id="memo" autocomplete="off"/>
        </div>
        <div class="form-group">
            <label>Not Clear?</label>
            <input type="checkbox" id="not-clear"/>
        </div>
        <div class="form-group">
            <button class="btn btn-default" onclick="getTransactionData()">Save</button>
        </div>`
    hideAddAccountForm();
}

function hideAddTransactionForm() {
    const addTransaction = document.getElementById('add-transaction');
    removeAllChildren(addTransaction);
    addTransaction.innerHTML = `<button onclick="showAddTransactionSection()" class="btn btn-default">Add Transaction</button>`;
}

function populateAccountMenu() {
    const accounts = getAllAccounts();
    const menu = document.getElementById('account');
    if (menu !== null) {
        for (let account of accounts) {
            menu.innerHTML += `<option value="${account.id}">${account.name}</option>`;
        }
    }
}

function populateTransactionTable() {
    const accountId = document.getElementById('account').value;
    localStorage.userState = accountId;
    const transactions = getAccountTransactions(accountId);
    if (transactions !== undefined) {
        const container = document.getElementById('transaction-container');
        if (container) {
            removeAllChildren(container);
            for (let transaction of transactions.reverse()) {
                container.innerHTML += 
                `<div class="${transaction.notClear === true ? "red" : "black"} well" id="well-${transaction.id}">
                    <p class="glyphicon glyphicon-pencil" style="float: right" class="no-margin"onclick="showTransactionEdit(${transaction.id})"></p>
                    <p class="no-margin">${transaction.time}</p>
                    <p class="no-margin">${transaction.memo === '' ? 'No Memo' : transaction.memo}</p>
                    <p class="no-margin">$${transaction.amount}</p>
                    <p class="glyphicon glyphicon-remove" style="float: right" class="no-margin"onclick="deleteTransaction(${transaction.id})"></p>
                    <p class="no-margin">Not clear? <input ${transaction.notClear === true ? 'checked' : ''} type="checkbox" onchange="toggleClear(${transaction.id})"/></p>
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
    const account = getAccountByID(document.getElementById('account').value);
    if (account) {
        balanceSection.innerHTML = `
        <div>
            <p>Available: $${account.availableBalance} | Bank: $${account.bankBalance}</p>
        </div>`;
    }
}

function showTransactionEdit(transactionID) {
    const domTransactions = document.getElementById('transaction-container');
    removeAllChildren(domTransactions);

    const editSection = document.getElementById('edit-transaction');
    const transaction = getTransactionByID(transactionID);
    
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

    currentAction.value = transaction.action
    
    if (Number(transaction.amount) < 0) {
        currentAmount.value = transaction.amount * -1
    } else {
        currentAmount.value = transaction.amount
    }
    
    currentMemo.value = transaction.memo
    
    if (transaction.notClear === false) {
        currentNotClear.checked = false;
    } else if (transaction.notClear === true) {
        currentNotClear.checked = true;
    }

}

function toggleClear(transactionID) {
    const transaction = getTransactionByID(transactionID);
    if (transaction.notClear === false) {
        updateTransaction(transactionID, null, null, null, true);
    } else {
        updateTransaction(transactionID, null, null, null, false);
    }
    location.reload();
}

function hideTransactionEdit() {
    const editTransaction = document.getElementById('edit-transaction');
    removeAllChildren(editTransaction);
    populateTransactionTable();
}

function getAccountDataWithEnter(event) {
    const keyPress = event.keyCode || event.which;
    if (keyPress === 13) {
        getAccountData();
    }
}

function getTransactionDataWithEnter(event) {
    const keyPress = event.keyCode || event.which;
    if (keyPress === 13) {
        getTransactionData();
    }
}

function getEditTransactionDataWithEnter(event, transactionID) {
    const keyPress = event.keyCode || event.which;
    if (keyPress === 13) {
        getTransactionData(transactionID);
    }    
}

checkStorage();
populateAccountMenu();
checkUserState();
populateBalances();
populateTransactionTable();
