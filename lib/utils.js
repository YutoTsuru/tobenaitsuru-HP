import { kv } from '@vercel/kv';

const CONTENT_KEY = 'site:content';

// 初期データ（KVが空の場合のデフォルト）
const defaultContent = {
    "home": {
        "title": "Tobenaitsuru",
        "subtitle": "Thinking, Designing, Making"
    },
    "about": {
        "title": "About Me",
        "content": "ものづくりに興味があり、日々技術を磨いています。無機質な機械と有機的な思考の融合を目指しています。",
        "profile": "Software Engineer / Designer"
    },
    "skills": {
        "title": "My Skills",
        "items": [
            {
                "name": "JavaScript/React/Next.js",
                "level": "Advanced"
            },
            {
                "name": "Python",
                "level": "Intermediate"
            },
            {
                "name": "Design",
                "level": "Intermediate"
            }
        ]
    },
    "works": {
        "title": "Works",
        "status": "Coming Soon",
        "items": []
    },
    "contact": {
        "title": "Contact",
        "email": "contact@example.com",
        "github": "https://github.com/example",
        "twitter": "https://twitter.com/example"
    }
};

export async function getContent() {
    try {
        const content = await kv.get(CONTENT_KEY);

        // KVにデータがない場合はデフォルトを返す
        if (!content) {
            console.log('No content in KV, using defaults');
            return defaultContent;
        }

        return content;
    } catch (error) {
        console.error('Error reading from KV:', error);
        return defaultContent;
    }
}

export async function saveContent(newContent) {
    try {
        await kv.set(CONTENT_KEY, newContent);
        return true;
    } catch (error) {
        console.error('Error writing to KV:', error);
        return false;
    }
}
