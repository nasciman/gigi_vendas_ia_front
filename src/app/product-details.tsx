import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Colors } from '../constants/Colors';
import { Endpoints } from '../constants/Api';
import api from '../services/api';
import { resolvePhotoUrl } from '../utils/image';
import { formatCurrency } from '../utils/currency';
import { calculateMargin } from '../utils/margin';
import type { ProductDetail } from '../types/product';

export default function ProductDetailsScreen() {
  const router = useRouter();
  const { barcode } = useLocalSearchParams<{ barcode: string }>();

  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!barcode) {
      setLoading(false);
      return;
    }

    const loadProduct = async () => {
      try {
        const response = await api.get<ProductDetail>(
          Endpoints.productByBarcode(barcode),
        );
        setProduct(response.data);
      } catch {
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [barcode]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.accent} />
        <Text style={styles.loadingText}>A carregar produto...</Text>
      </View>
    );
  }

  if (!product) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Produto não encontrado.</Text>
        <TouchableOpacity
          style={styles.secondaryButton}
          activeOpacity={0.7}
          onPress={() => router.back()}
        >
          <Text style={styles.secondaryButtonText}>Voltar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const photoUri = resolvePhotoUrl(product.photoPath);
  const lastCost = product.lastPurchasePrice ?? 0;
  const margin =
    lastCost > 0 ? calculateMargin(lastCost, product.salePrice) : null;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
    >
      {/* Photo */}
      <View style={styles.photoWrapper}>
        {photoUri ? (
          <Image source={{ uri: photoUri }} style={styles.photo} />
        ) : (
          <View style={styles.photoPlaceholder}>
            <Text style={styles.photoPlaceholderIcon}>📦</Text>
          </View>
        )}
      </View>

      {/* Name + barcode */}
      <Text style={styles.name}>{product.name}</Text>
      <Text style={styles.barcode}>Código: {product.barcode}</Text>

      {/* Info card */}
      <View style={styles.card}>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Preço de Venda</Text>
          <Text style={styles.rowValueStrong}>
            {formatCurrency(product.salePrice)}
          </Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.row}>
          <Text style={styles.rowLabel}>Último Custo</Text>
          <Text style={styles.rowValue}>
            {lastCost > 0 ? formatCurrency(lastCost) : '—'}
          </Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.row}>
          <Text style={styles.rowLabel}>Último Fornecedor</Text>
          <Text style={styles.rowValue}>
            {product.lastSupplierName ?? '—'}
          </Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.row}>
          <Text style={styles.rowLabel}>Margem</Text>
          <Text style={styles.rowValue}>
            {margin != null ? `${margin.toFixed(1)}%` : '—'}
          </Text>
        </View>
      </View>

      {/* Actions */}
      <TouchableOpacity
        style={styles.primaryButton}
        activeOpacity={0.7}
        onPress={() =>
          router.push(`/forms/purchase-form?barcode=${product.barcode}`)
        }
      >
        <Text style={styles.primaryButtonText}>Registar Entrada</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.secondaryButton}
        activeOpacity={0.7}
        onPress={() =>
          router.push(`/forms/product-form?barcode=${product.barcode}`)
        }
      >
        <Text style={styles.secondaryButtonText}>Editar Produto</Text>
      </TouchableOpacity>
    </ScrollView>
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
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
    padding: 24,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: Colors.textSecondary,
  },
  errorText: {
    fontSize: 16,
    color: Colors.error,
    marginBottom: 20,
  },
  photoWrapper: {
    alignSelf: 'center',
    marginBottom: 16,
  },
  photo: {
    width: 160,
    height: 160,
    borderRadius: 16,
  },
  photoPlaceholder: {
    width: 160,
    height: 160,
    borderRadius: 16,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoPlaceholderIcon: {
    fontSize: 48,
  },
  name: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  barcode: {
    fontSize: 13,
    color: Colors.textMuted,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 20,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
  },
  rowLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  rowValue: {
    fontSize: 15,
    color: Colors.textPrimary,
    fontWeight: '500',
  },
  rowValueStrong: {
    fontSize: 18,
    color: Colors.success,
    fontWeight: '700',
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
  },
  primaryButton: {
    marginTop: 28,
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    marginTop: 12,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.accent,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: Colors.accent,
    fontSize: 16,
    fontWeight: '600',
  },
});
