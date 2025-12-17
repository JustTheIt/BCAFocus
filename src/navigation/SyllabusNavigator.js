import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import UniversityListScreen from '../screens/syllabus/UniversityListScreen';
import SemesterListScreen from '../screens/syllabus/SemesterListScreen';
import SubjectListScreen from '../screens/syllabus/SubjectListScreen';
import SubjectDetailScreen from '../screens/syllabus/SubjectDetailScreen';
import UnitDetailScreen from '../screens/syllabus/UnitDetailScreen';
import colors from '../constants/colors';

const Stack = createStackNavigator();

const SyllabusNavigator = () => {
    return (
        <Stack.Navigator
            screenOptions={{
                headerStyle: { backgroundColor: colors.primary },
                headerTintColor: '#fff',
                headerTitleStyle: { fontWeight: 'bold' },
                headerBackTitleVisible: false,
            }}
        >
            <Stack.Screen name="UniversityList" component={UniversityListScreen} options={{ title: 'Select University' }} />
            <Stack.Screen name="SemesterList" component={SemesterListScreen} options={({ route }) => ({ title: route.params.universityName || 'Semesters' })} />
            <Stack.Screen name="SubjectList" component={SubjectListScreen} options={({ route }) => ({ title: route.params.name })} />
            <Stack.Screen name="SubjectDetail" component={SubjectDetailScreen} options={{ title: 'Details' }} />
            <Stack.Screen name="UnitDetail" component={UnitDetailScreen} options={{ title: 'Unit' }} />
        </Stack.Navigator>
    );
};

export default SyllabusNavigator;
