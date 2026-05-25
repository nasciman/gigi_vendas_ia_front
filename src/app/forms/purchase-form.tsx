import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
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

export default function PurchaseFormScreen() {
  const router = useRouter();
  const { barcode } = useLocalSearchParams<{ barcode: string }>();

  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [loadingProduct, setLoadingProduct] = useState(true);
  const [supplierId, setSupplierId] = useState<string | null>(null);
  const [purchasePrice, setPurchasePrice] = useState(0);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!barcode) return;

    const loadProduct = async () => {
      try {
        const response = await api.get<ProductDetail>(
          Endpoints.productByBarcode(barcode),
        );
        const data = response.data;
        setProduct(data);
        if (data.lastPurchasePrice != null && data.lastPurchasePrice > 0) {
          setPurchasePrice(data.lastPurchasePrice);
        }
      } catch {
        Alert.alert('Erro', 'Não foi possível carregar o produto.', [
          { text: 'Voltar', onPress: () => router.back() },
        ]);
      } finally {
        setLoadingProduct(false);
      }
    };

    loadProduct();
  }, [barcode, router]);

  const handlePricingChange = useCallback(
    (cost: number, _margin: number, _sale: number) => {
      setPurchasePrice(cost);
    },
    [],
  );

  const handleSave = async () => {
    if (!supplierId) {
      Alert.alert('Campo obrigatório', 'Selecione um fornecedor.');
      return;
    }
    if (purchasePrice <= 0) {
      Alert.alert('Campo obrigatório', 'Informe o preço de compra (custo).');
      return;
    }

    setSaving(true);
    try {
      await api.post(Endpoints.purchases, {
        productId: barcode,
        supplierId,
        purchasePrice,
        purchaseDate: new Date().toISOString(),
      });

      Alert.alert('Sucesso', 'Compra registada com sucesso!', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch {
      Alert.alert('Erro', 'Não foi possível registar a compra. Tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  if (loadingProduct) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.accent} />
        <Text style={styles.loadingText}>A carregar produto...</Text>
      </View>
    );
  }

  if (!product) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorText}>Produto não encontrado.</Text>
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
        {/* Product Info (read-only) */}
        <View style={styles.productCard}>
          {product.photoPath ? (
            <Image
              source={{ uri: resolvePhotoUrl(product.photoPath) ?? '' }}
              style={styles.productPhoto}
            />
          ) : (
            <View style={styles.productPhotoPlaceholder}>
              <Text style={styles.productPhotoPlaceholderIcon}>📦</Text>
            </View>
          )}
          <View style={styles.productInfo}>
            <Text style={styles.productName}>{product.name}</Text>
            <Text style={styles.productBarcode}>{product.barcode}</Text>
          </View>
        </View>

        {/* Supplier */}
        <SearchableDropdown
          selectedId={supplierId}
          onSelect={(supplier) => setSupplierId(supplier.id)}
        />

        {/* Pricing Calculator (restock mode) */}
        <PricingCalculator
          mode="restock"
          initialSalePrice={product.salePrice}
          initialCost={purchasePrice > 0 ? purchasePrice : undefined}
          onPricingChange={handlePricingChange}
        />

        {/* Save Button */}
        <TouchableOpacity
          style={[styles.saveButton, saving && styles.saveButtonDisabled]}
          activeOpacity={0.7}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.saveButtonText}>Registar Compra</Text>
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
  errorText: {
    fontSize: 16,
    color: Colors.error,
  },
  productCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  productPhoto: {
    width: 72,
    height: 72,
    borderRadius: 8,
  },
  productPhotoPlaceholder: {
    width: 72,
    height: 72,
    borderRadius: 8,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  productPhotoPlaceholderIcon: {
    fontSize: 28,
  },
  productInfo: {
    flex: 1,
    marginLeft: 14,
  },
  productName: {
    fontSize: 17,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  productBarcode: {
    fontSize: 13,
    color: Colors.textMuted,
    marginTop: 4,
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
