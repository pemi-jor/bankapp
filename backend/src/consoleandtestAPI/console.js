import readline from "readline-sync";
import * as fs from "fs";

const userdataloc = "./src/user_data.json";

const getAllUsers = () => {
    const readfile = fs.readFileSync(userdataloc);
    if (readfile.length !== 0) {
        const jsonObject = JSON.parse(readfile);
        return jsonObject;
    }
    return [];
};
let loggedUser = null;
let allUsers = getAllUsers();

const addUser = (user) => {
    const readfile = fs.readFileSync(userdataloc);
    if (readfile.length !== 0) {
        allUsers = JSON.parse(readfile);
        allUsers = [
            ...allUsers,
            user,
        ];
    } else {
        allUsers = [
            user,
        ];
    }
    fs.writeFileSync(userdataloc,
        JSON.stringify(allUsers),
        (err) => {
            if (err) console.log(err);
            else console.log("Success");
        });
    if (loggedUser !== null) {
        loggedUser = allUsers.find((x) => x.id === parseInt(loggedUser.id, 10));
    }
};

const updateUser = (user) => {
    const readfile = fs.readFileSync(userdataloc);
    if (readfile.length !== 0) {
        allUsers = JSON.parse(readfile);
        const i = allUsers.findIndex((x) => x.id === user.id);
        allUsers[i] = user;
    } else {
        allUsers = [
            user,
        ];
    }
    fs.writeFileSync(userdataloc,
        JSON.stringify(allUsers),
        (err) => {
            if (err) console.log(err);
            else console.log("Success");
        });
};

const findUserByID = (errMessageEnd = "") => {
    let waiting = true;
    let user;
    while (waiting) {
        const input = readline.question("");
        user = allUsers.find((x) => x.id === parseInt(input, 10));
        if (!user) {
            console.log("Mhmm, unfortunately an account with that ID does not exist. " +
            `${errMessageEnd}`);
        } else {
            waiting = false;
        }
    }
    return user;
};

const validatePassword = (user) => {
    let waiting = true;
    while (waiting) {
        const input = readline.question("");
        if (input === user.password) {
            waiting = false;
        } else {
            console.log("Ah, there must by a typo. Try typing it again.");
        }
    }
};

const helpCommand = () => {
    console.log(`I’m glad to help you :) Here’s a list of commands you can use!
    
    Accounts
    create_account -- > Opens dialog for creating an account.
    close_account -- > Opens a dialog for closing an account.
    modify_account -- > Opens a dialog for modifying an account.
    does_account_exist -- > Opens a dialog for checking if the account exists.
    log_in -- > Opens a dialog for logging in.
    logout -- > Opens a dialog for logging out.
    
    Funds
    withdraw_funds -- > Opens a dialog for withdrawing funds.
    deposit_funds -- > Opens a dialog for depositing funds.
    transfer_funds -- > Opens a dialog for transferring funds to another account.
    
    Requests
    request_funds -- > Opens a dialog for requesting another user for funds.
    funds_requests -- > Shows all the requests for the account funds.
    accept_fund_request -- > Opens a dialog for accepting a fund request.`);
};

const generateID = () => {
    const readfile = fs.readFileSync(userdataloc);
    if (readfile.length !== 0) {
        const jsonObject = JSON.parse(readfile);
        const ids = jsonObject.map((x) => x.id);
        const maxID = ids.reduce((arr, cur) => Math.max(arr, cur));
        return maxID + 1;
    }

    return 1;
};

const createAccount = () => {
    let waiting = true;
    let name = "";
    let password = "";
    let bal = 0;

    while (waiting) {
        const input = readline.question("So you want to create a new account! " +
        "Let’s start with the easy question. What is your name?");

        if (input.length !== 0) {
            name = input;
            waiting = false;
        }
    }
    console.log(`Hey ${name}! It’s create to have you as a client.\n` +
    "How much cash do you want to deposit to get started with your account? (10€ is the minimum)");
    waiting = true;
    while (waiting) {
        const input = readline.question("");

        if (Number(input) >= 10) {
            bal = Number(input);
            waiting = false;
        } else if (Number(input) < 10) {
            console.log("Unfortunately we can’t open an account for such a small account. " +
            "Do you have any more cash with you?");
        } else {
            console.log("Deposit needs to a number");
        }
    }

    const nextid = generateID();
    console.log(`Great ${name}! You now have an account (ID: ${nextid}) with balances of ${bal}€.
    We’re happy to have you as a customer, and we want to ensure that your money is safe with us.` +
    " Give us a password, which gives only you the access to  your account.");
    waiting = true;
    while (waiting) {
        const input = readline.question("");

        if (input.length !== 0) {
            password = input;
            waiting = false;
        }
    }
    const user = {
        name,
        password,
        id: nextid,
        balance: bal,
        fund_requests: [],
    };

    addUser(user);
};

