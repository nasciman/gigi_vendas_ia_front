import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Colors } from '../constants/Colors';
import { Endpoints } from '../constants/Api';
import api from '../services/api';

interface Supplier {
  id: string;
  name: string;
}

interface SearchableDropdownProps {
  selectedId: string | null;
  onSelect: (supplier: Supplier) => void;
}

export default function SearchableDropdown({
  selectedId,
  onSelect,
}: SearchableDropdownProps) {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const [loadingList, setLoadingList] = useState(false);

  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [newSupplierName, setNewSupplierName] = useState('');
  const [creating, setCreating] = useState(false);

  const fetchSuppliers = useCallback(async () => {
    setLoadingList(true);
    try {
      const response = await api.get<Supplier[]>(Endpoints.suppliers);
      setSuppliers(response.data);
    } catch {
      Alert.alert('Erro', 'Não foi possível carregar os fornecedores.');
    } finally {
      setLoadingList(false);
    }
  }, []);

  useEffect(() => {
    fetchSuppliers();
  }, [fetchSuppliers]);

  const filtered = suppliers.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase()),
  );

  const selectedSupplier = suppliers.find((s) => s.id === selectedId);

  const handleSelect = (supplier: Supplier) => {
    onSelect(supplier);
    setOpen(false);
    setSearch('');
  };

  const handleCreateSupplier = async () => {
    if (!newSupplierName.trim()) {
      Alert.alert('Campo obrigatório', 'Informe o nome do fornecedor.');
      return;
    }

    setCreating(true);
    try {
      const response = await api.post<Supplier>(Endpoints.suppliers, {
        name: newSupplierName.trim(),
      });
      const created = response.data;
      setSuppliers((prev) => [...prev, created]);
      onSelect(created);
      setCreateModalVisible(false);
      setNewSupplierName('');
      setOpen(false);
      setSearch('');
    } catch {
      Alert.alert('Erro', 'Não foi possível cadastrar o fornecedor.');
    } finally {
      setCreating(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Fornecedor</Text>

      <TouchableOpacity
        style={styles.selector}
        activeOpacity={0.7}
        onPress={() => setOpen(!open)}
      >
        <Text
          style={[
            styles.selectorText,
            !selectedSupplier && styles.selectorPlaceholder,
          ]}
        >
          {selectedSupplier ? selectedSupplier.name : 'Selecione um fornecedor'}
        </Text>
        <Text style={styles.arrow}>{open ? '▲' : '▼'}</Text>
      </TouchableOpacity>

      {open && (
        <View style={styles.dropdown}>
          <TextInput
            style={styles.searchInput}
            value={search}
            onChangeText={setSearch}
            placeholder="Pesquisar fornecedor..."
            placeholderTextColor={Colors.textMuted}
            autoFocus
          />

          {loadingList ? (
            <ActivityIndicator
              style={styles.listLoader}
              color={Colors.accent}
            />
          ) : (
            <FlatList
              data={filtered}
              keyExtractor={(item) => item.id}
              style={styles.list}
              keyboardShouldPersistTaps="handled"
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.item,
                    item.id === selectedId && styles.itemSelected,
                  ]}
                  onPress={() => handleSelect(item)}
                >
                  <Text
                    style={[
                      styles.itemText,
                      item.id === selectedId && styles.itemTextSelected,
                    ]}
                  >
                    {item.name}
                  </Text>
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <Text style={styles.emptyText}>
                  Nenhum fornecedor encontrado.
                </Text>
              }
            />
          )}

          <TouchableOpacity
            style={styles.createButton}
            activeOpacity={0.7}
            onPress={() => setCreateModalVisible(true)}
          >
            <Text style={styles.createButtonText}>+ Cadastrar Fornecedor</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Create Supplier Modal */}
      <Modal
        visible={createModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setCreateModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Novo Fornecedor</Text>

            <TextInput
              style={styles.modalInput}
              value={newSupplierName}
              onChangeText={setNewSupplierName}
              placeholder="Nome do fornecedor"
              placeholderTextColor={Colors.textMuted}
              autoCapitalize="words"
              autoFocus
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancel}
                onPress={() => {
                  setCreateModalVisible(false);
                  setNewSupplierName('');
                }}
              >
                <Text style={styles.modalCancelText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.modalSave,
                  creating && styles.modalSaveDisabled,
                ]}
                onPress={handleCreateSupplier}
                disabled={creating}
              >
                {creating ? (
                  <ActivityIndicator color="#FFF" size="small" />
                ) : (
                  <Text style={styles.modalSaveText}>Salvar</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textPrimary,
    marginBottom: 6,
  },
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  selectorText: {
    fontSize: 15,
    color: Colors.textPrimary,
    flex: 1,
  },
  selectorPlaceholder: {
    color: Colors.textMuted,
  },
  arrow: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginLeft: 8,
  },
  dropdown: {
    marginTop: 4,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    maxHeight: 260,
    overflow: 'hidden',
  },
  searchInput: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    fontSize: 14,
    color: Colors.textPrimary,
  },
  listLoader: {
    paddingVertical: 16,
  },
  list: {
    maxHeight: 150,
  },
  item: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  itemSelected: {
    backgroundColor: '#F0F7FF',
  },
  itemText: {
    fontSize: 14,
    color: Colors.textPrimary,
  },
  itemTextSelected: {
    color: Colors.accent,
    fontWeight: '500',
  },
  emptyText: {
    textAlign: 'center',
    color: Colors.textMuted,
    paddingVertical: 12,
    fontSize: 13,
  },
  createButton: {
    paddingVertical: 12,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  createButtonText: {
    color: Colors.accent,
    fontWeight: '600',
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 360,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 16,
  },
  modalInput: {
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: Colors.textPrimary,
    marginBottom: 20,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  modalCancel: {
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  modalCancelText: {
    color: Colors.textSecondary,
    fontSize: 15,
  },
  modalSave: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  modalSaveDisabled: {
    opacity: 0.6,
  },
  modalSaveText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
});
