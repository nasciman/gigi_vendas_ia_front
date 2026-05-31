import { useCallback, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { CameraView, useCameraPermissions } from 'expo-camera';
import type { BarcodeScanningResult } from 'expo-camera';
import { isAxiosError } from 'axios';
import { Colors } from '../constants/Colors';
import { Endpoints } from '../constants/Api';
import api from '../services/api';

export default function ScannerScreen() {
  const router = useRouter();
  const { mode } = useLocalSearchParams<{ mode: 'consult' | 'purchase' }>();
  const [permission, requestPermission] = useCameraPermissions();
  const [processing, setProcessing] = useState(false);
  const scannedRef = useRef(false);

  const handleBarCodeScanned = useCallback(
    async (result: BarcodeScanningResult) => {
      if (scannedRef.current || processing) return;
      scannedRef.current = true;
      setProcessing(true);

      const barcode = result.data;

      const promptRegister = () => {
        Alert.alert(
          'Produto Não Encontrado',
          'Este produto ainda não está cadastrado. Deseja cadastrá-lo?',
          [
            {
              text: 'Não',
              style: 'cancel',
            },
            {
              text: 'Sim',
              onPress: () =>
                router.replace(`/forms/product-form?barcode=${barcode}`),
            },
          ],
        );
      };

      try {
        await api.get(Endpoints.productByBarcode(barcode));
        scannedRef.current = false;
        setProcessing(false);

        if (mode === 'purchase') {
          router.replace(`/forms/purchase-form?barcode=${barcode}`);
        } else {
          router.replace(`/product-details?barcode=${barcode}`);
        }
      } catch (error) {
        scannedRef.current = false;
        setProcessing(false);

        if (isAxiosError(error) && error.response?.status === 404) {
          promptRegister();
        } else {
          Alert.alert(
            'Erro de Conexão',
            'Não foi possível consultar o produto. Verifique a ligação ao servidor.',
          );
        }
      }
    },
    [processing, router, mode],
  );

  if (!permission) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.accent} />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.centered}>
        <Text style={styles.permissionText}>
          A app precisa de acesso à câmara para ler códigos de barras.
        </Text>
        <TouchableOpacity
          style={styles.permissionButton}
          onPress={requestPermission}
        >
          <Text style={styles.permissionButtonText}>Permitir Câmara</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={styles.camera}
        facing="back"
        barcodeScannerSettings={{
          barcodeTypes: [
            'ean13',
            'ean8',
            'upc_a',
            'upc_e',
            'code128',
            'code39',
            'code93',
            'codabar',
            'itf14',
            'qr',
          ],
        }}
        onBarcodeScanned={processing ? undefined : handleBarCodeScanned}
      />

      {/* Scan overlay */}
      <View style={styles.overlay}>
        <View style={styles.overlayTop} />
        <View style={styles.overlayMiddle}>
          <View style={styles.overlaySide} />
          <View style={styles.scanArea}>
            <View style={[styles.corner, styles.cornerTL]} />
            <View style={[styles.corner, styles.cornerTR]} />
            <View style={[styles.corner, styles.cornerBL]} />
            <View style={[styles.corner, styles.cornerBR]} />
          </View>
          <View style={styles.overlaySide} />
        </View>
        <View style={styles.overlayBottom}>
          {processing ? (
            <View style={styles.feedbackContainer}>
              <ActivityIndicator size="large" color="#FFF" />
              <Text style={styles.feedbackText}>A consultar produto...</Text>
            </View>
          ) : (
            <Text style={styles.hintText}>
              Aponte a câmara para o código de barras
            </Text>
          )}
        </View>
      </View>

      {/* Back button */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.back()}
      >
        <Text style={styles.backButtonText}>✕</Text>
      </TouchableOpacity>
    </View>
  );
}

const SCAN_AREA_SIZE = 260;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
    padding: 32,
  },
  permissionText: {
    color: '#FFF',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 24,
  },
  permissionButton: {
    backgroundColor: Colors.accent,
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 28,
  },
  permissionButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  overlay: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'center',
  },
  overlayTop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  overlayMiddle: {
    flexDirection: 'row',
    height: SCAN_AREA_SIZE,
  },
  overlaySide: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  scanArea: {
    width: SCAN_AREA_SIZE,
    height: SCAN_AREA_SIZE,
  },
  corner: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderColor: '#FFF',
  },
  cornerTL: {
    top: 0,
    left: 0,
    borderTopWidth: 3,
    borderLeftWidth: 3,
  },
  cornerTR: {
    top: 0,
    right: 0,
    borderTopWidth: 3,
    borderRightWidth: 3,
  },
  cornerBL: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
  },
  cornerBR: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 3,
    borderRightWidth: 3,
  },
  overlayBottom: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center',
    paddingTop: 32,
  },
  hintText: {
    color: '#FFF',
    fontSize: 15,
    textAlign: 'center',
  },
  feedbackContainer: {
    alignItems: 'center',
    gap: 12,
  },
  feedbackText: {
    color: '#FFF',
    fontSize: 15,
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: '600',
  },
});
