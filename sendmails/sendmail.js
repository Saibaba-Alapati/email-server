const nodemailer = require('nodemailer');

async function main(){
    let transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure:false,
        auth:{
            user: 'senderemail@gmail.com',
            pass: 'senderpassword',
        }
    });
    let info =await transporter.sendMail({
        from: '"Sender 👻" <senderemail@gmail.com>',
        to: 'receiveremail@gmail.com', //can be a list
        subject:"test 1",
        text:'You there?',
        html:"<b>hello bro</b>"
    });
    console.log("Message sent:%s",info.messageId);
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
}

main().catch(console.error);