const withdrawFunds = () => {
    let waiting = true;
    console.log("Okay, let’s whip up some cash for you from these ones and zeroes. \n" +
    "What is your account ID?");
    let user;
    if (loggedUser === null) {
        user = findUserByID("Try again.");
        console.log("Okay, we found an account with that ID. " +
        "You will need to insert your password so we can validate it’s actually you.");
        validatePassword(user);
    } else {
        user = loggedUser;
    }
    console.log(`Awesome, we validated you ${user.name}! ` +
    `How much money do you want to withdraw? (Current balance: ${user.balance}€)`);

    while (waiting) {
        const input = readline.question("");

        if (parseInt(input, 10) <= user.balance) {
            user.balance -= parseInt(input, 10);
            updateUser(user);
            console.log(`Awesome, you can now enjoy your ${input}€ in cash!` +
            `There’s still ${user.balance}€ in your account, safe with us.`);
            waiting = false;
        } else {
            console.log("Unfortunately you don’t have the balance for that. " +
            "Let’s try a smaller amount.");
        }
    }
};

const depositFunds = () => {
    let waiting = true;
    console.log(`Okay, let’s whip up some cash for you from these ones and zeroes.
    What is your account ID?`);
    let user;
    if (loggedUser === null) {
        user = findUserByID("Try again.");
        console.log("Okay, we found an account with that ID. " +
        "You will need to insert your password so we can validate it’s actually you.");
        validatePassword(user);
    } else {
        user = loggedUser;
    }

    console.log(`Awesome, we validated you ${user.name}! ` +
    `How much money do you want to deposit? (Current balance: ${user.balance}€)`);
    while (waiting) {
        const input = readline.question("");

        if (parseInt(input, 10) > 0) {
            user.balance += parseInt(input, 10);
            updateUser(user);
            console.log(`Awesome, you can now enjoy your ${input}€ in cash! ` +
            `There’s still ${user.balance}€ in your account, safe with us.`);
            waiting = false;
        } else {
            console.log("Deposit needs to be more than 0€");
        }
    }
};
const transferFunds = () => {
    let transfer = 0;
    let waiting = true;
    console.log(`Okay, let’s whip up some cash for you from these ones and zeroes.
    What is your account ID?`);
    let user;
    if (loggedUser === null) {
        user = findUserByID("Try again.");
        console.log("Okay, we found an account with that ID. " +
        "You will need to insert your password so we can validate it’s actually you.");
        validatePassword(user);
    } else {
        user = loggedUser;
    }
    console.log(`Awesome, we validated you ${user.name}! ` +
    `How much money do you want to withdraw? (Current balance: ${user.balance}€)`);
    while (waiting) {
        const input = readline.question("");

        if (parseInt(input, 10) <= user.balance) {
            user.balance -= parseInt(input, 10);
            transfer = parseInt(input, 10);
            waiting = false;
        } else {
            console.log("Unfortunately you don’t have the balance for that. " +
            "Let’s try a smaller amount.");
        }
    }
    console.log("Awesome, we can do that. " +
    "What is the ID of the account you want to transfer these funds into?");
    const userToTransfer = findUserByID("Try again.");
    userToTransfer.balance += transfer;
    updateUser(user);
    updateUser(userToTransfer);
};
const doesAccountExist = () => {
    let waiting = true;
    console.log("Mhmm, you want to check if an account with an ID exists. " +
    "Let’s do it! Give us the ID and we’ll check.");
    while (waiting) {
        const input = readline.question("");
        const user = allUsers.find((x) => x.id === parseInt(input, 10));
        if (!user) {
            console.log("Mhmm, unfortunately an account with that ID does not exist.");
            waiting = false;
        } else {
            console.log("Awesome! This account actually exists. " +
            "You should confirm with the owner that this account is actually his.");
            waiting = false;
        }
    }
};
const modifyAccount = () => {
    console.log("Mhmm, you want to modify an accounts stored holder name. " +
    "We can definitely do that! Let’s start validating you with your ID!");
    const user = findUserByID();
    console.log("Okay, we found an account with that ID. " +
    "You will need to insert your password so we can validate it’s actually you.");
    validatePassword(user);
    console.log(`Awesome, we validated you ${user.name}! ` +
    "What is the new name for the account holder?");
    let waiting = true;
    while (waiting) {
        const input = readline.question("");
        if (user.name === input) {
            console.log("Mhmm, I’m quite sure this is the same name. Try typing it out again.");
        } else {
            user.name = input;
            waiting = false;
        }
    }
    updateUser(user);
    console.log(`Ah, there we go. We will address you as ${user} from now on.`);
};

