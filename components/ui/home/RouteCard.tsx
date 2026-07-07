import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { MaterialIcons, Entypo } from "@expo/vector-icons";
import { useRouter } from "expo-router";

interface Route {
  id: string;
  tenantId: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string | null;
  updatedBy: string | null;
  name: string;
  hierarchyItemId: string;
  RouteCustomer: {
    id: string;
    tenantId: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    createdBy: string | null;
    updatedBy: string | null;
    routeId: string;
    customerId: string;
  }[];
}

interface RouteProps {
  route: Route;
}

export default function RouteCard(props: RouteProps) {
  const router = useRouter();

  // Calculate customer count and visited status
  const calculateRouteStats = () => {
    const totalCustomers = props.route.RouteCustomer?.length || 0;
    // TODO: track visited customers from your state/API
    const visitedCustomers = Math.floor(Math.random() * totalCustomers); // Random for demo
    
    return {
      totalCustomers,
      visitedCustomers,
      progress: totalCustomers > 0 ? (visitedCustomers / totalCustomers) * 100 : 0,
    };
  };

  const routeStats = calculateRouteStats();

  // Determine completion status color
  const getCompletionColor = (progress: number) => {
    if (progress >= 90) return "#4CE5B1"; // Green for almost complete
    if (progress >= 50) return "#FFD644"; // Yellow for halfway
    return "#FF6B6B"; // Red for low progress
  };

  return (
    <TouchableOpacity
      style={[
        styles.card,
        {
          backgroundColor: "#2977F6",
          flex: 1,
          justifyContent: "space-between",
        },
      ]}
      onPress={() => { router.push(`/screens/route/myroute?id=${props.route.id}`) }}
    >
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          width: "100%",
          marginBottom: 30,
        }}
      >
        <View>
          <Text style={[styles.cardTitle, { color: "white" }]}>
            Today's Route
          </Text>
          <Text style={[styles.routeName, { color: "rgba(255,255,255,0.7)" }]}>
            {props.route.name || "Main Route"}
          </Text>
        </View>
        <Entypo name="location-pin" size={24} color="white" />
      </View>
      
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          width: "100%",
        }}
      >
        <View>
          <Text style={[styles.cardValue, { color: "white" }]}>
            {routeStats.totalCustomers}
          </Text>
          <Text style={[styles.cardSubtext, { color: "rgba(255,255,255,0.7)" }]}>
            {routeStats.visitedCustomers} visited
          </Text>
        </View>
        
        <View style={{ alignItems: 'flex-end' }}>
          <View style={styles.progressContainer}>
            <View style={[
              styles.progressBar, 
              { 
                width: `${Math.min(100, routeStats.progress)}%`,
                backgroundColor: getCompletionColor(routeStats.progress)
              }
            ]} />
          </View>
          <View
            style={{
              backgroundColor: "#598BFF",
              padding: 8,
              borderRadius: 10,
              marginTop: 8,
            }}
          >
            <Entypo name="controller-play" size={20} color="white" />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    padding: 15,
    minHeight: 100,
  },
  cardTitle: {
    fontWeight: "bold",
    fontSize: 14,
  },
  routeName: {
    fontSize: 12,
    marginTop: 4,
  },
  cardValue: {
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 5,
  },
  cardSubtext: {
    fontSize: 12,
    marginTop: 4,
  },
  progressContainer: {
    height: 6,
    width: 80,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 3,
  },
});