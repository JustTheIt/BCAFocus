import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import HomeNavigator from './HomeNavigator';
import SyllabusNavigator from './SyllabusNavigator';
import PlannerNavigator from './PlannerNavigator';
import FocusTimerScreen from '../screens/focus/FocusTimerScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import colors from '../constants/colors';

const Tab = createBottomTabNavigator();

const TabNavigator = () => {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName;

                    if (route.name === 'HomeStack') {
                        iconName = focused ? 'home' : 'home-outline';
                    } else if (route.name === 'SyllabusTab') {
                        iconName = focused ? 'book' : 'book-outline';
                    } else if (route.name === 'PlannerTab') {
                        iconName = focused ? 'calendar' : 'calendar-outline';
                    } else if (route.name === 'Focus') {
                        iconName = focused ? 'time' : 'time-outline';
                    } else if (route.name === 'Profile') {
                        iconName = focused ? 'person' : 'person-outline';
                    }

                    return <Ionicons name={iconName} size={size} color={color} />;
                },
                tabBarActiveTintColor: colors.primary,
                tabBarInactiveTintColor: 'gray',
                headerShown: false,
            })}
        >
            <Tab.Screen
                name="HomeStack"
                component={HomeNavigator}
                options={{ title: 'Home' }}
            />
            <Tab.Screen
                name="SyllabusTab"
                component={SyllabusNavigator}
                options={{ title: 'Syllabus' }}
            />
            <Tab.Screen
                name="PlannerTab"
                component={PlannerNavigator}
                options={{ title: 'Planner' }}
            />
            <Tab.Screen name="Focus" component={FocusTimerScreen} />
            <Tab.Screen name="Profile" component={ProfileScreen} />
        </Tab.Navigator>
    );
};

export default TabNavigator;
