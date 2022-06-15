const express = require('express');
const {Kafka} = require('kafkajs');
const nodemailer = require('nodemailer');

const app = express();

app.listen(3000, () => {
    console.log('Server Listening at port 3000');
});

const kafka = new Kafka({
    clientId: 'ms_emails',
    brokers: ['localhost:9092'],
});

const transport = nodemailer.createTransport({
    host: 'smtp.mailtrap.io',
    port: 2525,
    auth: {
        user: 'd71dc8151dc46b',
        pass: '20202e019926c6',
    },
});

const adminTopic = 'sendEmailToAllAdmins';
const usersTopics = {
    welcome: 'sendEmailToWelcomeNewUser',
    newBet: 'sendEmailToUserForNewBet',
    inviteToNewBet: 'sendEmailToUserForInviteToNewBet',
    resetPassword: 'sendEmailToUserForResetPassword',
};

const consumer_new_user = kafka.consumer({groupId: 'new-user'});

const consumer_bets = kafka.consumer({groupId: 'bets'});

const consumer_admin = kafka.consumer({groupId: 'admin'});

const consumer_reset_password = kafka.consumer({groupId: 'reset'});

const sendMailForNewUser = async (email, username) => {
    const message = {
        from: 'labylub@labluby.com.br',
        to: email,
        subject: 'Welcome Onboard!',
        html: `<h3> Welcome ${username} </h3>
        <p>
          <p>We are <strong>happy</strong> with your arrival!</p>
        </p>
        `,
    };

    transport.sendMail(message);
};

const sendMailForNewBet = async (email, username) => {
    const message = {
        from: 'labylub@labluby.com.br',
        to: email,
        subject: 'New Bet!',
        html: `<h3>Hello ${username}. New Bet Registred With Successfuly!</h3>
        <p>
          <p>You realizaded a bet</p>
          <p>The bet was added.</p>
        </p>`,
    };

    transport.sendMail(message);
};

const sendMailForNewBetToAdmin = async (email, username, user) => {
    const message = {
        from: 'labylub@labluby.com.br',
        to: email,
        subject: `New Bet made by ${user}!`,
        html: `<h3>Hello ${username}. New Bet Registred With Successfuly!</h3>
        <p>
          <p>${user} realizaded a bet</p>
          <p>The bet was added.</p>
        </p>`,
    };

    transport.sendMail(message);
};

async function sendMailForResetPassword(email, username) {
    const message = {
        from: 'labylub@labluby.com.br',
        to: email,
        subject: 'Password Reseted!',
        html: `<h3>Reset Password!</h3>
        <p>
          <p>Hello ${username}. You requested password reset.</p>
          <p>Password reseted with successfuly.</p>
        </p>`,
    };

    transport.sendMail(message);
}

async function sendMailForInviteToNewBet(email, username) {
    const message = {
        from: 'labylub@labluby.com.br',
        to: email,
        subject: 'We missed you!',
        html: `<h3> Hello ${username} </h3>
        <p>
          <p>We noticed that you haven't placed any bets in the last week.</p>
          <p>How about placing a bet now? Luck awaits you!</p>
        </p>`,
    };

    transport.sendMail(message);
}

const runSendMailForNewUser = async () => {
    await consumer_new_user.connect();
    await consumer_new_user.subscribe({topic: usersTopics.welcome});
    await consumer_new_user.run({
        eachMessage: async ({message}) => {
            const {user} = JSON.parse(message.value.toString());
            const {email, username} = user;
            sendMailForNewUser(email, username);
        },
    });
};

const runSendMailForNewBet = async () => {
    await consumer_bets.connect();
    await consumer_bets.subscribe({topic: usersTopics.newBet});
    await consumer_bets.run({
        eachMessage: async ({message}) => {
            const {user} = JSON.parse(message.value.toString());
            const {email, username} = user;
            sendMailForNewBet(email, username);
        },
    });
};

const runSendMailForNewBetToAdmin = async () => {
    await consumer_admin.connect();
    await consumer_admin.subscribe({topic: adminTopic});
    await consumer_admin.run({
        eachMessage: async ({message}) => {
            const {admin} = JSON.parse(message.value.toString());
            const {email, username, user} = admin;
            sendMailForNewBetToAdmin(email, username, user);
        },
    });
};

const runSendMailForResetPassword = async () => {
    await consumer_reset_password.connect();
    await consumer_reset_password.subscribe({topic: usersTopics.resetPassword});
    await consumer_reset_password.run({
        eachMessage: async ({message}) => {
            const {user} = JSON.parse(message.value.toString());
            const {email, username} = user;
            sendMailForResetPassword(email, username);
        },
    });
};

const runSendMailForInviteToNewBet = async () => {
    await consumer_reset_password.connect();
    await consumer_reset_password.subscribe({topic: usersTopics.inviteToNewBet});
    await consumer_reset_password.run({
        eachMessage: async ({message}) => {
            const {user} = JSON.parse(message.value.toString());
            const {email, username} = user;
            sendMailForInviteToNewBet(email, username);
        },
    });
};

runSendMailForNewUser().catch((error) => console.log(error));
runSendMailForNewBet().catch((error) => console.log(error));
runSendMailForNewBetToAdmin().catch((error) => console.log(error));
runSendMailForResetPassword().catch((error) => console.log(error));
runSendMailForInviteToNewBet().catch((error) => console.log(error));
