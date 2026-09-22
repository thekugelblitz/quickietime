import {settingsConfig} from './settings';
import nodemailer from 'nodemailer';
export async function sendLoginCode(email:string,code:string){
 const config=settingsConfig();
 if(!config.SMTP_HOST||!config.SMTP_FROM)throw new Error('EMAIL_NOT_CONFIGURED');
 const port=Number(config.SMTP_PORT||587);
 const transport=nodemailer.createTransport({host:config.SMTP_HOST,port,secure:port===465,requireTLS:port!==465,auth:config.SMTP_USER?{user:config.SMTP_USER,pass:config.SMTP_PASSWORD}:undefined,connectionTimeout:10000,greetingTimeout:10000,socketTimeout:15000,disableFileAccess:true,disableUrlAccess:true});
 try{await transport.sendMail({from:config.SMTP_FROM,to:email,subject:'Your QuickieTime sign-in code',text:`Your QuickieTime code is ${code}. It expires in 10 minutes. Never share it. If you did not request this code, ignore this message.`})}finally{transport.close()}
}
