import nodemailer from 'nodemailer';

const host = process.env.SMTP_SERVER;
const user = process.env.SMTP_USER;
const pass = process.env.SMTP_PWD;

const transport = nodemailer.createTransport({
  host,
  port: 587,
  auth: {
    user,
    pass,
  },
});

// eslint-disable-next-line import/prefer-default-export
export { transport };
