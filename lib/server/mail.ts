import {settingsConfig} from './settings';
import nodemailer from 'nodemailer';
export async function sendLoginCode(email:string,code:string){
 const config=settingsConfig();
 if(!config.SMTP_HOST||!config.SMTP_FROM)throw new Error('EMAIL_NOT_CONFIGURED');
 const port=Number(config.SMTP_PORT||465);
 const transport=nodemailer.createTransport({
  host:config.SMTP_HOST,
  port,
  secure:port===465,
  requireTLS:port!==465,
  auth:config.SMTP_USER?{user:config.SMTP_USER,pass:config.SMTP_PASSWORD}:undefined,
  connectionTimeout:10000,
  greetingTimeout:10000,
  socketTimeout:15000,
  disableFileAccess:true,
  disableUrlAccess:true
 });
 try{
  await transport.sendMail({
   from:config.SMTP_FROM,
   to:email,
   subject:`Your QuickieTime sign-in code: ${code}`,
   text:`Your QuickieTime sign-in code is: ${code}\n\nThis code expires in 10 minutes. If you did not request this, you can safely ignore this email.`,
   html:`<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;background:#ffffff;border:1px solid #e4e4e7;border-radius:16px;"><div style="font-size:22px;font-weight:700;color:#18181b;margin-bottom:20px;">⚡ QuickieTime</div><p style="font-size:15px;color:#3f3f46;margin-bottom:16px;">Here is your sign-in verification code:</p><div style="font-size:36px;font-weight:800;letter-spacing:6px;color:#18181b;padding:18px 24px;background:#f4f4f5;border-radius:12px;text-align:center;margin:24px 0;">${code}</div><p style="font-size:13px;color:#71717a;line-height:1.5;">This code expires in 10 minutes. Never share this code with anyone. If you did not request this code, no action is needed.</p></div>`
  });
 }finally{
  transport.close();
 }
}
