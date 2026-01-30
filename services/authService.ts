
import { AuthSession, AppSettings } from "../types";

/**
 * 简单的 SHA-256 密码哈希，增加基本的安全性
 */
async function hashPassword(password: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
}

export const authService = {
    /**
     * 注册新用户
     */
    register: async (email: string, password: string, inviteCode: string, settings: AppSettings): Promise<{ success: boolean; message: string }> => {
        const passwordHash = await hashPassword(password);
        const response = await fetch(`${settings.backendUrl}/auth`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-User-Email": email,
                "X-Invite-Code": inviteCode,
                "X-Password-Hash": passwordHash,
            },
            body: JSON.stringify({ type: "register" }),
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error || "注册失败");
        }
        return data;
    },

    /**
     * 用户登录
     */
    login: async (email: string, password: string, settings: AppSettings): Promise<AuthSession> => {
        const passwordHash = await hashPassword(password);
        const response = await fetch(`${settings.backendUrl}/auth`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-User-Email": email,
                "X-Password-Hash": passwordHash,
            },
            body: JSON.stringify({ type: "login" }),
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error || "登录失败");
        }

        return { email, passwordHash };
    },

    /**
     * 同步数据到云端 (备份)
     */
    syncToCloud: async (records: any[], session: AuthSession, settings: AppSettings): Promise<boolean> => {
        const response = await fetch(`${settings.backendUrl}/sync`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-User-Email": session.email,
                "X-Password-Hash": session.passwordHash,
            },
            body: JSON.stringify(records),
        });

        if (!response.ok) {
            throw new Error("云端备份失败");
        }
        return true;
    },

    /**
     * 从云端恢复数据
     */
    restoreFromCloud: async (session: AuthSession, settings: AppSettings): Promise<any[]> => {
        const response = await fetch(`${settings.backendUrl}/sync`, {
            method: "GET",
            headers: {
                "X-User-Email": session.email,
                "X-Password-Hash": session.passwordHash,
            },
        });

        if (!response.ok) {
            throw new Error("从云端恢复数据失败");
        }
        return await response.json();
    }
};
