import { salesmanType } from "@/shared/zod";
import { create } from "zustand";

interface myDataQuery {
    id?: string;
    tenantId?: string;
    name?: string;
    phone?: string;
    password?: string;
    bank?: string;
    address?: string;
    addressProof?: string;
    avatar?: string | null;
    hierarchyItemId?: string;
    salesmanType?: salesmanType;
}

interface UserStore extends myDataQuery {
    setUser: (user: myDataQuery) => void;
}

export const useUserStore = create<UserStore>((set) => ({
    id: undefined,
    tenantId: undefined,
    name: undefined,
    phone: undefined,
    password: undefined,
    bank: undefined,
    address: undefined,
    addressProof: undefined,
    avatar: undefined,
    hierarchyItemId: undefined,
    salesmanType: undefined,
    setUser: (user: myDataQuery) => {
        console.log("\n\tSetting user in store\n");
        set({ ...user })
    },
}));
