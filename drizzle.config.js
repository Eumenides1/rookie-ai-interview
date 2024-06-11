/** @type { import("drizzle-kit").Config } */
export default {
    schema: "./utils/schema.js",
    dialect: 'postgresql',
    dbCredentials: {
        url: 'postgresql://rookie-ai_owner:XAR8u3KPwltg@ep-restless-glade-a5mmcm80.us-east-2.aws.neon.tech/rookie-interview?sslmode=require'
    }
};