const login = () => {
    console.log("So you want to log in? Give us your ID.");
    const user = findUserByID("Try again.");
    console.log("Okay, we found an account with that ID. " +
    "You will need to insert your password so we can validate it’s actually you.");
    validatePassword(user);
    loggedUser = user;
    console.log(`Awesome, we validated you ${loggedUser.name}! You are now logged in`);
};

const logout = () => {
    let waiting = true;
    if (loggedUser === null) {
        waiting = false;
        console.log("No user is currently logged in");
    } else {
        console.log("Are you sure you wish to logout?");
    }
    while (waiting) {
        const input = readline.question("");
        if (input.toLowerCase() === "yes") {
            loggedUser = null;
            waiting = false;
        } else if (input.toLowerCase() === "no") {
            waiting = false;
        } else {
            console.log("Are you sure you wish to logout? (yes/no)");
        }
    }
};

const generateFundRequestID = (user) => {
    if (user.fund_requests.length !== 0) {
        const ids = user.fund_requests.map((x) => x.id);
        const maxID = ids.reduce((arr, cur) => Math.max(arr, cur));
        return maxID + 1;
    }
    return 1;
};

const requestFunds = () => {
    if (loggedUser === null) {
        console.log("You need to be logged in to request funds");
        return;
    }
    let waiting = true;
    let fundObj;
    console.log("So you want request funds from someone? Give us their ID.");
    const userToRequest = findUserByID();
    console.log("Okay, we found an account with that ID. How much money do you want to request?");
    while (waiting) {
        const input = readline.question("");
        if (parseInt(input, 10) > 0) {
            fundObj = {
                id: generateFundRequestID(userToRequest),
                userID: loggedUser.id,
                amount: parseInt(input, 10),
            };
            waiting = false;
        }
    }
    userToRequest.fund_requests = [...userToRequest.fund_requests, fundObj];
    updateUser(userToRequest);
    console.log(`Awesome! We’ll request that amount from the user with ID ${userToRequest.id}.`);
};

const fundRequests = () => {
    if (loggedUser === null) {
        console.log("You need to be logged in to check fund requests");
        return;
    }
    if (loggedUser.fund_requests.length === 0) {
        console.log("You don't have any fund requests");
    } else {
        const requests = loggedUser.fund_requests;
        console.log("Here’s all the requests that are out for your funds.");
        requests.forEach((x) => {
            console.log(`${x.amount} euros for user ${x.userID}.`);
        });
    }
};

const acceptFundRequest = () => {
    if (loggedUser === null) {
        console.log("You need to be logged in to accept fund request");
        return;
    }

    console.log("So you want to accept someones fund request? Give us their ID.");

    const requests = loggedUser.fund_requests;
    let userToTransfer;
    let request;
    let waiting = true;

    while (waiting) {
        const input = readline.question("");
        request = requests.find((x) => x.userID === parseInt(input, 10));

        if (!request) {
            console.log("Mhmm, unfortunately there’s no request for " +
            "your funds with that account ID. Try again?");
        } else {
            waiting = false;
        }
    }
    console.log(`Okay, we found a request for your funds of ${request.amount} euros.` +
    "Type yes to accept this request.");

    waiting = true;

    while (waiting) {
        const input = readline.question("");
        if (input === "yes" && loggedUser.balance < request.amount) {
            console.log("Unfortunately you don’t have the funds for a request like this!");
            waiting = false;
        } else if (input === "yes" && loggedUser.balance >= request.amount) {
            console.log("Good! Now these funds has been transferred to the account" +
            `, with ID ${request.userID}.`);
            userToTransfer = allUsers.find((x) => x.id === request.userID);
            userToTransfer.balance += request.amount;
            loggedUser.balance -= request.amount;
            loggedUser.fund_requests = requests.filter((item) => item.id !== request.id);
            updateUser(userToTransfer);
            updateUser(loggedUser);
            waiting = false;
        }
    }
};

const commands = [
    { command: "help", action: helpCommand },
    { command: "create_account", action: createAccount },
    { command: "withdraw_funds", action: withdrawFunds },
    { command: "deposit_funds", action: depositFunds },
    { command: "transfer_funds", action: transferFunds },
    { command: "does_account_exist", action: doesAccountExist },
    { command: "modify_account", action: modifyAccount },
    { command: "log_in", action: login },
    { command: "log_out", action: logout },
    { command: "request_funds", action: requestFunds },
    { command: "fund_requests", action: fundRequests },
    { command: "accept_fund_request", action: acceptFundRequest },
];

let running = true;
console.log("Welcome to the Solo Deposits banking CLI!");

while (running) {
    const input = readline.question("");
    if (input.toLowerCase() === "exit") {
        running = false;
    }

    commands.forEach((x) => {
        if (x.command === input.toLowerCase()) {
            x.action();
        }
    });
}
