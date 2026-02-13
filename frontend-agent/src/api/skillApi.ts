import axios from 'axios';

const API_BASE_URL = '/api/v1/skills';

export interface Skill {
    id: string;
    name: string;
    display_name: string | null;
    description: string | null;
    category: 'research' | 'writing' | 'tech' | 'workflow' | string | null;
    scope: string;
    is_builtin: boolean;
    is_enabled: boolean;
    is_installed: boolean;
    creator_id: string | null;
    usage_count: number;
    metadata?: any;
}

export const skillApi = {
    /**
     * 获取所有可用技能
     */
    listSkills: async (params?: { category?: string; search?: string }): Promise<Skill[]> => {
        const response = await axios.get(API_BASE_URL + '/', { params });
        return response.data;
    },

    /**
     * 获取技能详情
     */
    getSkill: async (skillId: string): Promise<Skill> => {
        const response = await axios.get(`${API_BASE_URL}/${skillId}`);
        return response.data;
    },

    /**
     * 安装/激活技能
     */
    installSkill: async (skillId: string): Promise<any> => {
        const response = await axios.post(`${API_BASE_URL}/${skillId}/install`);
        return response.data;
    },

    /**
     * 卸载/停用技能
     */
    uninstallSkill: async (skillId: string): Promise<any> => {
        const response = await axios.delete(`${API_BASE_URL}/${skillId}/install`);
        return response.data;
    },

    /**
     * 创建自义技能
     */
    createSkill: async (skill: Partial<Skill>): Promise<Skill> => {
        const response = await axios.post(API_BASE_URL + '/', skill);
        return response.data;
    }
};
