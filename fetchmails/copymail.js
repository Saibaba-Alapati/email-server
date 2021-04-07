const Imap = require('imap'), inspect = require('util').inspect;

let copyEmail = (imapServer1, imapServer2, emailServerName) => {
    imapServer1.search(['ALL'], (error, uids) => {
        var count = uids.length;
        var f = imapServer1.fetch(uids, { bodies: 'HEADER.FIELDS (FROM TO SUBJECT DATE)', struct: true });

        f.on('message', function (msg, seqno) {
            var buffer = [], bufLen = 0, bufferText = '';
            msg.on('body', function (stream, info) {
                stream.on('data', function (chunk) {
                    bufferText += chunk.toString('utf8');
                    buffer.push(chunk);
                    bufLen += chunk.length;
                });
                stream.once('end', function () {
                    console.log('Parsed header: %s', inspect(Imap.parseHeader(bufferText)));                  // email contents
                    console.log(`====${emailServerName} - Finished message no. ${seqno} =======`);            // email email seqno
                    buffer = Buffer.concat(buffer, bufLen);
                    imapServer2.append(buffer, {
                        date: new Date(msg.date),
                        flags: ['Seen']
                    }, function (err) {
                        if (err) throw err;
                        if (--count === 0) {
                            console.log('Done copying!');
                            imapServer2.end()                    // close mail server1 connection
                            imapServer1.end()                    // close mail server2 connection
                        }
                    });

                });
            });
        });
        f.once('error', function (err) {
            console.log('Fetch error: ' + err);
        });
        f.once('end', function () {
            console.log('Done fetching all messages!');
        });
    });
};

let imapServer2 = new Imap({
    user: 'yourgmail@gmail.com',
    password: 'yourpassword',
    host: 'imap.gmail.com',
    port: 993,
    tls: true,
    tlsOptions: {
        rejectUnauthorized: false
    },
    authTimeout: 3000
}).once('error', function (err) {
    console.log('Target mail server error:- ', err);
});

imapServer2.once('ready', function () {
    imapServer2.openBox('INBOX', true, function (err, box) {
        if (err) throw err;
        console.log('message', 'Target mail server ready');
        let imapServer1 = new Imap({
            user: 'yourgmail@gmail.com',
            password: 'yourpassword',
            host: 'imap.gmail.com',
            port: 993,
            tls: true,
            tlsOptions: {
                rejectUnauthorized: false
            },
            authTimeout: 3000
        }).once('error', function (err) {
            console.log('Source Server Error:- ', err);
        });
        imapServer1.once('ready', function () {
            imapServer1.openBox('INBOX', true, function (err, box) {
                if (err) throw err;
                console.log('message', 'Source mail server ready');
                copyEmail(imapServer1, imapServer2, 'Server1');
            })
        });
        imapServer1.connect();
    });
})
imapServer2.connect();