import TabBar from "@/components/ui/layout/TabBar";
import { API_ROUTES } from "@/constants/ApiRoutes";
import { primary } from "@/constants/Colors";
import { api } from "@/lib/axios/axios";
import { Response } from "@/lib/types/types";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useState, useRef } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  FlatList, 
  StyleSheet, 
  ActivityIndicator,
  Animated,
  Easing,
  Platform,
  RefreshControl,
  Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { format, isToday, isYesterday } from 'date-fns';
import { SafeAreaView } from "react-native-safe-area-context";

interface MyNotificationResponse extends Response {
  data: {
    id: string;
    message: string;
    createdAt: string;
    updatedAt: string;
    title: string;
    read: boolean;
    type?: 'info' | 'success' | 'warning' | 'error';
  }[]
}

export default function NotificationScreen() {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [localRead, setLocalRead] = useState<{ [key: string]: boolean }>({});
  const [refreshing, setRefreshing] = useState(false);
  const animatedValues = useRef(new Map()).current;

  const myNotification = useQuery({
    queryKey: ["myNotification"],
    queryFn: async () => {
      const res = await api.get<MyNotificationResponse>(API_ROUTES.SALESMAN.GET_MY_NOTIFICATION);
      return res.data;
    }
  });

  const notificationReadMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      await api.get(API_ROUTES.SALESMAN.MARK_NOTIFICATION_AS_READ(notificationId));
    },
    onSuccess: (_, notificationId) => {
      setLocalRead(prev => ({ ...prev, [notificationId]: true }));
    }
  });

  const onRefresh = async () => {
    setRefreshing(true);
    await myNotification.refetch();
    setRefreshing(false);
  };

  const handlePress = (id: string, read: boolean) => {
    // Animate the expansion/collapse
    if (!animatedValues.has(id)) {
      animatedValues.set(id, new Animated.Value(0));
    }
    
    if (expandedId === id) {
      // Collapse
      Animated.timing(animatedValues.get(id), {
        toValue: 0,
        duration: 300,
        easing: Easing.out(Easing.ease),
        useNativeDriver: false,
      }).start(() => setExpandedId(null));
    } else {
      // Expand
      if (expandedId && animatedValues.has(expandedId)) {
        // Collapse the currently expanded item first
        Animated.timing(animatedValues.get(expandedId), {
          toValue: 0,
          duration: 200,
          easing: Easing.out(Easing.ease),
          useNativeDriver: false,
        }).start();
      }
      
      setExpandedId(id);
      Animated.timing(animatedValues.get(id), {
        toValue: 1,
        duration: 400,
        easing: Easing.out(Easing.ease),
        useNativeDriver: false,
      }).start();
    }
    
    if (!read && !localRead[id]) {
      notificationReadMutation.mutate(id);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    
    if (isToday(date)) {
      return `Today at ${format(date, 'h:mm a')}`;
    } else if (isYesterday(date)) {
      return `Yesterday at ${format(date, 'h:mm a')}`;
    } else {
      return format(date, 'MMM d, yyyy - h:mm a');
    }
  };

  const getNotificationIcon = (type?: string) => {
    switch (type) {
      case 'success':
        return <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />;
      case 'warning':
        return <Ionicons name="warning" size={24} color="#FF9800" />;
      case 'error':
        return <Ionicons name="close-circle" size={24} color="#F44336" />;
      default:
        return <Ionicons name="information-circle" size={24} color={primary} />;
    }
  };

  const renderItem = ({ item, index }: { item: MyNotificationResponse['data'][0]; index: number }) => {
    const isRead = item.read || localRead[item.id];
    const isExpanded = expandedId === item.id;
    
    if (!animatedValues.has(item.id)) {
      animatedValues.set(item.id, new Animated.Value(0));
    }
    
    const heightAnim = animatedValues.get(item.id).interpolate({
      inputRange: [0, 1],
      outputRange: [0, 100] // Estimated message height
    });
    
    const rotateAnim = animatedValues.get(item.id).interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', '180deg']
    });

    return (
      <Animated.View 
        style={[
          styles.notificationContainer,
          { opacity: !isRead ? 1 : 0.9 }
        ]}
      >
        <TouchableOpacity
          style={[
            styles.notification,
            !isRead && styles.unread,
            index === 0 && styles.firstItem,
            index === (myNotification.data?.data.length || 0) - 1 && styles.lastItem
          ]}
          onPress={() => handlePress(item.id, isRead)}
          activeOpacity={0.7}
        >
          <View style={styles.notificationHeader}>
            <View style={styles.titleContainer}>
              <View style={styles.iconContainer}>
                {getNotificationIcon(item.type)}
              </View>
              <Text style={[styles.title, !isRead && styles.unreadTitle]} numberOfLines={1}>
                {item.title}
              </Text>
            </View>
            
            <Animated.View style={{ transform: [{ rotate: rotateAnim }] }}>
              <Ionicons 
                name="chevron-down" 
                size={20} 
                color={!isRead ? primary : '#888'} 
              />
            </Animated.View>
          </View>
          
          <Text style={styles.date}>{formatDate(item.createdAt)}</Text>
          
          <Animated.View style={{ height: heightAnim, overflow: 'hidden' }}>
            <Text style={styles.message}>{item.message}</Text>
          </Animated.View>
          
          {!isRead && (
            <View style={styles.unreadIndicator} />
          )}
        </TouchableOpacity>
      </Animated.View>
    );
  };

  if (myNotification.isLoading && !refreshing) {
    return (
      <View style={styles.container}>
        <TabBar title="Notifications" />
        <View style={styles.centerContainer}>
          <ActivityIndicator size={"large"} color={primary}/>
          <Text style={styles.loadingText}>Loading notifications</Text>
        </View>
      </View>
    );
  }
  
  if (myNotification.isError) {
    return (
      <View style={styles.container}>
        <TabBar title="Notifications" />
        <View style={styles.centerContainer}>
          <Ionicons name="alert-circle-outline" size={64} color="#FF6B6B" />
          <Text style={styles.errorText}>Failed to load notifications</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={() => myNotification.refetch()}
          >
            <Text style={styles.retryText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TabBar title="Notifications"/>
      
      {myNotification.data?.data && myNotification.data.data.length > 0 ? (
        <FlatList
          data={myNotification.data.data}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[primary]}
              tintColor={primary}
            />
          }
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      ) : (
        <View style={styles.emptyState}>
          <Image 
            source={{ uri: 'https://cdn-icons-png.flaticon.com/512/3503/3503786.png' }} 
            style={styles.emptyImage}
            resizeMode="contain"
          />
          <Text style={styles.emptyTitle}>No notifications yet</Text>
          <Text style={styles.emptyText}>We'll notify you when something arrives</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: '#374151',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryText: {
    color: 'white',
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#EAECF0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
  },
  markAllText: {
    color: primary,
    fontWeight: '600',
    fontSize: 14,
  },
  listContent: {
    padding: 16,
    paddingTop: 8,
  },
  notificationContainer: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  notification: {
    padding: 20,
    backgroundColor: '#fff',
    position: 'relative',
  },
  firstItem: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  lastItem: {
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  unread: {
    backgroundColor: '#F0F9FF',
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  iconContainer: {
    marginRight: 12,
  },
  title: {
    fontWeight: '600',
    fontSize: 16,
    color: '#374151',
    flex: 1,
  },
  unreadTitle: {
    color: '#111827',
    fontWeight: '700',
  },
  date: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 8,
  },
  message: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
  },
  unreadIndicator: {
    position: 'absolute',
    top: 20,
    right: 12,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: primary,
  },
  separator: {
    height: 8,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyImage: {
    width: 200,
    height: 200,
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
  },
});