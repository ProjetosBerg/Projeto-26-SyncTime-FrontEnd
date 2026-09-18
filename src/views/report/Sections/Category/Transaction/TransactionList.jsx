// ⚙️ Bibliotecas externas
import { useEffect, useState } from 'react';
import { Edit, Trash2 } from 'lucide-react';
import { useHistory, useLocation } from 'react-router-dom';
import useFlashMessage from '../../../../../hooks/userFlashMessage';
import { useTheme } from '../../../../../hooks/useTheme';
import { useEmphasisColor } from '../../../../../hooks/useEmphasisColor';
import LoadingSpinner from '../../../../../components/loading/LoadingSpinner';
import ActionHeader from '../../../../../components/header/ActionHeader/ActionHeader';
import TableHeaderWithFilter from '../../../../../components/header/TableHeaderWithFilter/TableHeaderWithFilter';
import ConfirmModal from '../../../../../components/modal/ConfirmModal';
import styles from './TransactionList.module.css';
import TableWithDate from '../../../../../components/table/TableWithDate';
import ServiceTransactionsRecord from '../services/ServiceTransactionsRecord';
import ServiceCustomFields from '../../../../sectionConfigSystem/Sections/General/CustomFields/services/ServiceCustomFields';
import ServiceCategory from '../../../../sectionConfigSystem/Sections/Report/Category/services/ServiceCategory';
import {
  useMemorizeTableColumns,
  TABLE_CONFIG_KEYS
} from '../../../../../hooks/useMemorizeTableColumns';
import TableFooter from '../../../../../components/footer/TableFooter';
import Pagination from '../../../../../components/pagination/Pagination';

// 💅 Estilos

// 🔧 Services e Hooks

// 🧩 Componentes

