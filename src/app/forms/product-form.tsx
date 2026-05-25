import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { CameraView, useCameraPermissions } from 'expo-camera';
import PricingCalculator from '../../components/PricingCalculator';
import SearchableDropdown from '../../components/SearchableDropdown';
import { Colors } from '../../constants/Colors';
import { Endpoints } from '../../constants/Api';
import api from '../../services/api';

const API_BASE = 'http://192.168.1.100:8080';

interface ProductDetail {
  barcode: string;
  name: string;
  photoPath: string | null;
  salePrice: number;
  lastPurchasePrice: number | null;
}

function resolvePhotoUrl(photoPath: string | null): string | null {
  if (!photoPath) return null;
  if (photoPath.startsWith('http')) return photoPath;
  return `${API_BASE}${photoPath.startsWith('/') ? '' : '/'}${photoPath}`;
}

export default function ProductFormScreen() {
  const router = useRouter();
  const { barcode } = useLocalSearchParams<{ barcode: string }>();

  const [name, setName] = useState('');
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [supplierId, setSupplierId] = useState<string | null>(null);
  const [salePrice, setSalePrice] = useState(0);
  const [purchasePrice, setPurchasePrice] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [loadingProduct, setLoadingProduct] = useState(true);

  const [cameraVisible, setCameraVisible] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);

  useEffect(() => {
    if (!barcode) {
      setLoadingProduct(false);
      return;
    }

    const loadProduct = async () => {
      try {
        const response = await api.get<ProductDetail>(
          Endpoints.productByBarcode(barcode),
        );
        const product = response.data;
        setName(product.name);
        setSalePrice(product.salePrice);
        setPhotoUri(resolvePhotoUrl(product.photoPath));
        setIsEditing(true);
      } catch {
        // 404 or error — product doesn't exist, keep form empty for new registration
      } finally {
        setLoadingProduct(false);
      }
    };

    loadProduct();
  }, [barcode]);

  const handlePricingChange = useCallback(
    (cost: number, _margin: number, sale: number) => {
      setPurchasePrice(cost);
      setSalePrice(sale);
    },
    [],
  );

  const handleOpenCamera = async () => {
    if (!permission?.granted) {
      const result = await requestPermission();
      if (!result.granted) {
        Alert.alert(
          'Permissão Negada',
          'A app precisa de acesso à câmara para tirar fotos.',
        );
        return;
      }
    }
    setCameraVisible(true);
  };

  const handleTakePhoto = async () => {
    if (!cameraRef.current) return;

    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.7,
        skipProcessing: true,
      });
      if (photo) {
        setPhotoUri(photo.uri);
      }
      setCameraVisible(false);
    } catch {
      Alert.alert('Erro', 'Não foi possível capturar a foto.');
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Campo obrigatório', 'Informe o nome do produto.');
      return;
    }
    if (!supplierId) {
      Alert.alert('Campo obrigatório', 'Selecione um fornecedor.');
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
          supplierId,
          purchasePrice,
          purchaseDate: new Date().toISOString(),
        });
      }

      Alert.alert('Sucesso', 'Produto registado com sucesso!', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch {
      Alert.alert('Erro', 'Não foi possível salvar o produto. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  if (loadingProduct) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.accent} />
        <Text style={styles.loadingText}>A carregar...</Text>
      </View>
    );
  }

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
          onPress={handleOpenCamera}
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

        {/* Supplier */}
        <SearchableDropdown
          selectedId={supplierId}
          onSelect={(supplier) => setSupplierId(supplier.id)}
        />

        {/* Pricing Calculator */}
        <PricingCalculator
          mode="new"
          initialSalePrice={isEditing ? salePrice : undefined}
          onPricingChange={handlePricingChange}
        />

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

      {/* Camera Modal */}
      <Modal
        visible={cameraVisible}
        animationType="slide"
        onRequestClose={() => setCameraVisible(false)}
      >
        <View style={styles.cameraContainer}>
          <CameraView
            ref={cameraRef}
            style={styles.camera}
            facing="back"
          />
          <View style={styles.cameraControls}>
            <TouchableOpacity
              style={styles.cameraCancelButton}
              onPress={() => setCameraVisible(false)}
            >
              <Text style={styles.cameraCancelText}>Cancelar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.captureButton}
              onPress={handleTakePhoto}
            >
              <View style={styles.captureButtonInner} />
            </TouchableOpacity>

            <View style={styles.cameraSpacerRight} />
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: Colors.textSecondary,
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
  cameraContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
  },
  cameraControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 24,
    paddingBottom: 40,
    backgroundColor: '#000',
  },
  cameraCancelButton: {
    flex: 1,
  },
  cameraCancelText: {
    color: '#FFF',
    fontSize: 16,
  },
  captureButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 4,
    borderColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButtonInner: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#FFF',
  },
  cameraSpacerRight: {
    flex: 1,
  },
});
