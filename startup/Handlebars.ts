import fs from 'fs';
import path from 'path';
import Handlebars from 'handlebars';

const header = fs.readFileSync(path.resolve(`${process.env.EMAIL_TEMPLATES_PATH}/partials/header.hbs`), 'utf-8').toString();
const footer = fs.readFileSync(path.resolve(`${process.env.EMAIL_TEMPLATES_PATH}/partials/footer.hbs`), 'utf-8').toString();

Handlebars.registerPartial('header', header);
Handlebars.registerPartial('footer', footer);

export default Handlebars;
