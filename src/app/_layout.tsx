import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  return (
    <>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: '#FFFFFF' },
          headerTintColor: '#1A1A2E',
          headerTitleStyle: { fontWeight: '600' },
          contentStyle: { backgroundColor: '#F5F5F5' },
        }}
      >
        <Stack.Screen
          name="index"
          options={{ title: 'Gigi Vendas', headerShown: false }}
        />
        <Stack.Screen
          name="scanner"
          options={{ title: 'Scanner', presentation: 'fullScreenModal' }}
        />
        <Stack.Screen
          name="forms/product-form"
          options={{ title: 'Novo Produto' }}
        />
        <Stack.Screen
          name="forms/purchase-form"
          options={{ title: 'Nova Compra' }}
        />
      </Stack>
    </>
  );
}
