import { Stack } from "expo-router";
import { setStatusBarStyle } from "expo-status-bar";
import { useEffect } from "react";

export default function Layout() {
  useEffect(() => {
      setTimeout(() => {
      setStatusBarStyle("light");
    }, 0);
  }, []);
  return (
    <Stack>
      <Stack.Screen name="dashboard" options={{title:'dashboard', headerShown: true }} />
      <Stack.Screen name="camera" options={{ title:'Verify...', headerShown: true }} />
      <Stack.Screen name="userlist" options={{ title:'User List', headerShown: true }} />
      <Stack.Screen name="attendance" options={{ title:'Attendance Log', headerShown: true }} />
      <Stack.Screen name="updateTimes" options={{ title:'Update Times', headerShown: true }} />
    </Stack>
  );
}
