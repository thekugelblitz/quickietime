import { sqliteTable, text, integer, index, uniqueIndex } from 'drizzle-orm/sqlite-core';
export const generations = sqliteTable('generations', { id: text('id').primaryKey(), userId: text('user_id').notNull(), payload: text('payload').notNull(), createdAt: text('created_at').notNull() }, t => [index('idx_generations_user_created').on(t.userId, t.createdAt)]);
export const favorites = sqliteTable('favorites', { id: text('id').notNull(), userId: text('user_id').notNull(), payload: text('payload').notNull() }, t => [index('idx_favorites_user').on(t.userId)]);
export const usage = sqliteTable('usage', { key: text('key').primaryKey(), count: integer('count').notNull().default(0) });

export const projects=sqliteTable('projects',{id:text('id').primaryKey(),userId:text('user_id').notNull(),name:text('name').notNull()},t=>[uniqueIndex('idx_projects_user_name').on(t.userId,t.name)]);
