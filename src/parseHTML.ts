import { parse } from 'node-html-parser';

export class ArticleInfo {
    title: string | null;
    authors: string[];
    journal: string | null;
    year: string | null;

    constructor(title: string | null, authors: string[], journal: string | null, year: string | null) {
        this.title = title;
        this.authors = authors;
        this.journal = journal;
        this.year = year;
    }
}

export function parseHTML(html: string): ArticleInfo {
  const root = parse(html);
  
  const titleElement = root.querySelector('meta[name="citation_title"]');
  const title = titleElement ? titleElement.getAttribute('content') || null : null;

  const authorElements = root.querySelectorAll('meta[name="citation_author"]');
  const authors = authorElements.map(element => element.getAttribute('content'))
  .filter((author): author is string => author !== null && author !== undefined);

  const journalElement = root.querySelector('meta[name="citation_journal_title"]');
  const journal = journalElement ? journalElement.getAttribute('content') || null : null;

  const yearElement = root.querySelector('meta[name="citation_publication_date"]');
  const year = yearElement ? yearElement.getAttribute('content') || null : null;

  return { title, authors, journal, year };
}