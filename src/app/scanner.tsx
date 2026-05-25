import { StyleSheet, Text, View } from 'react-native';

export default function ScannerScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.placeholder}>
        Scanner — implementação na próxima fase
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  placeholder: {
    color: '#FFF',
    fontSize: 16,
  },
});
