import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import PlannerScreen from '../screens/planner/PlannerScreen';
import AddTaskScreen from '../screens/planner/AddTaskScreen';
import colors from '../constants/colors';

const Stack = createStackNavigator();

const PlannerNavigator = () => {
    return (
        <Stack.Navigator
            screenOptions={{
                headerStyle: { backgroundColor: colors.primary },
                headerTintColor: '#fff',
                headerTitleStyle: { fontWeight: 'bold' },
                headerBackTitleVisible: false,
            }}
        >
            <Stack.Screen name="PlannerList" component={PlannerScreen} options={{ title: 'My Planner' }} />
            <Stack.Screen name="AddTask" component={AddTaskScreen} options={{ title: 'Add New Task' }} />
        </Stack.Navigator>
    );
};

export default PlannerNavigator;
