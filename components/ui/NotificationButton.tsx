import { API_ROUTES } from "@/constants/ApiRoutes";
import { api } from "@/lib/axios/axios";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { BellIcon } from "phosphor-react-native";
import { TouchableOpacity, View, Text } from "react-native";

interface MyNotificationResponse extends Response {
  data: {
    id: string;
    message: string;
    createdAt: string;
    updatedAt: string;
    title: string;
    read: boolean;
  }[]
}

export default function NotificationButton() {

  const router = useRouter();

  const myNotification = useQuery({
    queryKey: ["myNotification"],
    queryFn: async () => {
      const res = await api.get<MyNotificationResponse>(API_ROUTES.SALESMAN.GET_MY_NOTIFICATION);
      return res.data;
    }
  });

  // Count unread notifications
  const unreadCount = myNotification.data?.data?.filter(n => !n.read).length || 0;

  return (
    <View>
      <TouchableOpacity
        style={{ backgroundColor: "#eee", borderRadius: 999, padding: 10, justifyContent: "center", alignItems: "center" }}
        onPress={() => {
          router.push("/screens/salesman/notification")
        }}
      >
        <View>
          <BellIcon size={28} color="#60A5FA" weight="fill" />
          {unreadCount > 0 && (
            <View
              style={{
                position: "absolute",
                top: -2,
                right: -2,
                backgroundColor: "red",
                borderRadius: 8,
                minWidth: 16,
                height: 16,
                justifyContent: "center",
                alignItems: "center",
                paddingHorizontal: 3,
              }}
            >
              <View>
                <Text style={{ color: "white", fontSize: 10, fontWeight: "bold" }}>
                  {unreadCount}
                </Text>
              </View>
            </View>
          )}
        </View>
      </TouchableOpacity>
    </View>
  )
}