import { getHTML } from "./getHTML";
import { parseHTML, ArticleInfo } from "./parseHTML";
import { Collection, Filter, MongoClient } from "mongodb";
import * as readline from 'readline';

const CONNECTION = "mongodb://root:example@127.0.0.1:27017/";

const client = new MongoClient(
    CONNECTION, 
    { monitorCommands: true } 
);

async function askQuestion(rl: readline.Interface, question: string): Promise<string | null> {
    return new Promise((resolve) => {
        rl.question(question, (answer) => {
            resolve(answer.trim() !== '' ? answer.trim() : null);
        });
    });
}
async function viewArticles(Article_col: Collection<ArticleInfo>) {
    const articles = await Article_col.find().toArray();
    const count = await Article_col.countDocuments();
    console.log(`Всего статей в БД: ${count}`);
    console.log("Список всех статей:");
    articles.forEach(article => console.log(article));
}
async function searchArticles(Article_col: Collection<ArticleInfo>, rl: readline.Interface) {
    const searchField = await askQuestion(rl, 'Введите поле для поиска (author, title, year, journal): ');
    if (!searchField) return;

    const searchValue = await askQuestion(rl, `Введите значение для поиска по ${searchField}: `);
    if (!searchValue) return;

    let query: Filter<ArticleInfo> = {};

    switch (searchField.toLowerCase()) {
        case 'author':
            query = { authors: { $regex: new RegExp(searchValue, 'i') } };
            break;
        case 'title':
            query = { title: { $regex: new RegExp(searchValue, 'i') } };
            break;
        case 'year':
            query = { year: { $regex: new RegExp(searchValue, 'i') } };
            break;
        case 'journal':
            query = { journal: { $regex: new RegExp(searchValue, 'i') } };
            break;
        default:
            console.error('Неверное поле для поиска.');
            return;
    }

    const articles = await Article_col.find(query).toArray();

    if (articles.length === 0) {
        console.log('Статьи не найдены.');
    } else {
        console.log('Найденные статьи:');
        articles.forEach(article => console.log(article));
    }
}

async function main() {
    await client.connect();
    const db = client.db('COURSE_WORK');
    const Article_col = db.collection('Articles') as Collection<ArticleInfo>;

    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    let option: string | null = null;

    do {
        option = await askQuestion(rl, 'Введите "1" для ввода нового URL, "2" для просмотра всех статей в базе данных, "3" для поиска статьи (или просто нажмите Enter для выхода): ');

        if (option === '1') {
            const url = await askQuestion(rl, 'Введите URL статьи: ');
            if (url) {
                try {
                    let html = await getHTML(url);
                    if (html) {
                        const article = parseHTML(html);
                        console.log(article);
                        await Article_col.insertOne(article);
                    }
                } catch (error) {
                    console.error('Произошла ошибка при обработке URL:', error);
                }
            }
        } else if (option === '2') {
            await viewArticles(Article_col);
        } else if (option === '3') {
            await searchArticles(Article_col, rl);
        }

    } while (option !== null && (option === '1' || option === '2' || option === '3'));

    await client.close();
    rl.close();
}

main();