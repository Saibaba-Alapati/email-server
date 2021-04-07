const Imap = require('imap'),inspect = require('util').inspect;

let getEmailFromInbox = (imapServer) => {
    imapServer.openBox('INBOX', true, function (err, box) {
        if (err) throw err;
        let f = imapServer.seq.fetch('1:*', {
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
            imapServer.end();
        });
    });
}

let createLabel = (imapServer, labelName) => {
    imapServer.addBox(labelName, (err) => {});
    console.log('message', 'New Label or Box Created');
}

let getMailboxStatusByName = (imapServer,inboxName) =>{
    imapServer.status(inboxName,(err,mailbox)=>{
        console.log('message',mailbox);
    });
    console.log('message', 'Label or Box Status');
}

let getMailboxLabels = (imapServer)=>{
    imapServer.getBoxes((error,mailbox)=>{
        console.log('message',mailbox);
    })
}

let deleteLabel = (imapServer,labelName) => {
    imapServer.delBox(labelName,(error)=>{});
    console.log('message', 'Label or Box removed');
}
let imapServer  = new Imap({
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

imapServer.once('ready',function(){
    imapServer.openBox('INBOX',true,function(err,box){
        if(err) throw (err);
        console.log('message','server1 ready');
    });

    //operations
    getMailboxLabels(imapServer);
    getEmailFromInbox(imapServer)
    deleteLabel(imapServer, "demo-label1");
    getMailboxStatusByName(imapServer, "INBOX");
})

imapServer.connect();