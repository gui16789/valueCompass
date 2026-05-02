import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const modelProviders = sqliteTable("model_providers", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  apiBaseUrl: text("api_base_url").notNull(),
  apiKeyEncrypted: text("api_key_encrypted").notNull(),
  isOpenAICompatible: integer("is_openai_compatible", { mode: "boolean" }).notNull().default(true),
  allowInsecureTls: integer("allow_insecure_tls", { mode: "boolean" }).notNull().default(false),
  defaultModelName: text("default_model_name").notNull(),
  defaultTemperature: integer("default_temperature").notNull().default(20),
  maxContextTokens: integer("max_context_tokens").notNull().default(8000),
  status: text("status").notNull().default("inactive"),
  lastTestStatus: text("last_test_status").notNull().default("not_tested"),
  lastTestMessage: text("last_test_message").notNull().default(""),
  lastTestedAt: text("last_tested_at"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull()
});

export const modelConfigs = sqliteTable("model_configs", {
  id: text("id").primaryKey(),
  providerId: text("provider_id")
    .notNull()
    .references(() => modelProviders.id, { onDelete: "cascade" }),
  role: text("role").notNull(),
  modelName: text("model_name").notNull(),
  temperature: integer("temperature").notNull().default(20),
  enabled: integer("enabled", { mode: "boolean" }).notNull().default(true),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull()
});

export const aiConversations = sqliteTable("ai_conversations", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  role: text("role").notNull(),
  providerId: text("provider_id")
    .notNull()
    .references(() => modelProviders.id, { onDelete: "cascade" }),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull()
});

export const aiMessages = sqliteTable("ai_messages", {
  id: text("id").primaryKey(),
  conversationId: text("conversation_id")
    .notNull()
    .references(() => aiConversations.id, { onDelete: "cascade" }),
  role: text("role").notNull(),
  content: text("content").notNull(),
  modelName: text("model_name").notNull().default(""),
  temperature: integer("temperature").notNull().default(20),
  createdAt: text("created_at").notNull()
});

export const knowledgeNodes = sqliteTable("knowledge_nodes", {
  id: text("id").primaryKey(),
  type: text("type").notNull(),
  title: text("title").notNull(),
  summary: text("summary").notNull(),
  body: text("body").notNull().default(""),
  tagsJson: text("tags_json").notNull().default("[]"),
  orderIndex: integer("order_index").notNull().default(0),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull()
});

export const companies = sqliteTable("companies", {
  id: text("id").primaryKey(),
  stockCode: text("stock_code").notNull(),
  stockName: text("stock_name").notNull(),
  exchange: text("exchange").notNull(),
  industry: text("industry").notNull().default(""),
  companyType: text("company_type").notNull().default("other"),
  description: text("description").notNull().default(""),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull()
});
