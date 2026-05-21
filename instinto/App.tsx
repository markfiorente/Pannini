import 'react-native-gesture-handler';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet } from 'react-native';

import { RootStackParamList } from './src/types';
import { Colors } from './src/theme';

import HomeScreen from './src/screens/HomeScreen';
import ReflexGame from './src/screens/games/ReflexGame';
import TempoGame from './src/screens/games/TempoGame';
import CodeGame from './src/screens/games/CodeGame';
import ResultScreen from './src/screens/ResultScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import ChallengeSetupScreen from './src/screens/ChallengeSetupScreen';
import ChallengeShareScreen from './src/screens/ChallengeShareScreen';
import ChallengeJoinScreen from './src/screens/ChallengeJoinScreen';
import ChallengePreviewScreen from './src/screens/ChallengePreviewScreen';
import ChallengeResultScreen from './src/screens/ChallengeResultScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <GestureHandlerRootView style={styles.root}>
      <NavigationContainer>
        <StatusBar style="light" />
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: Colors.bg },
            animation: 'slide_from_right',
          }}
        >
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="ReflexGame" component={ReflexGame} />
          <Stack.Screen name="TempoGame" component={TempoGame} />
          <Stack.Screen name="CodeGame" component={CodeGame} />
          <Stack.Screen name="Result" component={ResultScreen} />
          <Stack.Screen name="Profile" component={ProfileScreen} />
          <Stack.Screen name="ChallengeSetup" component={ChallengeSetupScreen} />
          <Stack.Screen name="ChallengeShare" component={ChallengeShareScreen} />
          <Stack.Screen name="ChallengeJoin" component={ChallengeJoinScreen} />
          <Stack.Screen name="ChallengePreview" component={ChallengePreviewScreen} />
          <Stack.Screen name="ChallengeResult" component={ChallengeResultScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
