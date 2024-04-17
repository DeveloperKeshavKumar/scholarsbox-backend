const nodemailer = require("nodemailer")

const mailSender = async(email,title,body) => {
    try{
        //created the transporter
        let transporter =nodemailer.createTransport({
            host:process.env.MAIL_HOST,
            service:process.env.MAIL_SERVICE,
            port:Number(process.env.MAIL_PORT),
            // secure:Boolean(process.env.SECURE),
            auth:{
                user:process.env.MAIL_USER,
                pass:process.env.MAIL_PASS,
            },
            tls:{
                rejectUnauthorized:false,
            }
        })

        //sending the email
        let info= await transporter.sendMail({
            from: process.env.MAIL_USER,
            to:email,
            subject:`${title}`,
            html:`${body}`,
        })

        console.log(info);
        return info;
    }
    catch(err){
        console.error(err.message);
    }
}

module.exports = mailSender;