const TransactionList = () => {
  const location = useLocation();
  const { monthlyRecordId, month, year, idCategory } = location.state || {};
  const history = useHistory();
  const { setFlashMessage } = useFlashMessage();
  const { theme } = useTheme();
  const { emphasisColor } = useEmphasisColor();

  const [transactionRecords, setTransactionRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState(null);
  const [activeFilters, setActiveFilters] = useState([]);
  const [status, setStatus] = useState('');
  const [recordTypeId, setRecordTypeId] = useState(null);
  const [categoryId, setCategoryId] = useState(null);
  const [customFieldsDefs, setCustomFieldsDefs] = useState([]);

  const [sortBy, setSortBy] = useState('');
  const [order, setOrder] = useState('');
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 10;

  const [categoryInfo, setCategoryInfo] = useState(null);

  useEffect(() => {
    setCurrentPage(1);
  }, [monthlyRecordId]);

  const effectiveTableKey = `${TABLE_CONFIG_KEYS.TRANSACTIONS_RECORDS}_${
    idCategory || categoryId || 'general'
  }`;
  const { getMemorizedConfig } = useMemorizeTableColumns(effectiveTableKey);

  const dados = {
    categoryId: idCategory ?? categoryId,
    recordTypeId,
    monthlyRecordId,
    month,
    year
  };

  const isFinancialCategory = () => {
    return categoryInfo?.type === 'financeiro';
  };

  const showFinancialColumns = isFinancialCategory();

  const filterColumnsBase = [
    { id: 'title', label: 'Título', type: 'text' },
    { id: 'description', label: 'Descrição', type: 'text' },
    ...(showFinancialColumns
      ? [{ id: 'amount', label: 'Valor', type: 'number' }]
      : []),
    { id: 'transaction_date', label: 'Data da Transação', type: 'date' },
    { id: 'created_at', label: 'Data de Criação', type: 'date' },
    { id: 'updated_at', label: 'Última Atualização', type: 'date' }
  ];

  const getAdjustedSortBy = (sortByParam) => {
    if (sortByParam && sortByParam.startsWith('custom_')) {
      const fieldName = sortByParam.slice(7);
      return `customFields.${fieldName}`;
    }
    return sortByParam;
  };

  const handleExport = async (format) => {
    try {
      const config = getMemorizedConfig();
      const columnOrder = (config?.columnOrder || []).filter(
        (c) => c !== 'actions'
      );
      const visibleColumns = (config?.visibleColumns || []).filter(
        (c) => c !== 'actions'
      );

      const filtersToSend = activeFilters
        .filter((filter) => filter.value && filter.value.trim() !== '')
        .map((filter) => ({
          field: filter.column,
          operator: filter.operator,
          value: filter.value,
          value2: filter.value2 || null
        }));

      const adjustedSortBy = getAdjustedSortBy(sortBy);

      const response = await ServiceTransactionsRecord.exportTransactions(
        monthlyRecordId,
        format,
        adjustedSortBy,
        order,
        filtersToSend,
        columnOrder,
        visibleColumns
      );

      const blob = new Blob([response.data], {
        type: response.headers['content-type']
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const ext = format === 'pdf' ? 'pdf' : format === 'csv' ? 'csv' : 'xlsx';
      const now = new Date();
      const formattedDate = now.toLocaleDateString('pt-BR').replace(/\//g, '-');
      a.download = `transacoes_${formattedDate}_exportacao.${ext}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setFlashMessage('Exportação realizada com sucesso', 'success');
    } catch (error) {
      console.error('Erro na exportação:', error);
      setFlashMessage('Erro na exportação', 'error');
    }
  };

  useEffect(() => {
    const fetchCategoryInfo = async () => {
      const catId = idCategory || categoryId;
      if (catId) {
        try {
          const response = await ServiceCategory.getByIdCategory(catId);
          if (response.data.status === 'OK' && response.data.data) {
            setCategoryInfo(response.data.data);
          }
        } catch (error) {
          console.error('Erro ao buscar informações da categoria:', error);
        }
      }
    };

    fetchCategoryInfo();
  }, [idCategory, categoryId]);

  useEffect(() => {
    if (recordTypeId && categoryId) {
      const fetchCustomFields = async () => {
        try {
          const response = await ServiceCustomFields.getByAllByRecordType(
            categoryId,
            recordTypeId
          );
          if (response.data.status === 'OK') {
            setCustomFieldsDefs(response.data.data);
          }
        } catch (error) {
          console.error('Erro ao buscar campos customizados:', error);
          setFlashMessage('Erro ao buscar campos customizados', 'error');
        }
      };

      fetchCustomFields();
    } else {
      setCustomFieldsDefs([]);
    }
  }, [recordTypeId, categoryId]);

  useEffect(() => {
    if (customFieldsDefs.length > 0 && transactionRecords.length > 0) {
      const firstCustom = transactionRecords[0]?.customFields;
      if (Array.isArray(firstCustom)) {
        const processed = transactionRecords.map((record) => {
          const customMap = {};
          record.customFields.forEach((cf) => {
            const def = customFieldsDefs.find(
              (d) => d.id === cf.custom_field_id
            );
            if (def) {
              const val = Array.isArray(cf.value)
                ? cf.value.join(', ')
                : cf.value;
              customMap[def.name] = val;
            }
          });
          return {
            ...record,
            customFields: customMap,
            customFieldsResult: record.customFields
          };
        });
        setTransactionRecords(processed);
      }
    }
  }, [customFieldsDefs, transactionRecords]);

  const customFilterColumns = customFieldsDefs.map((def) => ({
    id: `customFields.${def.name}`,
    label: def.label,
    type: def.type === 'multiple' ? 'text' : def.type.toLowerCase()
  }));

  const filterColumns = [...filterColumnsBase, ...customFilterColumns];

  const defaultColumns = [
    {
      key: 'title',
      label: 'Título',
      render: (row) => (
        <div className={styles.nameCell}>
          <div className={styles.title}>{row.title}</div>
        </div>
      )
    },
    {
      key: 'description',
      label: 'Descrição',
      render: (row) => row.description || '-'
    },
    ...(showFinancialColumns
      ? [
          {
            key: 'amount',
            label: 'Saldo Inicial',
            render: (row) => formatCurrency(row.amount)
          }
        ]
      : []),
    {
      key: 'transaction_date',
      label: 'Data da Transação',
      render: (row) => formatDateTime(row.transaction_date)
    }
  ];

  const customColumns = customFieldsDefs.map((def) => ({
    key: `custom_${def.name}`,
    label: def.label,
    sortable: true
  }));

  const actionsColumn = {
    key: 'actions',
    label: 'Ações',
    sortable: false,
    render: (row, idx, { onEdit, onDelete }) => (
      <div className={styles.actionsCell}>
        <button
          className={styles.editButton}
          onClick={(e) => {
            e.stopPropagation();
            onEdit(row.id);
          }}
          title="Editar registro"
          style={{
            backgroundColor: '#3b82f6'
          }}
        >
          <Edit size={16} />
        </button>
        <button
          className={styles.deleteButton}
          onClick={(e) => {
            e.stopPropagation();
            onDelete(row.id);
          }}
          title="Excluir registro"
        >
          <Trash2 size={16} />
        </button>
      </div>
    )
  };

  const columns = [...defaultColumns, ...customColumns, actionsColumn];

  useEffect(() => {
    const fetchTransactionsRecord = async () => {
      setLoading(true);
      try {
        const adjustedSortBy = getAdjustedSortBy(sortBy);
        const filtersToSend = activeFilters
          .filter((filter) => filter.value && filter.value.trim() !== '')
          .map((filter) => ({
            field: filter.column,
            operator: filter.operator,
            value: filter.value,
            value2: filter.value2 || null
          }));

        const response =
          await ServiceTransactionsRecord.getByAllTransactionsRecord(
            currentPage,
            itemsPerPage,
            adjustedSortBy,
            order,
            filtersToSend,
            monthlyRecordId
          );

        if (response.data.status === 'OK') {
          const result = response.data.data;
          setStatus(response.data.status);
          setTotalAmount(result.totalAmount);
          setTotalItems(result.pagination?.total ?? result.transactions.length);
          setTransactionRecords(
            result.transactions.map((item) => ({
              ...item.transaction,
              customFields: item.customFields
            }))
          );
          if (result.transactions.length > 0) {
            setRecordTypeId(result.transactions[0].recordTypeId);
            setCategoryId(result.transactions[0].transaction.category_id);
          } else if (currentPage > 1 && result.pagination?.totalPages > 0) {
            setCurrentPage(result.pagination.totalPages);
          } else {
            setRecordTypeId(null);
            setCategoryId(null);
          }
        }
      } catch (error) {
        console.error('Erro ao buscar registros dos registros mensais:', error);
        setFlashMessage(
          'Erro ao buscar registros dos registros mensais',
          'error'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchTransactionsRecord();
  }, [
    currentPage,
    sortBy,
    order,
    activeFilters,
    monthlyRecordId,
    refreshTrigger
  ]);

  const formatCurrency = (value) => {
    if (value === null) return '0,00';
    return (
      new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      }).format(value || 0) || '0,00'
    );
  };

  const formatDateTime = (date) =>
    date ? new Date(`${date}T00:00:00`).toLocaleDateString('pt-BR') : '-';

  const handleSort = (key, direction) => {
    setCurrentPage(1);
    setSortBy(direction ? key : '');
    setOrder(direction || '');
  };

  const handleEdit = (recordId) => {
    history.push(`/relatorios/categoria/transações/form/${recordId}`, {
      dados
    });
  };

  const handleDeleteRecord = async () => {
    if (!transactionToDelete) return;

    try {
      setIsDeleting(true);
      await ServiceTransactionsRecord.deleteTransactionsRecord(
        transactionToDelete
      );
      setFlashMessage('Registro mensal excluído com sucesso', 'success');
      if (transactionRecords.length === 1 && currentPage > 1) {
        setCurrentPage((page) => page - 1);
      } else {
        setRefreshTrigger((trigger) => trigger + 1);
      }
    } catch (error) {
      console.error('Erro ao excluir registro mensal:', error);
      setFlashMessage('Erro ao excluir registro mensal', 'error');
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
      setTransactionToDelete(null);
    }
  };

  const handleDelete = (recordId) => {
    setTransactionToDelete(recordId);
    setShowDeleteModal(true);
  };

  const handleBack = () => {
    history.push(
      `/relatorios/categoria/relatorio-mesal/${categoryId || idCategory}`
    );
  };

  const handleCreate = async () => {
    let updatedDados = { ...dados };

    if (!updatedDados.recordTypeId) {
      try {
        const response = await ServiceCategory.getByIdCategory(
          updatedDados.categoryId
        );
        console.log('response berg', response);

        if (response.data.status === 'OK' && response.data.data) {
          updatedDados.recordTypeId = response.data.data.record_type_id;

          setRecordTypeId(updatedDados.recordTypeId);
        } else {
          setFlashMessage(
            'Nenhum tipo de registro disponível para esta categoria.',
            'error'
          );
          return;
        }
      } catch (error) {
        console.error('Erro ao buscar tipo de registro:', error);
        setFlashMessage(
          'Erro ao carregar configurações para criar transação',
          'error'
        );
        return;
      }
    }

    history.push('/relatorios/categoria/transações/form', {
      dados: updatedDados
    });
  };
  const handleSelectionChange = (selectedItems) => {
    console.log('Itens selecionados:', selectedItems);
  };

  const handleFiltersChange = (filters) => {
    setCurrentPage(1);
    setActiveFilters(filters);
  };

  const createTransactionRecord = async (data) => {
    try {
      await ServiceTransactionsRecord.createTransactionsRecord(data);
      setFlashMessage('Transação criada com sucesso', 'success');
      setRefreshTrigger((prev) => prev + 1);
    } catch (error) {
      console.error('Erro ao criar transação:', error);
      setFlashMessage('Erro ao criar transação', 'error');
      throw error;
    }
  };

  const editTransactionRecord = async (id, data) => {
    try {
      await ServiceTransactionsRecord.editTransactionsRecord(id, data);
      setFlashMessage('Transação atualizada com sucesso', 'success');
      setRefreshTrigger((prev) => prev + 1);
    } catch (error) {
      console.error('Erro ao editar transação:', error);
      setFlashMessage('Erro ao editar transação', 'error');
      throw error;
    }
  };

  const sortConfig = sortBy
    ? { key: sortBy, direction: order }
    : { key: null, direction: null };
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  if (loading && transactionRecords.length === 0 && !status) {
    return (
      <LoadingSpinner message="Carregando registros dos registros mensais..." />
    );
  }

  return (
    <div className={`${styles.container} ${styles[theme]}`}>
      <ActionHeader
        onBack={handleBack}
        onCreate={handleCreate}
        backButtonLabel="Voltar"
        createButtonLabel="Novo Registro"
      />

      <TableHeaderWithFilter
        title="Transações"
        columns={filterColumns}
        onFiltersChange={handleFiltersChange}
        isExportacao={true}
        onExport={handleExport}
      />

      {transactionRecords.length === 0 && !loading ? (
        <div className={`${styles.emptyState} ${styles[theme]}`}>
          <p>Nenhum registros dos registro mensal encontrado.</p>
          <button
            onClick={handleCreate}
            className={styles.emptyStateButton}
            style={{
              backgroundColor:
                emphasisColor ||
                (theme === 'dark' ? 'rgb(20, 18, 129)' : '#007bff')
            }}
          >
            Criar primeiro registro
          </button>
        </div>
      ) : (
        <>
          <TableWithDate
            columns={columns}
            data={transactionRecords}
            selectable={false}
            reorderable={true}
            onSelectionChange={handleSelectionChange}
            onEdit={handleEdit}
            onDelete={handleDelete}
            sortConfig={sortConfig}
            onSort={handleSort}
            groupBy="date"
            month={month}
            year={year}
            dados={dados}
            onCreateRecord={createTransactionRecord}
            onUpdateRecord={editTransactionRecord}
            tableKey={TABLE_CONFIG_KEYS.TRANSACTIONS_RECORDS}
          />
          <TableFooter
            numRecords={totalItems}
            totalAmount={showFinancialColumns ? totalAmount : undefined}
          />
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
          />
        </>
      )}

      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setTransactionToDelete(null);
        }}
        onConfirm={handleDeleteRecord}
        title="Confirmar exclusão"
        message="Tem certeza que deseja excluir este registro dos registro mensal? Esta ação não pode ser desfeita e todas as transações associadas também serão removidas."
        confirmText="Sim, excluir"
        cancelText="Cancelar"
        danger={true}
        loading={isDeleting}
      />
    </div>
  );
};

export default TransactionList;
