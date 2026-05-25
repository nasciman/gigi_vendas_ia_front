import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function DashboardScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Gigi Vendas</Text>
        <Text style={styles.subtitle}>Gestão de Catálogo e Compras</Text>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.actionButton}
          activeOpacity={0.7}
          onPress={() => router.push('/scanner?mode=product')}
        >
          <Text style={styles.actionIcon}>📦</Text>
          <Text style={styles.actionText}>Produtos</Text>
          <Text style={styles.actionHint}>
            Cadastrar novo ou editar produto existente
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          activeOpacity={0.7}
          onPress={() => router.push('/scanner?mode=purchase')}
        >
          <Text style={styles.actionIcon}>🛒</Text>
          <Text style={styles.actionText}>Entrada de Compras</Text>
          <Text style={styles.actionHint}>
            Registar nova compra de produto existente
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    paddingTop: 40,
    paddingBottom: 32,
    paddingHorizontal: 24,
    backgroundColor: '#1A1A2E',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  subtitle: {
    fontSize: 14,
    color: '#B0B0C0',
    marginTop: 4,
  },
  actions: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    gap: 16,
  },
  actionButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 28,
    paddingHorizontal: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  actionIcon: {
    fontSize: 40,
    marginBottom: 12,
  },
  actionText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A2E',
    textAlign: 'center',
  },
  actionHint: {
    fontSize: 13,
    color: '#888',
    marginTop: 6,
    textAlign: 'center',
  },
});
