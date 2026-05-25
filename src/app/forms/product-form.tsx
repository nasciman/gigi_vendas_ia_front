import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import PricingCalculator from '../../components/PricingCalculator';
import { Colors } from '../../constants/Colors';
import { Endpoints } from '../../constants/Api';
import api from '../../services/api';

export default function ProductFormScreen() {
  const router = useRouter();
  const { barcode } = useLocalSearchParams<{ barcode: string }>();

  const [name, setName] = useState('');
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [salePrice, setSalePrice] = useState(0);
  const [purchasePrice, setPurchasePrice] = useState(0);
  const [loading, setLoading] = useState(false);

  const handlePricingChange = useCallback(
    (cost: number, _margin: number, sale: number) => {
      setPurchasePrice(cost);
      setSalePrice(sale);
    },
    [],
  );

  const handlePickPhoto = () => {
    Alert.alert('Foto', 'Captura de foto será implementada com expo-camera.');
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Campo obrigatório', 'Informe o nome do produto.');
      return;
    }
    if (salePrice <= 0) {
      Alert.alert('Campo obrigatório', 'Informe o preço de venda.');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('barcode', barcode ?? '');
      formData.append('name', name.trim());
      formData.append('salePrice', String(salePrice));

      if (photoUri) {
        const filename = photoUri.split('/').pop() ?? 'photo.jpg';
        formData.append('photo', {
          uri: photoUri,
          name: filename,
          type: 'image/jpeg',
        } as unknown as Blob);
      }

      await api.post(Endpoints.products, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (purchasePrice > 0) {
        await api.post(Endpoints.purchases, {
          productId: barcode,
          supplierId: null,
          purchasePrice,
          purchaseDate: new Date().toISOString(),
        });
      }

      Alert.alert('Sucesso', 'Produto registado com sucesso!', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível salvar o produto. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.barcodeLabel}>
          Código de Barras: {barcode ?? '—'}
        </Text>

        {/* Photo */}
        <TouchableOpacity
          style={styles.photoButton}
          activeOpacity={0.7}
          onPress={handlePickPhoto}
        >
          {photoUri ? (
            <Image source={{ uri: photoUri }} style={styles.photoPreview} />
          ) : (
            <View style={styles.photoPlaceholder}>
              <Text style={styles.photoPlaceholderIcon}>📷</Text>
              <Text style={styles.photoPlaceholderText}>Tirar Foto</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Product Name */}
        <Text style={styles.label}>Nome do Produto</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Ex: Arroz Integral 1kg"
          placeholderTextColor={Colors.textMuted}
          autoCapitalize="words"
        />

        {/* Pricing Calculator */}
        <PricingCalculator mode="new" onPricingChange={handlePricingChange} />

        {/* Save Button */}
        <TouchableOpacity
          style={[styles.saveButton, loading && styles.saveButtonDisabled]}
          activeOpacity={0.7}
          onPress={handleSave}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.saveButtonText}>Salvar Produto</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  barcodeLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 16,
  },
  photoButton: {
    alignSelf: 'center',
    marginBottom: 20,
  },
  photoPreview: {
    width: 140,
    height: 140,
    borderRadius: 12,
  },
  photoPlaceholder: {
    width: 140,
    height: 140,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.border,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.surface,
  },
  photoPlaceholderIcon: {
    fontSize: 32,
    marginBottom: 6,
  },
  photoPlaceholderText: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textPrimary,
    marginBottom: 6,
  },
  input: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: Colors.textPrimary,
    marginBottom: 16,
  },
  saveButton: {
    marginTop: 28,
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
