import { Stack } from "expo-router";
import { setStatusBarStyle } from "expo-status-bar";
import { useEffect } from "react";

export default function Layout() {
  useEffect(() => {
      setTimeout(() => {
      setStatusBarStyle("dark");
    }, 0);
  }, []);
  return (
    <Stack>
      <Stack.Screen name="dashboard" options={{     headerStyle: {
      backgroundColor: '#25292e',
    },headerTintColor: '#fff',title:'dashboard', headerShown: false }} />

    <Stack.Screen name="camera" options={{ title:'camera', headerShown: false }} />
    </Stack>
  );
}
