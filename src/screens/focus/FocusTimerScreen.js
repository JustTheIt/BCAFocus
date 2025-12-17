import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../../constants/colors';

const { width } = Dimensions.get('window');

const FocusTimerScreen = () => {
    const [minutes, setMinutes] = useState(25);
    const [seconds, setSeconds] = useState(0);
    const [isActive, setIsActive] = useState(false);
    const [mode, setMode] = useState('Focus'); // Focus or Break

    useEffect(() => {
        let interval = null;
        if (isActive) {
            interval = setInterval(() => {
                if (seconds === 0) {
                    if (minutes === 0) {
                        clearInterval(interval);
                        setIsActive(false);
                        // Handle timer end (sound, alert, etc.)
                        alert(`${mode} session completed!`);
                    } else {
                        setMinutes(minutes - 1);
                        setSeconds(59);
                    }
                } else {
                    setSeconds(seconds - 1);
                }
            }, 1000);
        } else {
            clearInterval(interval);
        }
        return () => clearInterval(interval);
    }, [isActive, seconds, minutes, mode]);

    const toggleTimer = () => {
        setIsActive(!isActive);
    };

    const resetTimer = () => {
        setIsActive(false);
        setMinutes(mode === 'Focus' ? 25 : 5);
        setSeconds(0);
    };

    const switchMode = (newMode) => {
        setMode(newMode);
        setIsActive(false);
        setMinutes(newMode === 'Focus' ? 25 : 5);
        setSeconds(0);
    };

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Focus Mode</Text>

            <View style={styles.toggleContainer}>
                <TouchableOpacity
                    style={[styles.modeButton, mode === 'Focus' && styles.activeMode]}
                    onPress={() => switchMode('Focus')}
                >
                    <Text style={[styles.modeText, mode === 'Focus' && styles.activeModeText]}>Focus</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.modeButton, mode === 'Break' && styles.activeMode]}
                    onPress={() => switchMode('Break')}
                >
                    <Text style={[styles.modeText, mode === 'Break' && styles.activeModeText]}>Break</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.timerCircle}>
                <Text style={styles.timerText}>
                    {minutes < 10 ? `0${minutes}` : minutes}:{seconds < 10 ? `0${seconds}` : seconds}
                </Text>
                <Text style={styles.statusText}>{isActive ? 'Running' : 'Paused'}</Text>
            </View>

            <View style={styles.controls}>
                <TouchableOpacity style={styles.controlButton} onPress={toggleTimer}>
                    <Ionicons name={isActive ? "pause" : "play"} size={32} color={colors.white} />
                </TouchableOpacity>
                <TouchableOpacity style={[styles.controlButton, styles.resetButton]} onPress={resetTimer}>
                    <Ionicons name="refresh" size={32} color={colors.white} />
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
    },
    header: {
        fontSize: 24,
        color: colors.white,
        fontWeight: 'bold',
        position: 'absolute',
        top: 60,
    },
    toggleContainer: {
        flexDirection: 'row',
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 25,
        marginBottom: 50,
        padding: 4,
    },
    modeButton: {
        paddingVertical: 8,
        paddingHorizontal: 24,
        borderRadius: 20,
    },
    activeMode: {
        backgroundColor: colors.white,
    },
    modeText: {
        color: colors.white,
        fontWeight: '600',
    },
    activeModeText: {
        color: colors.primary,
    },
    timerCircle: {
        width: width * 0.7,
        height: width * 0.7,
        borderRadius: width * 0.35,
        borderWidth: 4,
        borderColor: 'rgba(255,255,255,0.3)',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.1)',
        marginBottom: 50,
    },
    timerText: {
        fontSize: 60,
        fontWeight: 'bold',
        color: colors.white,
    },
    statusText: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: 16,
        marginTop: 10,
    },
    controls: {
        flexDirection: 'row',
        gap: 20,
    },
    controlButton: {
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    resetButton: {
        backgroundColor: 'rgba(255,255,255,0.1)',
    },
});

export default FocusTimerScreen;
