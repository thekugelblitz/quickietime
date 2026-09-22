import {DatabaseSync,type SQLInputValue} from 'node:sqlite';
import {mkdirSync,readFileSync,readdirSync} from 'node:fs';
import {dirname,join} from 'node:path';
let connection:DatabaseSync|undefined;
export function sqlite(){
 if(connection)return connection;
 const path=process.env.DATABASE_PATH||'data/quickietime.sqlite';
 if(path!==':memory:')mkdirSync(dirname(path),{recursive:true});
 const database=new DatabaseSync(path);database.exec('PRAGMA journal_mode=WAL; PRAGMA busy_timeout=5000; PRAGMA foreign_keys=ON;');
 database.exec('CREATE TABLE IF NOT EXISTS schema_migrations (name TEXT PRIMARY KEY, applied_at TEXT NOT NULL)');
 for(const file of readdirSync(join(process.cwd(),'drizzle')).filter(f=>f.endsWith('.sql')).sort()){
 if(database.prepare('SELECT 1 FROM schema_migrations WHERE name=?').get(file))continue;
 database.exec('BEGIN IMMEDIATE');try{database.exec(readFileSync(join(process.cwd(),'drizzle',file),'utf8'));database.prepare('INSERT INTO schema_migrations VALUES (?,?)').run(file,new Date().toISOString());database.exec('COMMIT')}catch(e){database.exec('ROLLBACK');database.close();throw e}
 }
 connection=database;return database;
}
class Statement{values:SQLInputValue[]=[];constructor(readonly sql:string){}bind(...values:unknown[]){this.values=values as SQLInputValue[];return this}async first<T=Record<string,unknown>>(){return (sqlite().prepare(this.sql).get(...this.values)??null) as T|null}async all<T=Record<string,unknown>>(){return {results:sqlite().prepare(this.sql).all(...this.values) as T[]}}async run(){const result=sqlite().prepare(this.sql).run(...this.values);return {success:true,meta:{changes:Number(result.changes)}}}}
export const database={prepare:(sql:string)=>new Statement(sql),async batch(statements:Statement[]){const connection=sqlite();connection.exec('BEGIN IMMEDIATE');try{const results=statements.map(q=>connection.prepare(q.sql).run(...q.values));connection.exec('COMMIT');return results}catch(e){connection.exec('ROLLBACK');throw e}}};
