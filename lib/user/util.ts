import { salesmanType } from "@/shared/zod";
import { storageManager } from "../asyncStorage/asnycStoreMannager";
import { AppConfig } from "@/constants/AppConfig";

export interface myDataQuery {
  id: string;
  tenantId: string;
  name: string;
  phone: string;
  password: string;
  bank: string;
  address: string;
  addressProof: string;
  avatar: string | null;
  hierarchyItemId: string;
  salesmanType: salesmanType
}

export class User {
  static async setUserDetails(data: myDataQuery): Promise<boolean> {
    try {
      await storageManager.set(AppConfig.USER_DETAILS, `${JSON.stringify(data)}`);
      return true;
    }
    catch (error) {
      console.error("Error setting user details in storage:", error);
      return false;
    }
  }

  static async getUserDetails(): Promise<myDataQuery | null> {
    try {
      const profile = await storageManager.get<string>(AppConfig.USER_DETAILS);
      if (profile) {
        return JSON.parse(profile) as myDataQuery;
      } else {
        console.log("No user profile found in storage.");
        return null;
      }
    } catch (error) {
      console.error("Error getting user details from storage:", error);
      return null;
    }
  }
}