import { StyleSheet, Text, View } from 'react-native';

export default function ProductFormScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.placeholder}>
        Registo de Produto — implementação na próxima fase
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  placeholder: {
    fontSize: 16,
    color: '#666',
  },
});
