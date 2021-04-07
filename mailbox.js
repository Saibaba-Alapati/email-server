const { error } = require('console');
const Imap = require('imap'),inspect = require('util').inspect;


let getEmailFromInbox = (mailServer) => {
    mailServer.openBox('INBOX', true, function (err, box) {
        if (err) throw err;
        // we can define range '1:3'
        let f = mailServer.seq.fetch('1:*', {
            bodies: 'HEADER.FIELDS (FROM TO SUBJECT DATE)',
            struct: true
        });
        f.on('message', function (msg, seqno) {
            console.log('Message #%d', seqno);
            let prefix = '(#' + seqno + ') ';
            msg.on('body', function (stream, info) {
                let buffer = '';
                stream.on('data', function (chunk) {
                    buffer += chunk.toString('utf8');
                });
                stream.once('end', function () {
                    console.log(prefix + 'Parsed header: %s', inspect(Imap.parseHeader(buffer)));
                });
            });
        });
        f.once('error', function (err) {
            console.log('Fetch error: ' + err);
        });
        f.once('end', function () {
            console.log('Done fetching all messages!');
            //mailServer.end();
        });
    });
}

let createLabel = (mailServer, labelName) => {
    mailServer.addBox(labelName, (err) => {});
    console.log('message', 'New Label or Box Created');
}

let getMailboxStatusByName = (mailServer,inboxName) =>{
    mailServer.status(inboxName,(err,mailbox)=>{
        console.log('message',mailbox);
    });
    console.log('message', 'Label or Box Status');
}

let getMailboxLabels = (mailServer)=>{
    mailServer.getBoxes((error,mailbox)=>{
        console.log('message',mailbox);
    })
}

let deleteLabel = (mailServer,labelName) => {
    mailServer.delBox(labelName,(error)=>{});
    console.log('message', 'Label or Box removed');
}
let imap  = new Imap({
    user : 'yourgmail@gmail.com', //replace with your gmail
    password:'yourpassword', //replace with your password
    host: 'imap.gmail.com',
    port:993,
    tls:true,
    tlsOptions:{
        rejectUnauthorized: false
    },
    authTimeout:3000
}).once('error',function(err){
    console.log(err.message);
});

imap.once('ready',function(){
    imap.openBox('INBOX',true,function(err,box){
        if(err){
            console.log('Error %s'+err.message);
        }
        console.log('message','server1 ready');
    });

    //operations
    getMailboxLabels(imap);
    getEmailFromInbox(imap)
    deleteLabel(imap, "demo-label1");
    getMailboxStatusByName(imap, "INBOX");
})

imap.connect();