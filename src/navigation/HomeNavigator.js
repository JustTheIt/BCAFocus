import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from '../screens/home/HomeScreen';
import ProjectIdeasScreen from '../screens/projects/ProjectIdeasScreen';
import CareerRoadmapScreen from '../screens/career/CareerRoadmapScreen';
import MaterialsScreen from '../screens/materials/MaterialsScreen';
import colors from '../constants/colors';

const Stack = createStackNavigator();

const HomeNavigator = () => {
    return (
        <Stack.Navigator
            screenOptions={{
                headerStyle: { backgroundColor: colors.primary },
                headerTintColor: '#fff',
                headerTitleStyle: { fontWeight: 'bold' },
                headerBackTitleVisible: false,
            }}
        >
            <Stack.Screen name="Dashboard" component={HomeScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Projects" component={ProjectIdeasScreen} options={{ title: 'Project Ideas' }} />
            <Stack.Screen name="Career" component={CareerRoadmapScreen} options={{ title: 'Career Guidance' }} />
            <Stack.Screen name="Materials" component={MaterialsScreen} options={{ title: 'Study Materials' }} />
        </Stack.Navigator>
    );
};

export default HomeNavigator;
