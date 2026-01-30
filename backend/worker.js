/**
 * Life MCP - Cloudflare Worker Backend
 * 
 * 功能：处理用户认证 (注册/登录) 与 经验数据同步 (KV 存储)
 * KV 绑定名需设置为: LIFE_MEMORY_KV
 */

export default {
    async fetch(request, env, ctx) {
        const url = new URL(request.url);
        const method = request.method;

        // CORS Headers
        const corsHeaders = {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, X-User-Email, X-Password-Hash, X-Invite-Code",
        };

        // Handle OPTIONS
        if (method === "OPTIONS") {
            return new Response(null, { headers: corsHeaders });
        }

        const email = request.headers.get("X-User-Email");
        const passwordHash = request.headers.get("X-Password-Hash");

        // AUTH 路由
        if (url.pathname === "/auth") {
            if (method !== "POST") return new Response("Method not allowed", { status: 405 });

            const { type } = await request.json();
            const inviteCode = request.headers.get("X-Invite-Code");

            // 用户数据的键名: user:{email}
            const userKey = `user:${email}`;

            if (type === "register") {
                // 邀请码验证 (可选，此处可以根据需要修改)
                if (env.INVITATION_CODE && inviteCode !== env.INVITATION_CODE) {
                    return new Response(JSON.stringify({ error: "无效的邀请码" }), { status: 403, headers: corsHeaders });
                }

                const existingUser = await env.LIFE_MEMORY_KV.get(userKey);
                if (existingUser) {
                    return new Response(JSON.stringify({ error: "用户已存在" }), { status: 400, headers: corsHeaders });
                }

                await env.LIFE_MEMORY_KV.put(userKey, JSON.stringify({ passwordHash, createdAt: new Date().toISOString() }));
                return new Response(JSON.stringify({ success: true, message: "注册成功" }), { headers: corsHeaders });
            }

            if (type === "login") {
                const userDataRaw = await env.LIFE_MEMORY_KV.get(userKey);
                if (!userDataRaw) {
                    return new Response(JSON.stringify({ error: "用户不存在" }), { status: 404, headers: corsHeaders });
                }

                const userData = JSON.parse(userDataRaw);
                if (userData.passwordHash !== passwordHash) {
                    return new Response(JSON.stringify({ error: "密码错误" }), { status: 401, headers: corsHeaders });
                }

                return new Response(JSON.stringify({ success: true, message: "登录成功" }), { headers: corsHeaders });
            }
        }

        // SYNC 路由
        if (url.pathname === "/sync") {
            if (!email || !passwordHash) {
                return new Response("Unauthorized", { status: 401, headers: corsHeaders });
            }

            // 验证身份
            const userKey = `user:${email}`;
            const userDataRaw = await env.LIFE_MEMORY_KV.get(userKey);
            if (!userDataRaw || JSON.parse(userDataRaw).passwordHash !== passwordHash) {
                return new Response("Unauthorized", { status: 401, headers: corsHeaders });
            }

            const dataKey = `data:${email}`;

            if (method === "GET") {
                const data = await env.LIFE_MEMORY_KV.get(dataKey);
                return new Response(data || "[]", { headers: corsHeaders });
            }

            if (method === "POST") {
                const payload = await request.text();
                await env.LIFE_MEMORY_KV.put(dataKey, payload);
                return new Response(JSON.stringify({ success: true }), { headers: corsHeaders });
            }
        }

        return new Response("Not Found", { status: 404, headers: corsHeaders });
    },
};
