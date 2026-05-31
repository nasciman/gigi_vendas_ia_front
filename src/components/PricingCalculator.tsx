import { useCallback, useEffect, useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { Colors } from '../constants/Colors';
import { formatCurrency, parseCurrencyInput } from '../utils/currency';
import { calculateMargin, calculateSalePrice } from '../utils/margin';

type Mode = 'new' | 'restock';

interface PricingCalculatorProps {
  mode: Mode;
  initialSalePrice?: number;
  initialCost?: number;
  costEditable?: boolean;
  onPricingChange: (cost: number, margin: number, salePrice: number) => void;
}

const DEFAULT_MARGIN = 30;

export default function PricingCalculator({
  mode,
  initialSalePrice = 0,
  initialCost = 0,
  costEditable = true,
  onPricingChange,
}: PricingCalculatorProps) {
  const [costText, setCostText] = useState(
    initialCost > 0 ? formatCurrency(initialCost) : '',
  );
  const [marginText, setMarginText] = useState(() => {
    if (mode === 'new') return String(DEFAULT_MARGIN);
    if (initialCost > 0 && initialSalePrice > 0) {
      return calculateMargin(initialCost, initialSalePrice).toFixed(1);
    }
    return '';
  });
  const [salePriceText, setSalePriceText] = useState(
    initialSalePrice > 0 ? formatCurrency(initialSalePrice) : '',
  );

  const [cost, setCost] = useState(initialCost);
  const [margin, setMargin] = useState(() => {
    if (mode === 'new') return DEFAULT_MARGIN;
    if (initialCost > 0 && initialSalePrice > 0) {
      return calculateMargin(initialCost, initialSalePrice);
    }
    return 0;
  });
  const [salePrice, setSalePrice] = useState(initialSalePrice);

  useEffect(() => {
    onPricingChange(cost, margin, salePrice);
  }, [cost, margin, salePrice, onPricingChange]);

  const handleCostChange = useCallback(
    (text: string) => {
      setCostText(text);
      const newCost = parseCurrencyInput(text);
      setCost(newCost);

      if (mode === 'new') {
        const currentMargin =
          marginText.length > 0 ? parseFloat(marginText) || 0 : DEFAULT_MARGIN;
        const newSalePrice = calculateSalePrice(newCost, currentMargin);
        setSalePrice(newSalePrice);
        setSalePriceText(newSalePrice > 0 ? formatCurrency(newSalePrice) : '');
      } else {
        const currentSalePrice = salePrice > 0 ? salePrice : initialSalePrice;
        if (newCost > 0 && currentSalePrice > 0) {
          const realMargin = calculateMargin(newCost, currentSalePrice);
          setMargin(realMargin);
          setMarginText(realMargin.toFixed(1));
        }
      }
    },
    [mode, marginText, salePrice, initialSalePrice],
  );

  const handleMarginChange = useCallback(
    (text: string) => {
      setMarginText(text);
      const newMargin = parseFloat(text) || 0;
      setMargin(newMargin);

      if (cost > 0) {
        const newSalePrice = calculateSalePrice(cost, newMargin);
        setSalePrice(newSalePrice);
        setSalePriceText(newSalePrice > 0 ? formatCurrency(newSalePrice) : '');
      }
    },
    [cost],
  );

  const handleSalePriceChange = useCallback(
    (text: string) => {
      setSalePriceText(text);
      const newSalePrice = parseCurrencyInput(text);
      setSalePrice(newSalePrice);

      if (cost > 0 && newSalePrice > 0) {
        const realMargin = calculateMargin(cost, newSalePrice);
        setMargin(realMargin);
        setMarginText(realMargin.toFixed(1));
      }
    },
    [cost],
  );

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Precificação</Text>

      <View style={styles.row}>
        <View style={styles.field}>
          <Text style={styles.label}>Custo (R$)</Text>
          <TextInput
            style={[styles.input, !costEditable && styles.inputDisabled]}
            value={costText}
            onChangeText={handleCostChange}
            placeholder="0,00"
            placeholderTextColor={Colors.textMuted}
            keyboardType="numeric"
            editable={costEditable}
          />
        </View>

        <View style={styles.fieldSmall}>
          <Text style={styles.label}>Margem %</Text>
          <TextInput
            style={[
              styles.input,
              mode === 'restock' && cost > 0 && styles.inputHighlight,
              cost <= 0 && styles.inputDisabled,
            ]}
            value={marginText}
            onChangeText={handleMarginChange}
            placeholder={cost > 0 ? '30' : '—'}
            placeholderTextColor={Colors.textMuted}
            keyboardType="numeric"
            editable={cost > 0}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Preço de Venda (R$)</Text>
          <TextInput
            style={styles.input}
            value={salePriceText}
            onChangeText={handleSalePriceChange}
            placeholder="0,00"
            placeholderTextColor={Colors.textMuted}
            keyboardType="numeric"
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  field: {
    flex: 2,
  },
  fieldSmall: {
    flex: 1,
  },
  label: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  input: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: Colors.textPrimary,
  },
  inputHighlight: {
    borderColor: Colors.accent,
    backgroundColor: '#F0F7FF',
  },
  inputDisabled: {
    backgroundColor: Colors.background,
    color: Colors.textMuted,
  },
});
