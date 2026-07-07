import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';
import { At, ChartDonut, ChartPie, ChartPieSlice, House, MapPinPlus, PlusCircle, SquaresFour, User } from 'phosphor-react-native';
import { BottomBar } from '@/components/ui/layout/BottomBar';

export default function TabLayout() {

  return (
    <Tabs tabBar={props => <BottomBar {...props} />} screenOptions={{ headerShown: false }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => <House size={size} weight="fill" color={color} />
        }}
      />
      <Tabs.Screen
        name="store"
        options={{
          title: 'Store',
          tabBarIcon: ({ color, size }) => <PlusCircle size={size} weight="fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="reports"
        options={{
          title: 'Report',
          tabBarIcon: ({ color, size }) => <ChartDonut size={size} weight="fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="menu"
        options={{
          title: 'menu',
          tabBarIcon: ({ color, size }) => <SquaresFour size={size} weight="fill" color={color} />,
        }}
      />
    </Tabs>
  );
}
