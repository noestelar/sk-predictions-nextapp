import { Client } from '@notionhq/client';

const notion = new Client({ auth: 'secret_test' });
console.log('databases keys:', Object.keys(notion.databases));
console.log('databases.query exists:', typeof (notion.databases as any).query);
